import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@features/lido', () => ({
  useLidoInfo: jest.fn(() => ({ apyQuery: { isLoading: false } })),
}));

import { useLidoStore } from '@entities/lido';
import { useWalletStore } from '@entities/wallet';

import { StakingBalanceCard } from '../StakingBalanceCard';

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useWalletStore)
    .mockImplementation((selector: (s: { address: string }) => unknown) =>
      selector({ address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12' }),
    );
});

describe('StakingBalanceCard', () => {
  it('stakedBalance가 0이면 "스테이킹된 ETH가 없습니다" 텍스트를 렌더링한다', () => {
    jest.mocked(useLidoStore).mockReturnValue({
      stakedBalance: 0n,
      estimatedApy: 3.8,
      stakeBaseline: 0n,
    });
    render(<StakingBalanceCard />);
    expect(screen.getByText('스테이킹 잔고 (stETH)')).toBeTruthy();
    expect(screen.getByText('스테이킹된 ETH가 없습니다')).toBeTruthy();
  });

  it('stakedBalance가 있으면 ETH 잔고와 APY를 렌더링한다', () => {
    jest.mocked(useLidoStore).mockReturnValue({
      stakedBalance: BigInt('1500000000000000000'),
      estimatedApy: 3.8,
      stakeBaseline: 0n,
    });
    render(<StakingBalanceCard />);
    expect(screen.getByText('스테이킹 잔고 (stETH)')).toBeTruthy();
    expect(screen.getByText(/예상 APY 3.8%/)).toBeTruthy();
  });

  it('baseline보다 잔고가 크면 누적 이자를 렌더링한다', () => {
    jest.mocked(useLidoStore).mockReturnValue({
      stakedBalance: BigInt('1100000000000000000'),
      estimatedApy: 3.8,
      stakeBaseline: BigInt('1000000000000000000'),
    });
    render(<StakingBalanceCard />);
    expect(screen.getByText(/누적 이자/)).toBeTruthy();
  });

  it('APY 로딩 중이면 Skeleton을 렌더링한다', () => {
    jest.mocked(useLidoStore).mockReturnValue({
      stakedBalance: BigInt('1000000000000000000'),
      estimatedApy: 0,
      stakeBaseline: 0n,
    });
    const { useLidoInfo } = require('@features/lido');
    jest.mocked(useLidoInfo).mockReturnValue({ apyQuery: { isLoading: true } });
    render(<StakingBalanceCard />);
    expect(screen.queryByText(/예상 APY/)).toBeNull();
  });

  it('address가 null이면 WalletBadge를 렌더링하지 않는다', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: null }) => unknown) =>
        selector({ address: null }),
      );
    jest.mocked(useLidoStore).mockReturnValue({
      stakedBalance: 0n,
      estimatedApy: 3.8,
      stakeBaseline: 0n,
    });
    render(<StakingBalanceCard />);
    expect(screen.queryByText(/0x/)).toBeNull();
  });
});
