import { Pubkey } from './base'

export type IRelayLocationFormat = {
  format: 'RECTANGLE';
  minimum: number;
  maximum: number;
};

export interface Relay {
  pubkey: Pubkey;
  senderPubkey: Pubkey;
  name: string;
  url: string;
  pricing: string;
  description: string;
  contactDetails: Record<string, string | number>;
  latitude: number;
  longitude: number;
  locationFormat: IRelayLocationFormat;
}

export interface DBRelay {
  id: string;
  pubkey: Pubkey;
  sender_pubkey: Pubkey;
  name: string;
  url: string;
  pricing: string;
  description: string;
  contact_details: Record<string, string | number>;
  latitude: number;
  longitude: number;
  location_format: IRelayLocationFormat;
}
