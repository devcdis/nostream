import { createDeleteRelayController } from '../../factories/controllers/delete-relay-controller-factory'
import { createGetAllRelaysController } from '../../factories/controllers/get-all-relays-controller-factory'
import express from 'express'
import { Router } from 'express'
import { withController } from '../../handlers/request-handlers/with-controller-request-handler'

const relayRouter = Router()
relayRouter
  .use(express.json())
  .get('/', withController(createGetAllRelaysController))
  .delete('/:pubkey', withController(createDeleteRelayController))


// relayRouter
//   .get('/', withController(getAllRelaysController))
//   .post('/', urlencoded({ extended: true }), withController(postRelayController))

export default relayRouter