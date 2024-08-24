import { GetAllRelaysController } from '../../controllers/relays/get-all-relays-controller'
import { getMasterDbClient } from '../../database/client'
import { RelayRepository } from '../../repositories/relay-repository'

export const createGetAllRelaysController = () => {
    const dbClient = getMasterDbClient()
    const relayRepository = new RelayRepository(dbClient)

    return new GetAllRelaysController(relayRepository)
}
