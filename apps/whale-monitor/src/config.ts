import type { PairThreshold } from './types.js';

export const PAIR_THRESHOLDS: PairThreshold[] = [
  { symbol: 'BTC/USDT', thresholdUsd: 1_000_000 },
  { symbol: 'ETH/USDT', thresholdUsd: 500_000 },
  { symbol: 'SOL/USDT', thresholdUsd: 200_000 },
  { symbol: 'BNB/USDT', thresholdUsd: 200_000 },
  { symbol: 'XRP/USDT', thresholdUsd: 100_000 },
  { symbol: 'PEPE/USDT', thresholdUsd: 100_000 },
  { symbol: 'WIF/USDT', thresholdUsd: 100_000 },
];

export const RECONNECT_DELAY_MS = 5_000;
export const RATE_LIMIT_DELAY_MS = 10_000;

export const MIN_VALUE_USD = 20_000;

export const CHAIN_POLL_INTERVALS_MS: Record<string, number> = {
  ETH: 10 * 60 * 1000,
  BTC: 15 * 60 * 1000,
  SOL: 10 * 60 * 1000,
  BNB: 15 * 60 * 1000,
  XRP: 15 * 60 * 1000,
  TRX: 15 * 60 * 1000,
};
