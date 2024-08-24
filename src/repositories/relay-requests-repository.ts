import { applySpec, map, omit, pipe, prop } from 'ramda'
import { DatabaseClient, Pubkey } from '../@types/base'
import { DBRelayRequest, RelayRequest } from '../@types/relay-request'
import { fromDBRelayRequest, toBuffer } from '../utils/transform'
import { createLogger } from '../factories/logger-factory'
import { DBRelay } from '../@types/relay'
import { IRelayRequestRepository } from '../@types/repositories'

const debug = createLogger('relay-requests-repository')

export class RelayRequestRepository implements IRelayRequestRepository {
  public constructor(private readonly dbClient: DatabaseClient) {}
  public async findByPubkey(
      pubkey: Pubkey,
      client: DatabaseClient = this.dbClient
    ): Promise<RelayRequest | undefined> {
      debug('find relay request by pubkey %s', pubkey)
      const [dBRelayRequest] = await client<DBRelay>('relay_requests')
          .where('pubkey', toBuffer(pubkey))
          .select()

      if(!dBRelayRequest) {
        return
      }
      
      return fromDBRelayRequest(dBRelayRequest)
  }
  public async upsert(
    newRelayRequest: RelayRequest, 
    client: DatabaseClient = this.dbClient
  ): Promise<number> {

    debug('upsert: %o', newRelayRequest)

    const row = applySpec<DBRelayRequest>({
      pubkey: pipe(prop('pubkey'), toBuffer),
      sender_pubkey: pipe(prop('senderPubkey'), map(toBuffer)),
      name: prop('name'),
      url: prop('url'),
      pricing: prop('pricing'),
      description: prop('description'),
      contact_details: prop('contactDetails'),
      latitude: prop('latitude'),
      longitude: prop('longitude'),
      location_format: prop('locationFormat'),
      approved_at: prop('approvedAt'),
      declined_at: prop('declinedAt'),
    })(newRelayRequest)

    const query = client<DBRelayRequest>('relay_requests')
      .insert(row)
      .onConflict('pubkey')
      .merge(
        omit([
            'pubkey',
        ])(row)
    )

    return {
      then: <T1, T2>(onfulfilled: (value: number) => T1 | PromiseLike<T1>, onrejected: (reason: any) => T2 | PromiseLike<T2>) => query.then(prop('rowCount') as () => number).then(onfulfilled, onrejected),
      catch: <T>(onrejected: (reason: any) => T | PromiseLike<T>) => query.catch(onrejected),
      toString: (): string => query.toString(),
      } as Promise<number>


  }


  public async delete(pubkey: Pubkey, client: DatabaseClient = this.dbClient): Promise<number> {
    debug('deleting relay request with pubkey %s', pubkey)

    return client('relay_requests')
        .where('pubkey', toBuffer(pubkey))
        .del()
    }
    
    public async findAllRelayRequests(
      client: DatabaseClient = this.dbClient
    ): Promise<RelayRequest[]> {
      debug('find all relay requests')
      const relays = await client<DBRelayRequest>('relay_requests').select()
    
      return relays.map(fromDBRelayRequest)
    }

    public async acceptRelayRequest(
      pubkey: Pubkey,
      client: DatabaseClient = this.dbClient
    ): Promise<number> {
      debug('accept relay request with pubkey %s', pubkey)

      return client('relay_requests')
          .where('pubkey', toBuffer(pubkey))
          .update({ approved_at: new Date() })
    }

    public async rejectRelayRequest(
      pubkey: Pubkey,
      client: DatabaseClient = this.dbClient
    ): Promise<number> {
      debug('decline relay request with pubkey %s', pubkey)

      return client('relay_requests')
          .where('pubkey', toBuffer(pubkey))
          .update({ declined_at: new Date() })
    }
}


  

//   public async createNewRelayRequest(
//     data: RelayRequest,
//     client: DatabaseClient = this.dbClient
//   ): Promise<Relay | undefined> {
//     debug('get balance for pubkey: %o', data)

//     const row = applySpec<DBRelayRequest>({
//       pubkey: pipe(prop('pubkey'), toBuffer),
//       sender_pubkey: pipe(prop('pubkey'), toBuffer),
//       name: prop('name'),
//       url: prop('url'),
//       pricing: prop('pricing'),
//       description: prop('description'),
//       contact_details: prop('contactDetails'),
//       latitude: prop('latitude'),
//       longitude: prop('longitude'),
//       location_format: prop('locationFormat'),
//       approved_at: date,
//       declined_at: date,
//     })(data)

//     const request = await client<DBRelayRequest>('relay_requests')
//       .insert(row)
//       .returning('*')
//       .select()
//       .first()

//     return fromDBRelayRequest(request)
//   }
// }
