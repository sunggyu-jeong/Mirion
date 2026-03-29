import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockSubmit = jest.fn().mockResolvedValue('0xtxhash');

jest.mock('@entities/tx', () => ({
  useTxStore: (selector: (s: { status: string; txHash: string | null }) => unknown) =>
    selector({ status: 'idle', txHash: null }),
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
    toDepositSuccess: jest.fn(),
    toError: jest.fn(),
    goBack: jest.fn(),
  }),
}));

import { TransactionProgressScreen } from '../TransactionProgressScreen';

beforeEach(() => {
  jest.clearAllMocks();
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
});
