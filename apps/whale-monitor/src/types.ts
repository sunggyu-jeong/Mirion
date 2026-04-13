export type TradeSide = 'buy' | 'sell';

export interface WhaleTrade {
  symbol: string;
  side: TradeSide;
  price: number;
  amount: number;
  valueUsd: number;
  timestampMs: number;
}

export interface PairThreshold {
  symbol: string;
  thresholdUsd: number;
}

export type WhaleTradeHandler = (trade: WhaleTrade) => void;

export interface WhaleEntry {
  id: string;
  name: string;
  address: string;
  chain: 'ETH' | 'BTC' | 'SOL' | 'BNB' | 'XRP' | 'TRX';
}

export interface WhaleTxDTO {
  txHash: string;
  type: 'send' | 'receive' | 'swap';
  amountNative: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: string;
  isLarge: boolean;
  asset: string;
  chain: string;
}

export interface Prices {
  eth: number;
  btc: number;
  sol: number;
  bnb: number;
  xrp: number;
  trx: number;
}
