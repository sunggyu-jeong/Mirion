export type CexTradeSide = 'buy' | 'sell';

export interface CexTrade {
  symbol: string;
  side: CexTradeSide;
  price: number;
  amount: number;
  valueUsd: number;
  timestampMs: number;
}
