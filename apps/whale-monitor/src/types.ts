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
