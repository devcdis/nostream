import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IRelayRequestRepository } from '../../@types/repositories'

const debug = createLogger('get-all-relay-requests-controller')

export class GetAllRelayRequestsController implements IController {
  public constructor(private readonly relayRequestRepository: IRelayRequestRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
      const relays = await this.relayRequestRepository.findAllRelayRequests()
      response
        .status(200)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send(relays)
      return
    } catch (error) {
      debug('Failed to fetch relay requests with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send('Error occurred on our server while fetching relay requests.')
      return
    }
  }
}
