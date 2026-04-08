export type WhaleActivityType = 'buy' | 'sell' | 'transfer';
export type Chain = 'ETH' | 'BTC' | 'SOL' | 'BNB';
export type ChainFilter = 'ALL' | Chain;

export const CHAIN_CONFIG: Record<Chain, { label: string; color: string }> = {
  ETH: { label: 'ETH', color: '#627EEA' },
  BTC: { label: 'BTC', color: '#F7931A' },
  SOL: { label: 'SOL', color: '#9945FF' },
  BNB: { label: 'BNB', color: '#F3BA2F' },
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
  ethBalance: bigint;
  totalValueUsd: number;
  tokens: RawTokenBalance[];
}

export interface WhaleProfile extends WhaleMetadata {
  ethBalance: bigint;
  totalValueUsd: number;
  recentActivity?: string;
  activityType: WhaleActivityType;
}
