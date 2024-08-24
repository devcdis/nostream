import { GetAllMerchantsController } from '../../controllers/merchants/get-all-merchants-controller'
import { getMasterDbClient } from '../../database/client'
import { MerchantRepository } from '../../repositories/merchant-repository'

export const createGetAllMerchantsController = () => {
    const dbClient = getMasterDbClient()
    const merchantRepository = new MerchantRepository(dbClient)
    return new GetAllMerchantsController(merchantRepository)
}