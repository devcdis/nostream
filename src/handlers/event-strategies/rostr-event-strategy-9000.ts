import { IEventRepository, IRelayRequestRepository } from '../../@types/repositories'
import { createCommandResult } from '../../utils/messages'
import { createLogger } from '../../factories/logger-factory'
import { Event } from '../../@types/event'
import { IEventStrategy } from '../../@types/message-handlers'
import { IWebSocketAdapter } from '../../@types/adapters'
import { Pubkey } from '../../@types/base'
import { RelayRequest } from '../../@types/relay-request'
import { WebSocketAdapterEvent } from '../../constants/adapter'

const debug = createLogger('rostr-event-strategy-9000')

export class RostrEventStrategy9000 implements IEventStrategy<Event, Promise<void>> {
    public constructor(
        private readonly webSocket: IWebSocketAdapter,
        private readonly eventRepository: IEventRepository,
        private readonly relayRequestRepository: IRelayRequestRepository
    ) { }

    public async execute(event: Event): Promise<void> {
        debug('received relay request event: %o', event)
        try {
            await this.eventRepository.upsert(event)
            const content = JSON.parse(event.content)
            const currentRelayRequest = await this.relayRequestRepository.findByPubkey(content['pubkey'])
            if(currentRelayRequest) {
                const newRelayRequest = currentRelayRequest
                
                newRelayRequest.senderPubkey.indexOf(content['pubkey']) === -1 ? newRelayRequest.senderPubkey.push(content['pubkey']) :
                newRelayRequest.senderPubkey.concat(content['senderPubkey'])
                this.relayRequestRepository.upsert(newRelayRequest)
            } else {
                const newRelayRequest: RelayRequest = {
                    pubkey: content['pubkey'],
                    senderPubkey: [content['pubkey']] as Pubkey[],
                    name: content['name'],
                    url: content['url'],
                    pricing: content['pricing'],
                    description: content['description'],
                    contactDetails: content['contactDetails'],
                    latitude: content['latitude'],
                    longitude: content['longitude'],
                    locationFormat: content['locationFormat'],
                    approvedAt: undefined,
                    declinedAt: undefined,
                }
                await this.relayRequestRepository.upsert(newRelayRequest)
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
              if (error.message.endsWith('duplicate key value violates unique constraint "events_event_id_unique"')) {
                this.webSocket.emit(
                  WebSocketAdapterEvent.Message,
                  createCommandResult(event.id, false, 'rejected: event already exists'),
                )
                return
              }
      
              this.webSocket.emit(
                WebSocketAdapterEvent.Message,
                createCommandResult(event.id, false, 'error: '),
              )
            }
          }
    } 
}