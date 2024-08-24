import { DeleteRelayController } from '../../controllers/relays/delete-relay-controller'
import { getMasterDbClient } from '../../database/client'
import { RelayRepository } from '../../repositories/relay-repository'

export const createDeleteRelayController = () => {
    const dbClient = getMasterDbClient()
    const relayRepository = new RelayRepository(dbClient)

    return new DeleteRelayController(relayRepository)
}
