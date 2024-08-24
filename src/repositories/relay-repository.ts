import { applySpec, omit, pipe, prop } from 'ramda'
import { DatabaseClient, Pubkey } from '../@types/base'
import { DBRelay, Relay } from '../@types/relay'
import { fromDBRelay, toBuffer } from '../utils/transform'
import { createLogger } from '../factories/logger-factory'
import { IRelayRepository } from '../@types/repositories'


const debug = createLogger('relay-repository')

export class RelayRepository implements IRelayRepository {
  public constructor(private readonly dbClient: DatabaseClient) {}
  public async findByPubkey(
      pubkey: Pubkey,
      client: DatabaseClient = this.dbClient
    ): Promise<Relay | undefined> {
      debug('find relay by pubkey %s', pubkey)
      const [dbRelay] = await client<DBRelay>('relays')
          .where('pubkey', toBuffer(pubkey))
          .select()

      if(!dbRelay) {
        return
      }
      
      return fromDBRelay(dbRelay)
  }
  public async upsert(
    newRelay: Relay, 
    client: DatabaseClient = this.dbClient
  ): Promise<number> {

    debug('upsert: %o', newRelay)

    const row = applySpec<DBRelay>({
      pubkey: pipe(prop('pubkey'), toBuffer),
      // sender_pubkey: pipe(prop('senderPubkey'), map(toBuffer)),
      name: prop('name'),
      url: prop('url'),
      pricing: prop('pricing'),
      description: prop('description'),
      contact_details: prop('contactDetails'),
      latitude: prop('latitude'),
      longitude: prop('longitude'),
      location_format: prop('locationFormat'),
      approved_at: prop('approvedAt'),
    })(newRelay)

    const query = client<DBRelay>('relays')
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
    debug('deleting relay with pubkey %s', pubkey)

    return client('merchants')
        .where('pubkey', toBuffer(pubkey))
        .del()
    }
    
    public async findAllRelays(
      client: DatabaseClient = this.dbClient
    ): Promise<Relay[]> {
      debug('find all relays')
      const relays = await client<DBRelay>('relays').select()
    
      return relays.map(fromDBRelay)
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
