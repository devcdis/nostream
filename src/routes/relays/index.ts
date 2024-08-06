import { Router, urlencoded } from 'express'

import { getAllRelaysController } from '../../factories/controllers/get-all-relays-controller-factory'
import { postRelayController } from '../../factories/controllers/post-relay-controller-factory'
import { withController } from '../../handlers/request-handlers/with-controller-request-handler'

const relayRouter = Router()

relayRouter
  .get('/', withController(getAllRelaysController))
  .post('/', urlencoded({ extended: true }), withController(postRelayController))

export default relayRouter