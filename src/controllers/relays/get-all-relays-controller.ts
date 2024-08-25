import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IRelayRepository } from '../../@types/repositories'

const debug = createLogger('get-all-relays-controller')

export class GetAllRelaysController implements IController {
  public constructor(private readonly relayRepository: IRelayRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
      const relays = await this.relayRepository.findAllRelays()
      response
        .status(200)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send(relays)
      return
    } catch (error) {
      debug('Failed to fetch relays with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send('Error occurred on our server while fetching relays.')
      return
    }
  }
}
