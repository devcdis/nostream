import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IMerchantRepository } from '../../@types/repositories'

const debug = createLogger('accept-merchant-request-controller')

export class AcceptMerchantRequestController implements IController {
  public constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
        const { pubkey, approvedTill, balance } = request.params
        await this.merchantRepository.acceptRequest(pubkey, new Date(approvedTill), Number(balance))

        response
          .status(200)
          .setHeader('content-type', 'text/plain; charset=utf8')
          .send(pubkey)
    //   const relays = await this.relayRepository.findAllRelays()
    //   response
    //     .status(200)
    //     .setHeader('content-type', 'text/plain; charset=utf8')
    //     .send(relays)
    //   return
    } catch (error) {
      debug('Failed to accept merchant request with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send('Error occurred on our server while accepting merchant request.')
      return
    }
  }
}
