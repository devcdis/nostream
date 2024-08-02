import { applySpec, pipe, prop } from 'ramda'
import { DBRelay, Relay } from '../@types/relay'
import { DBRelayRequest, RelayRequest } from '../@types/relay-request'
import { fromDBRelay, fromDBRelayRequest, toBuffer } from '../utils/transform'

import { createLogger } from '../factories/logger-factory'
import { DatabaseClient } from '../@types/base'
import { date } from 'joi'
import { IRelayRepository } from '../@types/repositories'

const debug = createLogger('relay-repository')

export class RelayRepository implements IRelayRepository {
  public constructor(private readonly dbClient: DatabaseClient) {}

  public async findAllRelays(
    client: DatabaseClient = this.dbClient
  ): Promise<Relay[]> {
    debug('find all relays')
    const relays = await client<DBRelay>('relays').select()

    return relays.map(fromDBRelay)
  }

  public async createNewRelayRequest(
    data: RelayRequest,
    client: DatabaseClient = this.dbClient
  ): Promise<Relay | undefined> {
    debug('get balance for pubkey: %o', data)

    const row = applySpec<DBRelayRequest>({
      pubkey: pipe(prop('pubkey'), toBuffer),
      sender_pubkey: pipe(prop('pubkey'), toBuffer),
      name: prop('name'),
      url: prop('url'),
      pricing: prop('pricing'),
      description: prop('description'),
      contact_details: prop('contactDetails'),
      latitude: prop('latitude'),
      longitude: prop('longitude'),
      location_format: prop('locationFormat'),
      approved_at: date,
      declined_at: date,
    })(data)

    const request = await client<DBRelayRequest>('relay_requests')
      .insert(row)
      .returning('*')
      .select()
      .first()

    return fromDBRelayRequest(request)
  }
}
