import type { Trade } from 'ccxt';
import type { WhaleTrade, TradeSide } from '../types.js';

export function parseTrade(raw: Trade): WhaleTrade | null {
  const { price, amount, side, symbol, timestamp } = raw;

  if (price == null || amount == null || side == null || symbol == null) {
    return null;
  }

  return {
    symbol,
    side: side as TradeSide,
    price,
    amount,
    valueUsd: price * amount,
    timestampMs: timestamp ?? Date.now(),
  };
}
