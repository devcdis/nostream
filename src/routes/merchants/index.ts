import { createAcceptMerchantRequestController } from '../../factories/controllers/accept-merchant-request-controller-factory'
import { createDeleteMerchantController } from '../../factories/controllers/delete-merchant-controller-factory'
import { createEditMerchantController } from '../../factories/controllers/edit-merchant-controller-factory'
import { createGetAllMerchantRequestsController } from '../../factories/controllers/get-all-merchant-requests-controller-factory'
import { createGetAllMerchantsController } from '../../factories/controllers/get-all-merchants-controller-factory'
import { createRejectMerchantRequestController } from '../../factories/controllers/reject-merchant-request-controller-factory'
import express from 'express'
import { Router } from 'express'
import { withController } from '../../handlers/request-handlers/with-controller-request-handler'

const merchantRouter = Router()

merchantRouter
  .use(express.json())
  .get('/', withController(createGetAllMerchantsController))
  .delete('/:pubkey', withController(createDeleteMerchantController))
  .post('/', withController(createEditMerchantController))
  .get('/requests', withController(createGetAllMerchantRequestsController))
  .post('/accept', withController(createAcceptMerchantRequestController))
  .post('/decline/:pubkey', withController(createRejectMerchantRequestController))



// relayRouter
//   .get('/', withController(getAllRelaysController))
//   .post('/', urlencoded({ extended: true }), withController(postRelayController))

export default merchantRouter