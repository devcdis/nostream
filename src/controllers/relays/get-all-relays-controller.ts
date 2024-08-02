import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IRelayRepository } from '../../@types/repositories'

const debug = createLogger('get-all-relays-controller')

export class GetAllRelaysController implements IController {
  public constructor(private readonly relayRepository: IRelayRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)
    debug('request body: %o', request.body)

    // TODO: add request body validation
    // const body = request.body
    // if (!body || typeof body !== 'object' || 
    //typeof body.payment_hash !== 'string' || body.payment_hash.length !== 64) {
    //   response
    //     .status(400)
    //     .setHeader('content-type', 'text/plain; charset=utf8')
    //     .send('Malformed body')
    //   return
    // }

    try {
      const relays = await this.relayRepository.findAllRelays()
      response
        .status(200)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send(relays)
      return
    } catch (error) {
      debug('Failed to fetch relays with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send('Error occurred on our server while fetching relays.')
      return
    }
  }
}
