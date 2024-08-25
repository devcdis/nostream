import express from 'express'

import { nodeinfo21Handler, nodeinfoHandler } from '../handlers/request-handlers/nodeinfo-handler'
import admissionRouter from './admissions'
import callbacksRouter from './callbacks'
import { getHealthRequestHandler } from '../handlers/request-handlers/get-health-request-handler'
import { getTermsRequestHandler } from '../handlers/request-handlers/get-terms-request-handler'
import invoiceRouter from './invoices'
import merchantRouter from './merchants'
import { rateLimiterMiddleware } from '../handlers/request-handlers/rate-limiter-middleware'
import relayRequestRouter from './relay-requests'
import relayRouter from './relays'
import { rootRequestHandler } from '../handlers/request-handlers/root-request-handler'

const router = express.Router()
router.get('/', rootRequestHandler)
router.get('/healthz', getHealthRequestHandler)
router.get('/terms', getTermsRequestHandler)

router.get('/.well-known/nodeinfo', nodeinfoHandler)
router.get('/nodeinfo/2.1', nodeinfo21Handler)
router.get('/nodeinfo/2.0', nodeinfo21Handler)

router.use('/invoices', rateLimiterMiddleware, invoiceRouter)
router.use('/admissions', rateLimiterMiddleware, admissionRouter)
router.use('/callbacks', rateLimiterMiddleware, callbacksRouter)
router.use('/relays', rateLimiterMiddleware, relayRouter)
router.use('/relay-requests', rateLimiterMiddleware, relayRequestRouter)
router.use('/merchants', rateLimiterMiddleware, merchantRouter)

export default router
