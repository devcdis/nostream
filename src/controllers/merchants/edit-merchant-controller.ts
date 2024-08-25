import { Request, Response } from 'express'

import { createLogger } from '../../factories/logger-factory'
import { IController } from '../../@types/controllers'
import { IMerchantRepository } from '../../@types/repositories'

const debug = createLogger('edit-merchant-controller')

export class EditMerchantController implements IController {
  public constructor(private readonly merchantRepository: IMerchantRepository) {}

  public async handleRequest(request: Request, response: Response) {
    debug('request headers: %o', request.headers)

    try {
        const { pubkey, approved_till, balance } = request.body
        const merchant = await this.merchantRepository.findByPubkey(pubkey)
        if (!merchant) {
          response
            .status(404)
            .setHeader('content-type', 'application/json; charset=utf8')
            .send('Merchant not found')
          return
        }
        merchant.approvedTill = new Date(approved_till)
        merchant.balance = Number(balance)
        await this.merchantRepository.upsert(merchant)
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
      debug('Failed to edit merchant with error: %s', error.stack)
      response
        .status(500)
        .setHeader('content-type', 'application/json; charset=utf8')
        .send('Error occurred on our server while editing merchant.')
      return
    }
  }
}
