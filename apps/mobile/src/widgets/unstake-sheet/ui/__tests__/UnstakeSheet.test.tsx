import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(() => ({ stakedBalance: BigInt('2000000000000000000') })),
}));

const mockSubmit = jest.fn();
const mockSetAmount = jest.fn();
const mockSetMax = jest.fn();

jest.mock('@features/lido', () => ({
  useUnstake: jest.fn(() => ({
    amount: '',
    error: '',
    setAmount: mockSubmit,
    setMax: mockSetMax,
    submit: mockSubmit,
    isPending: false,
  })),
}));

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { View } = require('react-native');
  const PrimaryButton = ({ label, onPress }: { label: string; onPress?: () => void }) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        onPress={onPress}
        testID={`btn-${label}`}
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  };
  PrimaryButton.displayName = 'PrimaryButton';
  const BottomSheet = React.forwardRef(
    (
      { children }: { children: React.ReactNode },
      ref: React.Ref<{ open: () => void; close: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ open: jest.fn(), close: jest.fn() }));
      return <View>{children}</View>;
    },
  );
  BottomSheet.displayName = 'BottomSheet';
  return { PrimaryButton, BottomSheet };
});

import { useUnstake } from '@features/lido';

import { UnstakeSheet } from '../UnstakeSheet';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useUnstake).mockReturnValue({
    amount: '',
    error: '',
    setAmount: mockSetAmount,
    setMax: mockSetMax,
    submit: mockSubmit,
    isPending: false,
  });
});

describe('UnstakeSheet', () => {
  const sheetRef = { current: { open: jest.fn(), close: jest.fn() } };

  it('"stETH 출금" 타이틀을 렌더링한다', () => {
    render(<UnstakeSheet sheetRef={sheetRef as never} />);
    expect(screen.getByText('stETH 출금')).toBeTruthy();
  });

  it('보유 stETH 잔고를 렌더링한다', () => {
    render(<UnstakeSheet sheetRef={sheetRef as never} />);
    expect(screen.getByText('보유 stETH: 2.0000 ETH')).toBeTruthy();
  });

  it('"최대" 버튼 클릭 시 setMax 호출', () => {
    render(<UnstakeSheet sheetRef={sheetRef as never} />);
    fireEvent.press(screen.getByText('최대'));
    expect(mockSetMax).toHaveBeenCalled();
  });

  it('isPending 시 "처리 중..." 버튼을 렌더링한다', () => {
    jest.mocked(useUnstake).mockReturnValue({
      amount: '',
      error: '',
      setAmount: mockSetAmount,
      setMax: mockSetMax,
      submit: mockSubmit,
      isPending: true,
    });
    render(<UnstakeSheet sheetRef={sheetRef as never} />);
    expect(screen.getByText('처리 중...')).toBeTruthy();
  });

  it('error가 있으면 에러 메시지를 렌더링한다', () => {
    jest.mocked(useUnstake).mockReturnValue({
      amount: '',
      error: '잔고 부족',
      setAmount: mockSetAmount,
      setMax: mockSetMax,
      submit: mockSubmit,
      isPending: false,
    });
    render(<UnstakeSheet sheetRef={sheetRef as never} />);
    expect(screen.getByText('잔고 부족')).toBeTruthy();
  });

  it('"출금 요청" 버튼 클릭 시 submit 호출', () => {
    mockSubmit.mockResolvedValue(false);
    render(<UnstakeSheet sheetRef={sheetRef as never} />);
    fireEvent.press(screen.getByTestId('btn-출금 요청'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
