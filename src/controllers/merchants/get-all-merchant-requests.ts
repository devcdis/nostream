import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IMerchantRepository } from '../../@types/repositories'

const debug = createLogger('get-all-merchant-requests-controller')

export class GetAllMerchantRequestsController implements IController {
  public constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
      const merchantRequests = await this.merchantRepository.findAllRequests()
      response
        .status(200)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send(merchantRequests)
      return
    } catch (error) {
      debug('Failed to fetch merchant requests with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send('Error occurred on our server while fetching merchant requests.')
      return
    }
  }
}
