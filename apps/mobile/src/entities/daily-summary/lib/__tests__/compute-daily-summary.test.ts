import type { WhaleTx } from '@entities/whale-tx';

import { computeDailySummary } from '../compute-daily-summary';

function makeTx(overrides: Partial<WhaleTx> = {}): WhaleTx {
  return {
    txHash: '0xabc',
    type: 'send',
    amountNative: 100,
    amountUsd: 250_000,
    fromAddress: '0xFrom',
    toAddress: '0xTo',
    timestampMs: Date.now(),
    blockNumber: 1n,
    isLarge: true,
    asset: 'ETH',
    ...overrides,
  };
}

describe('computeDailySummary', () => {
  it('returns zeros when no txs', () => {
    const result = computeDailySummary([]);
    expect(result.totalCount).toBe(0);
    expect(result.totalEth).toBe(0);
    expect(result.totalUsd).toBe(0);
    expect(result.avgEth).toBe(0);
  });

  it('excludes txs from yesterday', () => {
    const yesterday = Date.now() - 86_400_000 * 1.5;
    const result = computeDailySummary([makeTx({ timestampMs: yesterday })]);
    expect(result.totalCount).toBe(0);
  });

  it('counts only today txs', () => {
    const todayTxs = [makeTx({ txHash: '0x1' }), makeTx({ txHash: '0x2' })];
    const result = computeDailySummary(todayTxs);
    expect(result.totalCount).toBe(2);
  });

  it('sums ETH and USD correctly', () => {
    const txs = [
      makeTx({ amountNative: 200, amountUsd: 500_000 }),
      makeTx({ amountNative: 300, amountUsd: 750_000 }),
    ];
    const result = computeDailySummary(txs);
    expect(result.totalEth).toBe(500);
    expect(result.totalUsd).toBe(1_250_000);
  });

  it('computes average ETH', () => {
    const txs = [makeTx({ amountNative: 100 }), makeTx({ amountNative: 300 })];
    const result = computeDailySummary(txs);
    expect(result.avgEth).toBe(200);
  });

  it('identifies dominant type', () => {
    const txs = [makeTx({ type: 'send' }), makeTx({ type: 'send' }), makeTx({ type: 'receive' })];
    const result = computeDailySummary(txs);
    expect(result.dominantType).toBe('send');
  });
});
