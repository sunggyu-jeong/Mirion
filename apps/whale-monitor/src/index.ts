import { startMonitor } from './ws/exchange.js';
import { notifyCloudflare } from './notifier/cloudflare.js';
import { startChainPolling } from './chain/poller.js';
import type { WhaleTrade } from './types.js';

const SIDE_LABEL: Record<string, string> = {
  buy: '매수',
  sell: '매도',
};

function formatLog(trade: WhaleTrade): string {
  const time = new Date(trade.timestampMs).toISOString();
  const side = SIDE_LABEL[trade.side] ?? trade.side;
  const coin = trade.symbol.replace('/USDT', '');
  const valueStr = `$${trade.valueUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const amountStr = trade.amount.toFixed(4);
  return `[${time}] [${side}] [${coin}] [${valueStr}] [${amountStr}]`;
}

function handleWhaleTrade(trade: WhaleTrade): void {
  console.log(formatLog(trade));
  notifyCloudflare(trade).catch((err: unknown) => {
    console.error('[notifier] cloudflare push failed:', err);
  });
}

startChainPolling();

startMonitor(handleWhaleTrade).catch((err: unknown) => {
  console.error('Monitor crashed:', err);
  process.exit(1);
});
