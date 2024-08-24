import { AcceptMerchantRequestController } from '../../controllers/merchants/accept-merchant-request-controller'
import { getMasterDbClient } from '../../database/client'
import { MerchantRepository } from '../../repositories/merchant-repository'

export const createAcceptMerchantRequestController = () => {
    const dbClient = getMasterDbClient()
    const merchantRepository = new MerchantRepository(dbClient)
    return new AcceptMerchantRequestController(merchantRepository)
}