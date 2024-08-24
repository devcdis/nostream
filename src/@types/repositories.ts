import { DatabaseClient, EventId, Pubkey } from './base'
import { DBEvent, Event } from './event'
import { Invoice } from './invoice'
import { Merchant } from './merchant'
import { PassThrough } from 'stream'
import { Relay } from './relay'
import { RelayRequest } from './relay-request'
import { SubscriptionFilter } from './subscription'
import { User } from './user'

export type ExposedPromiseKeys = 'then' | 'catch' | 'finally'

export interface IQueryResult<T> extends Pick<Promise<T>, keyof Promise<T> & ExposedPromiseKeys> {
  stream(options?: Record<string, any>): PassThrough & AsyncIterable<T>
}

export interface IEventRepository {
  create(event: Event): Promise<number>
  upsert(event: Event): Promise<number>
  findByFilters(filters: SubscriptionFilter[]): IQueryResult<DBEvent[]>
  deleteByPubkeyAndIds(pubkey: Pubkey, ids: EventId[]): Promise<number>
}

export interface IInvoiceRepository {
  findById(id: string, client?: DatabaseClient): Promise<Invoice | undefined>
  upsert(invoice: Partial<Invoice>, client?: DatabaseClient): Promise<number>
  updateStatus(
    invoice: Pick<Invoice, 'id' | 'status'>,
    client?: DatabaseClient,
  ): Promise<Invoice | undefined>
  confirmInvoice(
    invoiceId: string,
    amountReceived: bigint,
    confirmedAt: Date,
    client?: DatabaseClient,
  ): Promise<void>
  findPendingInvoices(
    offset?: number,
    limit?: number,
    client?: DatabaseClient,
  ): Promise<Invoice[]>
}

export interface IUserRepository {
  findByPubkey(
    pubkey: Pubkey,
    client?: DatabaseClient
  ): Promise<User | undefined>;
  upsert(user: Partial<User>, client?: DatabaseClient): Promise<number>;
  getBalanceByPubkey(pubkey: Pubkey, client?: DatabaseClient): Promise<bigint>;
}

export interface IRelayRepository {
  findAllRelays(client?: DatabaseClient): Promise<Relay[]>;
  findByPubkey(pubkey: Pubkey, client?: DatabaseClient): Promise<Relay|undefined>
  upsert(newRelay: Relay, client?: DatabaseClient): Promise<number>
  delete(pubkey: Pubkey, client?: DatabaseClient): Promise<number>
}

export interface IRelayRequestRepository {
  findAllRelayRequests(client?: DatabaseClient): Promise<RelayRequest[]>;
  findByPubkey(pubkey: Pubkey, client?: DatabaseClient): Promise<RelayRequest|undefined>
  upsert(newRelayRequest: RelayRequest, client?: DatabaseClient): Promise<number>
  delete(pubkey: Pubkey, client?: DatabaseClient): Promise<number>
  acceptRelayRequest(pubkey: Pubkey, client?: DatabaseClient): Promise<number>
  rejectRelayRequest(pubkey: Pubkey, client?: DatabaseClient): Promise<number>
  
}

export interface IMerchantRepository {
  findByPubkey(pubkey: Pubkey, client?: DatabaseClient): Promise<Merchant | undefined>
  upsert(newMerchant: Merchant, client?: DatabaseClient): Promise<number>
  delete(pubkey: Pubkey, client?: DatabaseClient): Promise<number>
  acceptRequest(pubkey: Pubkey, approvedTill: Date, balance: number, client?: DatabaseClient): Promise<number>
  rejectRequest(pubkey: Pubkey, client?: DatabaseClient)
  findAllRequests(client?: DatabaseClient): Promise<Merchant[]>
  findAllApproved(client?: DatabaseClient): Promise<Merchant[]>
}
