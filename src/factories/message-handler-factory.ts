import { IEventRepository, IMerchantRepository, IRelayRequestRepository, IUserRepository } from '../@types/repositories'
import { IncomingMessage, MessageType } from '../@types/messages'
import { createSettings } from './settings-factory'
import { EventMessageHandler } from '../handlers/event-message-handler'
import { eventStrategyFactory } from './event-strategy-factory'
import { IWebSocketAdapter } from '../@types/adapters'
import { RelayRepository } from '../repositories/relay-repository'
import { slidingWindowRateLimiterFactory } from './rate-limiter-factory'
import { SubscribeMessageHandler } from '../handlers/subscribe-message-handler'
import { UnsubscribeMessageHandler } from '../handlers/unsubscribe-message-handler'

export const messageHandlerFactory = (
  eventRepository: IEventRepository,
  userRepository: IUserRepository,
  relayRequestRepository: IRelayRequestRepository,
  merchantRepository: IMerchantRepository,
  relayRepository: RelayRepository,
) => ([message, adapter]: [IncomingMessage, IWebSocketAdapter]) => {
  switch (message[0]) {
    case MessageType.EVENT:
      {
        return new EventMessageHandler(
          adapter,
          eventStrategyFactory(eventRepository, merchantRepository, relayRequestRepository),
          userRepository,
          createSettings,
          slidingWindowRateLimiterFactory,
        )
      }
    case MessageType.REQ:
      return new SubscribeMessageHandler(adapter, eventRepository, merchantRepository, relayRepository, createSettings)
    case MessageType.CLOSE:
      return new UnsubscribeMessageHandler(adapter)
    default:
      throw new Error(`Unknown message type: ${String(message[0]).substring(0, 64)}`)
  }
}
