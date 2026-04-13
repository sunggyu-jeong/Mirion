import type { CexTrade } from '@entities/cex-trade';
import type { WhaleTx } from '@entities/whale-tx';

export type ActivityEvent =
  | { source: 'onchain'; id: string; timestampMs: number; data: WhaleTx }
  | { source: 'cex'; id: string; timestampMs: number; data: CexTrade };
