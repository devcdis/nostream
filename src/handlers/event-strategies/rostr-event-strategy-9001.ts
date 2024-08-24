import { IEventRepository, IMerchantRepository } from '../../@types/repositories'
import { createCommandResult } from '../../utils/messages'
import { createLogger } from '../../factories/logger-factory'
import { Event } from '../../@types/event'
import { IEventStrategy } from '../../@types/message-handlers'
import { IWebSocketAdapter } from '../../@types/adapters'
import { Merchant } from '../../@types/merchant'
import { WebSocketAdapterEvent } from '../../constants/adapter'

const debug = createLogger('rostr-event-strategy-9001')

export class RostrEventStrategy9001 implements IEventStrategy<Event, Promise<void>> {
    public constructor(
        private readonly webSocket: IWebSocketAdapter,
        private readonly eventRepository: IEventRepository,
        private readonly merchantRepository: IMerchantRepository
    ) { }

    public async execute(event: Event): Promise<void> {
        debug('received merchant request event: %o', event)
        try {
            await this.eventRepository.upsert(event)
            const content = JSON.parse(event.content)
            
            const newMerchantRequest: Merchant = {
                pubkey: event.pubkey,
                name: content['name'],
                description: content['description'],
                pricing: content['pricing'],
                contact_details: content['contact_details'],
                latitude: content['latitude'],
                longitude: content['longitude'],
                balance: 0,
                advertisedOn: null,
                approvedTill: null,
            }

            await this.merchantRepository.upsert(newMerchantRequest)
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