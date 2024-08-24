import { getMasterDbClient } from '../../database/client'
import { MerchantRepository } from '../../repositories/merchant-repository'
import { RejectMerchantRequestController } from '../../controllers/merchants/reject-merchant-request-controller'

export const createRejectMerchantRequestController = () => {
    const dbClient = getMasterDbClient()
    const merchantRepository = new MerchantRepository(dbClient)
    return new RejectMerchantRequestController(merchantRepository)
}