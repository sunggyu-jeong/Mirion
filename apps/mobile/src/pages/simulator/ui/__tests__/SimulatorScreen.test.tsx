jest.mock('@features/simulator', () => ({
  useSimulator: jest.fn(),
}));

jest.mock('@features/staking', () => ({
  useEthPrice: jest.fn(),
}));

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    GrowthChart: () => <View testID="growth-chart" />,
    InfoCard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

import { useSimulator } from '@features/simulator';
import { useEthPrice } from '@features/staking';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { SimulatorScreen } from '../SimulatorScreen';

const mockSelectAmount = jest.fn();
const mockSelectMonths = jest.fn();
const mockSetAmountText = jest.fn();

const baseSimulator = {
  apy: 3.8,
  amountText: '1',
  setAmountText: mockSetAmountText,
  selectedMonths: 12,
  selectAmount: mockSelectAmount,
  selectMonths: mockSelectMonths,
  result: null as null | {
    earned: number;
    finalBalance: number;
    growthData: number[];
    xTicks: Array<{ index: number; label: string }>;
  },
  durationOptions: [
    { label: '1개월', months: 1 },
    { label: '1년', months: 12 },
  ],
  quickAmounts: ['0.1', '1', '5'],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useSimulator).mockReturnValue(baseSimulator as never);
  jest.mocked(useEthPrice).mockReturnValue({ data: undefined } as never);
});

describe('SimulatorScreen', () => {
  it('"수익 시뮬레이터" 타이틀을 렌더링한다', () => {
    render(<SimulatorScreen />);
    expect(screen.getByText('수익 시뮬레이터')).toBeTruthy();
  });

  it('빠른 금액 버튼들을 렌더링한다', () => {
    render(<SimulatorScreen />);
    expect(screen.getByText('0.1')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('기간 선택 버튼들을 렌더링한다', () => {
    render(<SimulatorScreen />);
    expect(screen.getByText('1개월')).toBeTruthy();
    expect(screen.getByText('1년')).toBeTruthy();
  });

  it('빠른 금액 버튼 클릭 시 selectAmount 호출', () => {
    render(<SimulatorScreen />);
    fireEvent.press(screen.getByText('5'));
    expect(mockSelectAmount).toHaveBeenCalledWith('5');
  });

  it('기간 버튼 클릭 시 selectMonths 호출', () => {
    render(<SimulatorScreen />);
    fireEvent.press(screen.getByText('1개월'));
    expect(mockSelectMonths).toHaveBeenCalledWith(1);
  });

  it('result가 없으면 결과 카드를 렌더링하지 않는다', () => {
    render(<SimulatorScreen />);
    expect(screen.queryByText(/예상 수익/)).toBeNull();
  });

  it('result가 있으면 수익 정보를 렌더링한다', () => {
    jest.mocked(useSimulator).mockReturnValue({
      ...baseSimulator,
      result: {
        earned: 0.038,
        finalBalance: 1.038,
        growthData: [1, 1.01, 1.02, 1.038],
        xTicks: [
          { index: 0, label: '지금' },
          { index: 12, label: '1년' },
        ],
      },
    } as never);
    render(<SimulatorScreen />);
    expect(screen.getByText(/예상 수익/)).toBeTruthy();
    expect(screen.getByTestId('growth-chart')).toBeTruthy();
  });

  it('ethPrice가 있으면 USD 금액을 렌더링한다', () => {
    jest.mocked(useEthPrice).mockReturnValue({
      data: { price: '₩4000000', change: '▲ +1.0%', isPositive: true },
    } as never);
    jest.mocked(useSimulator).mockReturnValue({
      ...baseSimulator,
      result: {
        earned: 0.038,
        finalBalance: 1.038,
        growthData: [1, 1.038],
        xTicks: [{ index: 0, label: '지금' }],
      },
    } as never);
    render(<SimulatorScreen />);
    expect(screen.getAllByText(/≈ \$/).length).toBeGreaterThan(0);
  });

  it('면책 고지 문구를 렌더링한다', () => {
    render(<SimulatorScreen />);
    expect(screen.getByText(/본 시뮬레이터는/)).toBeTruthy();
  });
});
