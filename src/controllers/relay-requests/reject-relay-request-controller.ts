import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IRelayRequestRepository } from '../../@types/repositories'

const debug = createLogger('reject-relay-request-controller')

export class RejectRelayRequestController implements IController {
  public constructor(private readonly relayRequestRepository: IRelayRequestRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
        const { pubkey } = request.params
        await this.relayRequestRepository.rejectRelayRequest(pubkey)
        response
          .status(200)
          .setHeader('content-type', 'application/json; charset=utf8')
          .send({id: pubkey})
    //   const relays = await this.relayRepository.findAllRelays()
    //   response
    //     .status(200)
    //     .setHeader('content-type', 'text/plain; charset=utf8')
    //     .send(relays)
    //   return
    } catch (error) {
      debug('Failed to reject relay with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send('Error occurred on our server while rejecting relay.')
      return
    }
  }
}
