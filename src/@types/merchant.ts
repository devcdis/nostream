import { Pubkey } from './base'

export interface Merchant {
    pubkey: Pubkey;
    name: string,
    description: string,
    pricing: string,
    contact_details: Record<string, string | number>,
    latitude: number,
    longitude: number,
    balance: number,
    advertisedOn?: Date,
    approvedAt?: Date
}

export interface DBMerchant {
    pubkey: Buffer;
    name: string;
    description: string;
    pricing: string;
    contact_details: Record<string, string | number>;
    latitude: number;
    longitude: number;
    balance: number;
    advertised_on?: Date;
    approved_at?: Date;
}