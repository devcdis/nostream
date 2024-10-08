import { IRelayLocationFormat } from './relay'
import { Pubkey } from './base'

export interface RelayRequest {
  pubkey: Pubkey;
  senderPubkey: Pubkey[];
  name: string;
  url: string;
  pricing: string;
  description: string;
  contactDetails: Record<string, string | number>;
  latitude: number;
  longitude: number;
  locationFormat: IRelayLocationFormat;
  approvedAt?: Date;
  declinedAt?: Date;
  createdAt?: Date;
}

export interface DBRelayRequest {
  id: string;
  pubkey: Buffer;
  sender_pubkey: Buffer[];
  name: string;
  url: string;
  pricing: string;
  description: string;
  contact_details: Record<string, string | number>;
  latitude: number;
  longitude: number;
  location_format: IRelayLocationFormat;
  approved_at?: Date;
  declined_at?: Date;
  created_at: Date;
}
