import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IMerchantRepository } from '../../@types/repositories'

const debug = createLogger('get-all-merchants-controller')

export class GetAllMerchantsController implements IController {
  public constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
      const merchants = await this.merchantRepository.findAllApproved()
      response
        .status(200)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send(merchants)
      return
    } catch (error) {
      debug('Failed to fetch merchants with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'text/plain; charset=utf8')
        .send('Error occurred on our server while fetching merchants.')
      return
    }
  }
}
