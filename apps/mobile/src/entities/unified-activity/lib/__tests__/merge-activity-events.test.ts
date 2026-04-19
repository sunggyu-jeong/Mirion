import type { CexTrade } from '@entities/cex-trade';
import type { WhaleTx } from '@entities/whale-tx';

import { mergeActivityEvents } from '../merge-activity-events';

function makeTx(overrides: Partial<WhaleTx> = {}): WhaleTx {
  return {
    txHash: '0xdefault',
    type: 'send',
    amountNative: 100,
    amountUsd: 245_000,
    fromAddress: '0xFrom',
    toAddress: '0xTo',
    timestampMs: 1_700_000_000_000,
    blockNumber: 20_000_000n,
    isLarge: true,
    asset: 'ETH',
    chain: 'ETH',
    ...overrides,
  };
}

function makeCex(overrides: Partial<CexTrade> = {}): CexTrade {
  return {
    symbol: 'ETHUSDT',
    side: 'buy',
    price: 3_000,
    amount: 100,
    valueUsd: 300_000,
    timestampMs: 1_700_000_000_500,
    ...overrides,
  };
}

describe('mergeActivityEvents', () => {
  it('returns empty array when both inputs are empty', () => {
    expect(mergeActivityEvents([], [])).toHaveLength(0);
  });

  it('maps onchain txs to source=onchain events', () => {
    const tx = makeTx({ txHash: '0xabc' });
    const events = mergeActivityEvents([tx], []);

    expect(events).toHaveLength(1);
    expect(events[0].source).toBe('onchain');
    expect(events[0].id).toBe('0xabc');
    expect(events[0].data).toBe(tx);
  });

  it('maps cex trades to source=cex events', () => {
    const trade = makeCex({ symbol: 'BTCUSDT', side: 'sell', timestampMs: 1_700_000_002_000 });
    const events = mergeActivityEvents([], [trade]);

    expect(events).toHaveLength(1);
    expect(events[0].source).toBe('cex');
    expect(events[0].timestampMs).toBe(1_700_000_002_000);
  });

  it('includes symbol, side and index in cex event id to ensure uniqueness', () => {
    const t1 = makeCex({ symbol: 'ETHUSDT', side: 'buy', timestampMs: 1_000 });
    const t2 = makeCex({ symbol: 'ETHUSDT', side: 'buy', timestampMs: 1_000 });
    const events = mergeActivityEvents([], [t1, t2]);

    expect(events[0].id).not.toBe(events[1].id);
  });

  it('sorts merged events by timestampMs descending', () => {
    const old = makeTx({ txHash: '0xold', timestampMs: 1_000 });
    const mid = makeCex({ timestampMs: 2_000 });
    const newest = makeTx({ txHash: '0xnew', timestampMs: 3_000 });

    const events = mergeActivityEvents([old, newest], [mid]);

    expect(events[0].timestampMs).toBe(3_000);
    expect(events[1].timestampMs).toBe(2_000);
    expect(events[2].timestampMs).toBe(1_000);
  });

  it('handles only onchain txs correctly', () => {
    const txs = [makeTx({ txHash: '0x1' }), makeTx({ txHash: '0x2' })];
    const events = mergeActivityEvents(txs, []);

    expect(events).toHaveLength(2);
    expect(events.every(e => e.source === 'onchain')).toBe(true);
  });

  it('handles only cex trades correctly', () => {
    const trades = [makeCex({ timestampMs: 1_000 }), makeCex({ timestampMs: 2_000 })];
    const events = mergeActivityEvents([], trades);

    expect(events).toHaveLength(2);
    expect(events.every(e => e.source === 'cex')).toBe(true);
  });

  it('preserves timestampMs on onchain events', () => {
    const tx = makeTx({ timestampMs: 9_999_999 });
    const events = mergeActivityEvents([tx], []);

    expect(events[0].timestampMs).toBe(9_999_999);
  });
});
