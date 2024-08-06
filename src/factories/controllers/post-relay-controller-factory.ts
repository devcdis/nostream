import { CreateRelaysController } from '../../controllers/relays/create-relay-controller'
import { getMasterDbClient } from '../../database/client'
import { RelayRepository } from '../../repositories/relay-repository'

export const postRelayController = () => {
    const dbClient = getMasterDbClient()
    const relayRepository = new RelayRepository(dbClient)

    return new CreateRelaysController(relayRepository)
}
