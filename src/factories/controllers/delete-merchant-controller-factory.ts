import { DeleteMerchantController } from '../../controllers/merchants/delete-merchant-controller'
import { getMasterDbClient } from '../../database/client'
import { MerchantRepository } from '../../repositories/merchant-repository'

export const createDeleteMerchantController = () => {
    const dbClient = getMasterDbClient()
    const merchantRepository = new MerchantRepository(dbClient)
    return new DeleteMerchantController(merchantRepository)
}