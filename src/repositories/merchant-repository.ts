import { applySpec, omit, pipe, prop } from 'ramda'
import { DatabaseClient, Pubkey } from '../@types/base'
import { DBMerchant, Merchant } from '../@types/merchant'
import { fromDBMerchant, toBuffer } from '../utils/transform'
import { createLogger } from '../factories/logger-factory'
import { IMerchantRepository } from '../@types/repositories'


const debug = createLogger('merchant-repository')

export class MerchantRepository implements IMerchantRepository {
    
    public constructor(private readonly dbClient: DatabaseClient,) { }

    public async findByPubkey(
        pubkey: Pubkey, 
        client: DatabaseClient = this.dbClient
    ): Promise<Merchant | undefined> {
        debug('find merchant by pubkey %s', pubkey)
        const [dbMerchant] = await client<DBMerchant>('merchants')
            .where('pubkey', toBuffer(pubkey))
            .select()
        
        if(!dbMerchant) {
            return
        }
        
        return fromDBMerchant(dbMerchant)
    }


    public async upsert(
        newMerchant: Merchant, 
        client: DatabaseClient = this.dbClient
    ): Promise<number> {
        debug('upsert: %o', newMerchant)

        const row = applySpec<DBMerchant>({
            pubkey: pipe(prop('pubkey'), toBuffer),
            name: prop('name'),
            description: prop('description'),
            pricing: prop('pricing'),
            contact_details: prop('contactDetail'),
            latitude: prop('latitude'),
            longitude: prop('longitude'),
            balance: prop('balance'),
            advertised_on: prop('advertisedOn') ?? null,
            approved_at: prop('approvedAt') ?? null,
        })(newMerchant)

        const query = client<DBMerchant>('merchants')
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
        
        public delete(pubkey: string, client: DatabaseClient = this.dbClient): Promise<number> {
            debug('deleting merchant with pubkey %s', pubkey)

            return client('merchants')
                .where('pubkey', toBuffer(pubkey))
                .del()
        }
        
    }
