import { createAcceptRelayRequestController } from '../../factories/controllers/accept-relay-request-controller-factory'
import { createGetAllRelayRequestsController } from '../../factories/controllers/get-all-relay-requests-controller-factory'
import { createRejectRelayRequestController } from '../../factories/controllers/reject-relay-request-controller-factory'
import { Router } from 'express'
import { withController } from '../../handlers/request-handlers/with-controller-request-handler'


const relayRequestRouter = Router()

relayRequestRouter
  .get('/', withController(createGetAllRelayRequestsController))
  .post('', withController(createRejectRelayRequestController))
  .post('', withController(createAcceptRelayRequestController))


// relayRouter
//   .get('/', withController(getAllRelaysController))
//   .post('/', urlencoded({ extended: true }), withController(postRelayController))

export default relayRequestRouter