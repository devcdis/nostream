import { IEventRepository, IMerchantRepository, IRelayRequestRepository } from '../@types/repositories'
import { isDeleteEvent, isEphemeralEvent, isParameterizedReplaceableEvent, isReplaceableEvent } from '../utils/event'
import { DefaultEventStrategy } from '../handlers/event-strategies/default-event-strategy'
import { DeleteEventStrategy } from '../handlers/event-strategies/delete-event-strategy'
import { EphemeralEventStrategy } from '../handlers/event-strategies/ephemeral-event-strategy'
import { Event } from '../@types/event'
import { EventKinds } from '../constants/base'
import { Factory } from '../@types/base'
import { IEventStrategy } from '../@types/message-handlers'
import { IWebSocketAdapter } from '../@types/adapters'
import { ParameterizedReplaceableEventStrategy } from '../handlers/event-strategies/parameterized-replaceable-event-strategy'
import { ReplaceableEventStrategy } from '../handlers/event-strategies/replaceable-event-strategy'
import { RostrEventStrategy9000 } from '../handlers/event-strategies/rostr-event-strategy-9000'
import { RostrEventStrategy9001 } from '../handlers/event-strategies/rostr-event-strategy-9001'

export const eventStrategyFactory = (
  eventRepository: IEventRepository,
  merchantRepository: IMerchantRepository,
  relayRequestRepository: IRelayRequestRepository,
): Factory<IEventStrategy<Event, Promise<void>>, [Event, IWebSocketAdapter]> =>
  ([event, adapter]: [Event, IWebSocketAdapter]) => {
    if (event.kind == EventKinds.RELAY_REQUEST) {
      return new RostrEventStrategy9000(adapter, eventRepository, relayRequestRepository)
    } else if (event.kind == EventKinds.MERCHANT_REQUEST) {
      return new RostrEventStrategy9001(adapter, eventRepository, merchantRepository)
    } else if (isReplaceableEvent(event)) {
      return new ReplaceableEventStrategy(adapter, eventRepository)
    } else if (isEphemeralEvent(event)) {
      return new EphemeralEventStrategy(adapter)
    } else if (isDeleteEvent(event)) {
      return new DeleteEventStrategy(adapter, eventRepository)
    } else if (isParameterizedReplaceableEvent(event)) {
      return new ParameterizedReplaceableEventStrategy(adapter, eventRepository)
    } 

    return new DefaultEventStrategy(adapter, eventRepository)
  }
