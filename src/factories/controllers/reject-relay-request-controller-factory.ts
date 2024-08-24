import { getMasterDbClient } from '../../database/client'
import { RejectRelayRequestController } from '../../controllers/relay-requests/reject-relay-request-controller'
import { RelayRequestRepository } from '../../repositories/relay-requests-repository'

export const createRejectRelayRequestController = () => {
    const dbClient = getMasterDbClient()
    const relayRequestsRepository = new RelayRequestRepository(dbClient)

    return new RejectRelayRequestController(relayRequestsRepository)
}
