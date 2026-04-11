import ccxt from 'ccxt';
import { parseTrade } from '../parser/trade.js';
import { isWhaleTrade } from '../engine/rule.js';
import { PAIR_THRESHOLDS, RECONNECT_DELAY_MS, RATE_LIMIT_DELAY_MS } from '../config.js';
import type { WhaleTradeHandler } from '../types.js';

type ProExchange = InstanceType<typeof ccxt.pro.binance>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveDelay(err: unknown): number {
  if (err instanceof ccxt.RateLimitExceeded) return RATE_LIMIT_DELAY_MS;
  return RECONNECT_DELAY_MS;
}

async function watchSymbolLoop(
  exchange: ProExchange,
  symbol: string,
  onWhaleTrade: WhaleTradeHandler,
): Promise<void> {
  while (true) {
    try {
      const rawTrades = await exchange.watchTrades(symbol);
      for (const raw of rawTrades) {
        const trade = parseTrade(raw);
        if (trade === null) continue;
        if (isWhaleTrade(trade, PAIR_THRESHOLDS)) {
          onWhaleTrade(trade);
        }
      }
    } catch (err) {
      const delay = resolveDelay(err);
      await sleep(delay);
    }
  }
}

export async function startMonitor(onWhaleTrade: WhaleTradeHandler): Promise<void> {
  const exchange = new ccxt.pro.binance({ enableRateLimit: true });
  const symbols = PAIR_THRESHOLDS.map((t) => t.symbol);

  await Promise.all(
    symbols.map((symbol) => watchSymbolLoop(exchange, symbol, onWhaleTrade)),
  );
}
