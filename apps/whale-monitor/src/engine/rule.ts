import type { WhaleTrade, PairThreshold } from '../types.js';

export function isWhaleTrade(
  trade: WhaleTrade,
  thresholds: PairThreshold[],
): boolean {
  const matched = thresholds.find((t) => t.symbol === trade.symbol);
  return matched !== undefined && trade.valueUsd >= matched.thresholdUsd;
}
