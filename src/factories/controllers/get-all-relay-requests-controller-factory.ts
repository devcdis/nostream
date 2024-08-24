import { GetAllRelayRequestsController } from '../../controllers/relay-requests/get-all-relay-requests-controller'
import { getMasterDbClient } from '../../database/client'
import { RelayRequestRepository } from '../../repositories/relay-requests-repository'

export const createGetAllRelayRequestsController = () => {
    const dbClient = getMasterDbClient()
    const relayRequestsRepository = new RelayRequestRepository(dbClient)

    return new GetAllRelayRequestsController(relayRequestsRepository)
}
