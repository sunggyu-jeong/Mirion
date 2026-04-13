import type { CexTrade } from '@entities/cex-trade';
import type { WhaleTx } from '@entities/whale-tx';

import type { ActivityEvent } from '../model/activity-event';

export function mergeActivityEvents(whaleTxs: WhaleTx[], cexTrades: CexTrade[]): ActivityEvent[] {
  const onchain: ActivityEvent[] = whaleTxs.map(tx => ({
    source: 'onchain' as const,
    id: tx.txHash,
    timestampMs: tx.timestampMs,
    data: tx,
  }));

  const cex: ActivityEvent[] = cexTrades.map(trade => ({
    source: 'cex' as const,
    id: `cex-${trade.symbol}-${trade.timestampMs}`,
    timestampMs: trade.timestampMs,
    data: trade,
  }));

  return [...onchain, ...cex].sort((a, b) => b.timestampMs - a.timestampMs);
}
