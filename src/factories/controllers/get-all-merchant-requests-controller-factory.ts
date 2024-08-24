import { GetAllMerchantRequestsController } from '../../controllers/merchants/get-all-merchant-requests'
import { getMasterDbClient } from '../../database/client'
import { MerchantRepository } from '../../repositories/merchant-repository'

export const createGetAllMerchantRequestsController = () => {
    const dbClient = getMasterDbClient()
    const merchantRepository = new MerchantRepository(dbClient)
    return new GetAllMerchantRequestsController(merchantRepository)
}