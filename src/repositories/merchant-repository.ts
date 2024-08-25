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

    public async acceptRequest(
        pubkey: Pubkey,
        approvedTill: Date,
        balance: number,
        client: DatabaseClient = this.dbClient,
    ): Promise<number> {
        debug('accepting request for merchant with pubkey %s', pubkey)

        return client<DBMerchant>('merchants')
            .where('pubkey', toBuffer(pubkey))
            .update({
                advertised_on: new Date(),
                approved_till: approvedTill,
                balance: balance,
            })
    }

    public async rejectRequest(
        pubkey: Pubkey,
        client: DatabaseClient = this.dbClient
    ) {
        debug('declining request for merchant with pubkey %s', pubkey)

        return this.delete(pubkey, client)
    }
    

    public async findAllRequests(
        client: DatabaseClient = this.dbClient
    ): Promise<Merchant[]> {
        debug('find all merchant requests')

        const dbMerchants = await client<DBMerchant>('merchants')
            .whereNull('advertised_on')
            .select()

        return dbMerchants.map(fromDBMerchant)
    }

    public async findAllApproved(
        client: DatabaseClient = this.dbClient
    ): Promise<Merchant[]> {
        debug('find all approved merchants')

        const dbMerchants = await client<DBMerchant>('merchants')
            .whereNotNull('advertised_on')
            .select()

        return dbMerchants.map(fromDBMerchant)
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
            contact_details: prop('contactDetails'),
            latitude: prop('latitude'),
            longitude: prop('longitude'),
            balance: prop('balance'),
            advertised_on: prop('advertisedOn') ?? null,
            approved_till: prop('approvedTill') ?? null,
        })(newMerchant)

        const query = client<DBMerchant>('merchants')
            .insert(row)
            .onConflict('pubkey')
            .merge(
                omit([
                    'pubkey',
                ])(row)
            ).then(prop('rowCount') as () => number)

            return query
        }
        
    public async delete(pubkey: string, client: DatabaseClient = this.dbClient): Promise<number> {
            debug('deleting merchant with pubkey %s', pubkey)

            return client('merchants')
                .where('pubkey', toBuffer(pubkey))
                .del()
        }
        
    }
