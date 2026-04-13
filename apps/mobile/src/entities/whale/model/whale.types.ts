export type WhaleActivityType = 'buy' | 'sell' | 'transfer';
export type Chain = 'ETH' | 'BTC' | 'SOL' | 'BNB' | 'XRP' | 'TRX';
export type ChainFilter = 'ALL' | Chain;

export const CHAIN_CONFIG: Record<Chain, { label: string; color: string }> = {
  ETH: { label: 'ETH', color: '#627EEA' },
  BTC: { label: 'BTC', color: '#F7931A' },
  SOL: { label: 'SOL', color: '#9945FF' },
  BNB: { label: 'BNB', color: '#F3BA2F' },
  XRP: { label: 'XRP', color: '#00AAE4' },
  TRX: { label: 'TRX', color: '#EF0027' },
};

export interface WhaleMetadata {
  id: string;
  name: string;
  address: string;
  tag: string;
  chain: Chain;
  isLocked: boolean;
}

export interface RawTokenBalance {
  contractAddress: string;
  rawBalance: bigint;
}

export interface WhaleOnchainData {
  nativeBalance: bigint;
  totalValueUsd: number;
  tokens: RawTokenBalance[];
}

export interface WhaleProfile extends WhaleMetadata {
  nativeBalance: bigint;
  totalValueUsd: number;
  recentActivity?: string;
  activityType: WhaleActivityType;
}
