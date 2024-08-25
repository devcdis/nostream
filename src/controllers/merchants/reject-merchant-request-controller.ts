import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IMerchantRepository } from '../../@types/repositories'

const debug = createLogger('reject-merchant-request-controller')

export class RejectMerchantRequestController implements IController {
  public constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
        const { pubkey } = request.params
        await this.merchantRepository.rejectRequest(pubkey)
        response
          .status(200)
          .setHeader('content-type', 'application/json; charset=utf8')
          .send({id:pubkey})
    } catch (error) {
      debug('Failed to reject merchant request with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send('Error occurred on our server while rejecting merchant request.')
      return
    }
  }
}
