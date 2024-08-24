import { AcceptRelayRequestController } from '../../controllers/relay-requests/accept-relay-request-controller'
import { getMasterDbClient } from '../../database/client'
import { RelayRepository } from '../../repositories/relay-repository'
import { RelayRequestRepository } from '../../repositories/relay-requests-repository'

export const createAcceptRelayRequestController = () => {
    const dbClient = getMasterDbClient()
    const relayRequestRepository = new RelayRequestRepository(dbClient)
    const relayRepository = new RelayRepository(dbClient)
    return new AcceptRelayRequestController(relayRequestRepository, relayRepository)
}