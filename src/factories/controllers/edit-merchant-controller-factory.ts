import { EditMerchantController } from '../../controllers/merchants/edit-merchant-controller'
import { getMasterDbClient } from '../../database/client'
import { MerchantRepository } from '../../repositories/merchant-repository'

export const createEditMerchantController = () => {
    const dbClient = getMasterDbClient()
    const merchantRepository = new MerchantRepository(dbClient)
    return new EditMerchantController(merchantRepository)
}