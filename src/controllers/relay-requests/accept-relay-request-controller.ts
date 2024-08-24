import { IRelayRepository, IRelayRequestRepository } from '../../@types/repositories'
import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { relayFromRelayRequest } from '../../utils/transform'

const debug = createLogger('accept-relay-request-controller')

export class AcceptRelayRequestController implements IController {
  public constructor(private readonly relayRequestRepository: IRelayRequestRepository, 
    private readonly relayRepository: IRelayRepository,) { }

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
      const { pubkey } = request.params
      await this.relayRequestRepository.acceptRelayRequest(pubkey)
      const relayRequest = await this.relayRequestRepository.findByPubkey(pubkey)
      const relay = relayFromRelayRequest(relayRequest)
      await this.relayRepository.upsert(relay)
      response
        .status(200)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send(pubkey)
      //   const relays = await this.relayRepository.findAllRelays()
      //   response
      //     .status(200)
      //     .setHeader('content-type', 'text/plain; charset=utf8')
      //     .send(relays)
      //   return
    } catch (error) {
      debug('Failed to accept relay with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send('Error occurred on our server while accepting relay request.')
      return
    }
  }
}
