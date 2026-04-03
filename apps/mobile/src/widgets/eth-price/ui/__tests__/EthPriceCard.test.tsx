jest.mock('@features/staking', () => ({
  useEthPrice: jest.fn(),
  useEthPriceChart: jest.fn(),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Svg: ({ children }: { children: React.ReactNode }) => <View testID="svg">{children}</View>,
    Path: () => null,
    Defs: () => null,
    LinearGradient: () => null,
    Stop: () => null,
  };
});

import { useEthPrice, useEthPriceChart } from '@features/staking';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { EthPriceCard } from '../EthPriceCard';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useEthPriceChart).mockReturnValue({ data: undefined } as never);
});

describe('EthPriceCard', () => {
  it('ethPrice가 없으면 --- 를 렌더링한다', () => {
    jest.mocked(useEthPrice).mockReturnValue({ data: undefined } as never);
    render(<EthPriceCard />);
    expect(screen.getByText('불러오는 중...')).toBeTruthy();
  });

  it('ethPrice가 있고 isPositive=true이면 초록색 change를 렌더링한다', () => {
    jest.mocked(useEthPrice).mockReturnValue({
      data: { price: '₩4,000,000', change: '▲ +1.2%', isPositive: true },
    } as never);
    render(<EthPriceCard />);
    expect(screen.getByText('▲ +1.2%')).toBeTruthy();
  });

  it('ethPrice가 있고 isPositive=false이면 빨간색 change를 렌더링한다', () => {
    jest.mocked(useEthPrice).mockReturnValue({
      data: { price: '₩3,800,000', change: '▼ -0.5%', isPositive: false },
    } as never);
    render(<EthPriceCard />);
    expect(screen.getByText('▼ -0.5%')).toBeTruthy();
  });

  it('chartPrices가 2개 이상이면 EthPriceChart를 렌더링한다', () => {
    jest.mocked(useEthPrice).mockReturnValue({
      data: { price: '₩4,000,000', change: '▲ +1.2%', isPositive: true },
    } as never);
    jest.mocked(useEthPriceChart).mockReturnValue({
      data: [3000000, 3100000, 3050000],
    } as never);
    render(<EthPriceCard />);
    expect(screen.getByText('현재 이더리움 시세')).toBeTruthy();
  });

  it('chartPrices가 1개 이하이면 차트를 렌더링하지 않는다', () => {
    jest.mocked(useEthPrice).mockReturnValue({
      data: { price: '₩4,000,000', change: '▲ +1.2%', isPositive: true },
    } as never);
    jest.mocked(useEthPriceChart).mockReturnValue({ data: [3000000] } as never);
    render(<EthPriceCard />);
    expect(screen.queryByTestId('svg')).toBeNull();
  });
});
