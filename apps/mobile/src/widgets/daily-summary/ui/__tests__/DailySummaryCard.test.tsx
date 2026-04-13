import type { WhaleTx } from '@entities/whale-tx';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { DailySummaryCard } from '../DailySummaryCard';

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
    chain: 'ETH',
    ...overrides,
  };
}

describe('DailySummaryCard', () => {
  it('renders nothing when movements is undefined', () => {
    const { toJSON } = render(<DailySummaryCard movements={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when movements is empty', () => {
    const { toJSON } = render(<DailySummaryCard movements={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when no transactions are from today', () => {
    const oldTx = makeTx({ timestampMs: Date.now() - 86_400_000 * 2 });
    const { toJSON } = render(<DailySummaryCard movements={[oldTx]} />);
    expect(toJSON()).toBeNull();
  });

  it('shows title when there are today transactions', () => {
    render(<DailySummaryCard movements={[makeTx()]} />);
    expect(screen.getByText('오늘의 고래 활동')).toBeTruthy();
  });

  it('shows correct count', () => {
    const txs = [makeTx({ txHash: '0x1' }), makeTx({ txHash: '0x2' })];
    render(<DailySummaryCard movements={txs} />);
    expect(screen.getByText('2건')).toBeTruthy();
  });

  it('shows dominant type label', () => {
    const txs = [
      makeTx({ type: 'send', txHash: '0x1' }),
      makeTx({ type: 'send', txHash: '0x2' }),
      makeTx({ type: 'receive', txHash: '0x3' }),
    ];
    render(<DailySummaryCard movements={txs} />);
    expect(screen.getByText('전송 우세')).toBeTruthy();
  });
});
