import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { address: string }) => unknown) =>
    selector({ address: '0xTestAddress' }),
  ),
}));

jest.mock('@features/lido', () => ({
  useEthBalance: jest.fn(),
}));

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    AnimatedNumber: ({ value }: { value: string }) => <Text testID="animated-number">{value}</Text>,
    InfoCard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

import { useEthBalance } from '@features/lido';

import { EthBalanceCard } from '../EthBalanceCard';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EthBalanceCard', () => {
  it('ethBalance가 undefined이면 null을 렌더링한다', () => {
    jest.mocked(useEthBalance).mockReturnValue({ data: undefined } as never);
    const { toJSON } = render(<EthBalanceCard />);
    expect(toJSON()).toBeNull();
  });

  it('ethBalance가 있으면 라벨과 잔액을 렌더링한다', () => {
    jest.mocked(useEthBalance).mockReturnValue({
      data: BigInt('1500000000000000000'),
    } as never);
    render(<EthBalanceCard />);
    expect(screen.getByText('지갑 ETH 잔액')).toBeTruthy();
    expect(screen.getByTestId('animated-number').props.children).toContain('1.5000');
  });

  it('0 ETH 잔액도 렌더링한다', () => {
    jest.mocked(useEthBalance).mockReturnValue({ data: 0n } as never);
    render(<EthBalanceCard />);
    expect(screen.getByText('지갑 ETH 잔액')).toBeTruthy();
    expect(screen.getByTestId('animated-number').props.children).toContain('0.0000');
  });
});
