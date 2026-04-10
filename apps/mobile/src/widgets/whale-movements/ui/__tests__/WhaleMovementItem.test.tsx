import type { WhaleTx } from '@entities/whale-tx';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { WhaleMovementItem } from '../WhaleMovementItem';

jest.mock('@shared/lib/haptic', () => ({ haptic: { impact: jest.fn() } }));
jest.mock('react-native/Libraries/Linking/Linking', () => ({ openURL: jest.fn() }));

const baseTx: WhaleTx = {
  txHash: '0xabc123',
  type: 'send',
  amountNative: 500,
  amountUsd: 1_225_000,
  fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  toAddress: '0xAbCd1234567890abcdef1234567890abcdef1234',
  timestampMs: Date.now() - 60_000,
  blockNumber: 20_000_000n,
  isLarge: true,
  asset: 'ETH',
};

describe('WhaleMovementItem', () => {
  it('renders tx type label', () => {
    render(<WhaleMovementItem item={baseTx} />);
    expect(screen.getByText('대규모 전송')).toBeTruthy();
  });

  it('shows formatted amounts when unlocked', () => {
    render(<WhaleMovementItem item={baseTx} />);
    expect(screen.getByText('500 ETH')).toBeTruthy();
    expect(screen.getByText('$1.2M')).toBeTruthy();
  });

  it('shows detail button when unlocked', () => {
    render(<WhaleMovementItem item={baseTx} />);
    expect(screen.getByText('거래 상세 보기')).toBeTruthy();
  });

  it('masks amounts when locked', () => {
    render(
      <WhaleMovementItem
        item={baseTx}
        isLocked
      />,
    );
    expect(screen.getByText('••••• ETH')).toBeTruthy();
    expect(screen.getByText('•••••')).toBeTruthy();
    expect(screen.queryByText('500 ETH')).toBeNull();
  });

  it('shows PRO unlock button when locked', () => {
    render(
      <WhaleMovementItem
        item={baseTx}
        isLocked
      />,
    );
    expect(screen.getByText('PRO로 잠금 해제')).toBeTruthy();
  });

  it('calls onUpgrade when locked button pressed', () => {
    const onUpgrade = jest.fn();
    render(
      <WhaleMovementItem
        item={baseTx}
        isLocked
        onUpgrade={onUpgrade}
      />,
    );
    fireEvent.press(screen.getByText('PRO로 잠금 해제'));
    expect(onUpgrade).toHaveBeenCalled();
  });

  it('masks addresses when locked', () => {
    render(
      <WhaleMovementItem
        item={baseTx}
        isLocked
      />,
    );
    const masked = screen.getAllByText('0x••••••...••••');
    expect(masked.length).toBe(2);
  });
});
