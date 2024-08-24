import { getMasterDbClient, getReadReplicaDbClient } from '../database/client'
import { is, path, pathSatisfies } from 'ramda'
import { AutoAcceptRelayRequestWorker } from '../app/auto-accept-relay-request-worker'
import { createSettings } from './settings-factory'
import { createWebApp } from './web-app-factory'
import { EventRepository } from '../repositories/event-repository'
import http from 'http'
import { MerchantRepository } from '../repositories/merchant-repository'
import process from 'process'
import { RelayRepository } from '../repositories/relay-repository'
import { RelayRequestRepository } from '../repositories/relay-requests-repository'
import { UserRepository } from '../repositories/user-repository'
import { webSocketAdapterFactory } from './websocket-adapter-factory'
import { WebSocketServer } from 'ws'
import { WebSocketServerAdapter } from '../adapters/web-socket-server-adapter'


export const autoAcceptRelayRequestsFactory = (): AutoAcceptRelayRequestWorker => {
  const dbClient = getMasterDbClient()
  const readReplicaDbClient = getReadReplicaDbClient()
  const eventRepository = new EventRepository(dbClient, readReplicaDbClient)
  const userRepository = new UserRepository(dbClient)
  const merchantRepository = new MerchantRepository(dbClient)
  const relayRepository = new RelayRepository(dbClient)
  const relayRequestRepository = new RelayRequestRepository(dbClient)

  const settings = createSettings()

  const app = createWebApp()

  // deepcode ignore HttpToHttps: we use proxies
  const server = http.createServer(app)

  let maxPayloadSize: number | undefined
  if (pathSatisfies(is(String), ['network', 'max_payload_size'], settings)) {
    console.warn(`WARNING: Setting network.max_payload_size is deprecated and will be removed in a future version.
        Use network.maxPayloadSize instead.`)
    maxPayloadSize = path(['network', 'max_payload_size'], settings)
  } else {
    maxPayloadSize = path(['network', 'maxPayloadSize'], settings)
  }

  const webSocketServer = new WebSocketServer({
    server,
    maxPayload: maxPayloadSize ?? 131072, // 128 kB
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed if context takeover is disabled.
    },
  })
  const adapter = new WebSocketServerAdapter(
    server,
    webSocketServer,
    webSocketAdapterFactory(eventRepository, userRepository, relayRequestRepository, 
      merchantRepository, relayRepository),
    createSettings,
  )

  
  return new AutoAcceptRelayRequestWorker(process, 
    relayRequestRepository, 
    relayRepository, 
    dbClient, 
    adapter, 
    createSettings)
}
