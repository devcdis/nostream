import * as secp256k1 from '@noble/secp256k1'
import { DatabaseClient, IRunnable } from '../@types/base'
import { IRelayRepository, IRelayRequestRepository } from '../@types/repositories'
import { createHash } from 'crypto'
import { createLogger } from '../factories/logger-factory'
import { Event } from '../@types/event'
import { EventKinds } from '../constants/base'
import { IWebSocketServerAdapter } from '../@types/adapters'
import { serializeEvent } from '../utils/event'
import { Settings } from '../@types/settings'
import WebSocket from 'ws'

const AUTO_ACCEPT_REQUEST_INTERVAL = 60000

const debug = createLogger('maintenance-worker')
export async function createEvent(input: Partial<Event>, privkey: any): Promise<Event> {
  const event: Event = {
    pubkey: input.pubkey,
    kind: input.kind,
    created_at: input.created_at,
    content: input.content ?? '',
    tags: input.tags ?? [],
  } as any

  const id = createHash('sha256').update(
    Buffer.from(JSON.stringify(serializeEvent(event)))
  ).digest().toString('hex')

  const sig = Buffer.from(
    secp256k1.schnorr.signSync(id, privkey)
  ).toString('hex')

  event.id = id
  event.sig = sig

  return event
}


export class AutoAcceptRelayRequestWorker implements IRunnable {
  private interval: NodeJS.Timer | undefined

  public constructor(
    private readonly process: NodeJS.Process,
    private readonly relayRequestsRepository: IRelayRequestRepository,
    private readonly relayRepository: IRelayRepository,
    private readonly dbClient: DatabaseClient,
    private readonly adapter: IWebSocketServerAdapter,
    private readonly settings: () => Settings
  ) {
    this.process
      .on('SIGINT', this.onExit.bind(this))
      .on('SIGHUP', this.onExit.bind(this))
      .on('SIGTERM', this.onExit.bind(this))
      .on('uncaughtException', this.onError.bind(this))
      .on('unhandledRejection', this.onError.bind(this))
  }

  public run(): void {
    this.interval = setInterval(() => this.onSchedule(), AUTO_ACCEPT_REQUEST_INTERVAL)

    const port = process.env.PORT || process.env.RELAY_PORT || 8008
    this.adapter.listen(typeof port === 'number' ? port : Number(port))
  }

  private async onSchedule(): Promise<void> {
    const currentSettings = this.settings()
    

    const requests = await this.relayRequestsRepository.findAllRelayRequests()
    debug('found %d pending relay requests', requests.length)

    // find all relay requests which are created 24 hours earlier
    const before24Hours = new Date()
    before24Hours.setHours(before24Hours.getHours() - 24)
    const accepts = requests.filter(item => item.createdAt.getTime() > before24Hours.getTime())

    
    let successful = 0

    // Fetch list of relays establish connection with first 1000 relays
    const relays = (await this.relayRepository.findAllRelays(this.dbClient)).slice(0, 1000)
    const conns = (await Promise.all(relays.map(relay => new Promise<WebSocket|null>((resolve, _) => {
      const ws = new WebSocket(relay.url, { perMessageDeflate: true })
      ws.on('error', () => resolve(null))
      ws.on('open', () => resolve(ws))
    })))).filter(Boolean)

    
    for (const request of accepts) {
      try {
        // accept relay request
        debug('accepting relay request with pubkey: %s: %o', request.pubkey, request)
        await this.relayRequestsRepository.acceptRelayRequest(request.pubkey, this.dbClient)
        debug('accepted relay request with pubkey %s: %o', request.pubkey, request)

        // prepare data to sent to other relay
        const data = {...request}
        Reflect.deleteProperty(data, 'senderPubkey')
        Reflect.deleteProperty(data, 'approvedAt')
        Reflect.deleteProperty(data, 'declinedAt')
        
        // send event to all connected relays
        conns.forEach(conn => conn.send(createEvent({
          pubkey: currentSettings.info.pubkey,
          content: JSON.stringify([data]),
          tags: [],
          kind: EventKinds.RELAY_REQUEST,
          created_at: new Date().getTime(),
        }, currentSettings.info.privatekey)))

        successful++
      } catch (error) {
        console.error('Unable to accept relay request. Reason:', error)
      }

      debug('updated %d of %d relay requests successfully', successful, requests.length)
    }
  }

  private onError(error: Error) {
    debug('error: %o', error)
    throw error
  }

  private onExit() {
    debug('exiting')
    this.close(() => {
      this.process.exit(0)
    })
  }

  public close(callback?: () => void) {
    debug('closing')
    clearInterval(this.interval)
    if (typeof callback === 'function') {
      callback()
    }
    this.adapter.close(callback)
    debug('closed')
  }
}
