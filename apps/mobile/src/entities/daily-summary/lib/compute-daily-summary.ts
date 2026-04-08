import type { WhaleTx, WhaleTxType } from '@entities/whale-tx';

export type DailySummary = {
  totalCount: number;
  totalEth: number;
  totalUsd: number;
  dominantType: WhaleTxType;
  avgEth: number;
};

function todayStartMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeDailySummary(txs: WhaleTx[]): DailySummary {
  const start = todayStartMs();
  const todayTxs = txs.filter(tx => tx.timestampMs >= start);

  if (todayTxs.length === 0) {
    return { totalCount: 0, totalEth: 0, totalUsd: 0, dominantType: 'send', avgEth: 0 };
  }

  const totalEth = todayTxs.reduce((sum, tx) => sum + tx.amountEth, 0);
  const totalUsd = todayTxs.reduce((sum, tx) => sum + tx.amountUsd, 0);

  const typeCounts: Record<WhaleTxType, number> = { send: 0, receive: 0, swap: 0 };
  for (const tx of todayTxs) {
    typeCounts[tx.type]++;
  }
  const dominantType = (Object.entries(typeCounts) as [WhaleTxType, number][]).reduce((max, cur) =>
    cur[1] > max[1] ? cur : max,
  )[0];

  return {
    totalCount: todayTxs.length,
    totalEth,
    totalUsd,
    dominantType,
    avgEth: totalEth / todayTxs.length,
  };
}
