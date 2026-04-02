import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockSubmit = jest.fn().mockResolvedValue('0xtxhash');
const mockToDepositSuccess = jest.fn();
const mockToError = jest.fn();

jest.mock('@entities/tx', () => ({
  useTxStore: jest.fn(),
}));

jest.mock('@features/lido', () => ({
  useLidoSubmit: () => ({
    submit: mockSubmit,
    isPending: false,
    reset: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {
      amountEth: '1.5',
      unlockTimestamp: '0',
      unlockDateLabel: '',
    },
  }),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    toDepositSuccess: mockToDepositSuccess,
    toError: mockToError,
    goBack: jest.fn(),
  }),
}));

import { useTxStore } from '@entities/tx';

import { TransactionProgressScreen } from '../TransactionProgressScreen';

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useTxStore)
    .mockImplementation((selector: (s: { status: string; txHash: string | null }) => unknown) =>
      selector({ status: 'idle', txHash: null }),
    );
});

describe('TransactionProgressScreen', () => {
  it('"스테이킹 진행 중..." 헤더를 렌더링한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('스테이킹 진행 중...')).toBeTruthy();
  });

  it('"잠시만 기다려 주세요" 부제목을 렌더링한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('잠시만 기다려 주세요')).toBeTruthy();
  });

  it('3단계 스텝을 모두 렌더링한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('트랜잭션 승인')).toBeTruthy();
    expect(screen.getByText('스테이킹 진행 중')).toBeTruthy();
    expect(screen.getByText('확인 대기')).toBeTruthy();
  });

  it('마운트 시 submit을 호출한다', () => {
    render(<TransactionProgressScreen />);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('txStatus가 success이면 toDepositSuccess를 호출한다', () => {
    jest
      .mocked(useTxStore)
      .mockImplementation((selector: (s: { status: string; txHash: string | null }) => unknown) =>
        selector({ status: 'success', txHash: '0xtx' }),
      );
    render(<TransactionProgressScreen />);
    expect(mockToDepositSuccess).toHaveBeenCalled();
  });

  it('txStatus가 error이면 toError를 호출한다', () => {
    jest
      .mocked(useTxStore)
      .mockImplementation((selector: (s: { status: string; txHash: string | null }) => unknown) =>
        selector({ status: 'error', txHash: null }),
      );
    render(<TransactionProgressScreen />);
    expect(mockToError).toHaveBeenCalledWith({ errorType: 'transaction' });
  });
});
