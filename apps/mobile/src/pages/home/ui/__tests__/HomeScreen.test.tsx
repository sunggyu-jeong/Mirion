import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockUseLockStore = jest.fn();
const mockToDepositSetup = jest.fn();
const mockToSettlementReceipt = jest.fn();

jest.mock('@entities/wallet', () => ({
  useWalletStore: (selector: (s: { address: string | null }) => unknown) =>
    selector({ address: '0xabc123def456abc123def456abc123def456abc1' }),
}));

jest.mock('@entities/lock', () => ({
  useLockStore: () => mockUseLockStore(),
}));

jest.mock('@features/staking', () => ({
  useLockInfo: jest.fn(),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    toDepositSetup: mockToDepositSetup,
    toSettlementReceipt: mockToSettlementReceipt,
  }),
}));

import { HomeScreen } from '../HomeScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLockStore.mockReturnValue({ balance: 0n, unlockTime: 0n, pendingReward: 0n });
});

describe('HomeScreen', () => {
  it('잔액이 없을 때 "ETH 예치하기" 버튼을 렌더링한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('ETH 예치하기')).toBeTruthy();
  });

  it('잔액이 없을 때 "예치된 금액이 없습니다"를 표시한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('예치된 금액이 없습니다')).toBeTruthy();
  });

  it('"예치 금액" 카드 라벨을 렌더링한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('예치 금액')).toBeTruthy();
  });

  it('"현재 이더리움 시세" 카드를 렌더링한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('현재 이더리움 시세')).toBeTruthy();
  });

  it('이자 수익이 가스비보다 적을 때 경고 문구를 표시한다', () => {
    mockUseLockStore.mockReturnValue({
      balance: BigInt('1500000000000000000'),
      unlockTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
      pendingReward: BigInt('100000000000000'),
    });
    render(<HomeScreen />);
    expect(screen.getByText('이자 수익이 가스비보다 적습니다')).toBeTruthy();
  });
});
