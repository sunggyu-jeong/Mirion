import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockToDepositSetup = jest.fn();

jest.mock('@entities/wallet', () => ({
  useWalletStore: (selector: (s: { address: string | null }) => unknown) =>
    selector({ address: '0xabc123def456abc123def456abc123def456abc1' }),
}));

jest.mock('@entities/lido', () => ({
  useLidoStore: () => ({ stakedBalance: 0n, estimatedApy: 3.8, stakeBaseline: 0n }),
}));

jest.mock('@features/lido', () => ({
  useLidoInfo: jest.fn(() => ({ apyQuery: { isLoading: false } })),
  useEthBalance: jest.fn(() => ({ data: undefined })),
  useLidoWithdraw: jest.fn(() => ({ requestWithdrawal: jest.fn(), isPending: false })),
}));

jest.mock('@features/staking', () => ({
  useEthPrice: jest.fn(() => ({
    data: { price: '₩4,595,313', change: '▲ +2.4%', isPositive: true },
  })),
  useEthPriceChart: jest.fn(() => ({
    data: [3000000, 3100000, 3050000, 3200000, 3150000, 3250000, 3044376],
  })),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    toDepositSetup: mockToDepositSetup,
  }),
}));

import { HomeScreen } from '../HomeScreen';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HomeScreen', () => {
  it('"ETH 스테이킹하기" 버튼을 렌더링한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('ETH 스테이킹하기')).toBeTruthy();
  });

  it('"스테이킹 잔고 (stETH)" 카드 라벨을 렌더링한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('스테이킹 잔고 (stETH)')).toBeTruthy();
  });

  it('"현재 이더리움 시세" 카드를 렌더링한다', () => {
    render(<HomeScreen />);
    expect(screen.getByText('현재 이더리움 시세')).toBeTruthy();
  });
});
