import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockGaslessDeposit = jest.fn();

jest.mock('@entities/wallet', () => ({
  useWalletStore: (selector: (s: { address: string | null }) => unknown) =>
    selector({ address: '0xabc' }),
}));

jest.mock('@features/staking', () => ({
  useGaslessDeposit: () => ({
    gaslessDeposit: mockGaslessDeposit,
    txState: 'biometric',
    errorMessage: null,
    reset: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {
      amountEth: '1.5',
      unlockTimestamp: '1740700800',
      unlockDateLabel: '2026년 2월 28일',
    },
  }),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    toDepositSuccess: jest.fn(),
    toError: jest.fn(),
  }),
}));

import { TransactionProgressScreen } from '../TransactionProgressScreen';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TransactionProgressScreen', () => {
  it('"금고를 잠그는 중..." 헤더를 렌더링한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('금고를 잠그는 중...')).toBeTruthy();
  });

  it('"잠시만 기다려 주세요" 부제목을 렌더링한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('잠시만 기다려 주세요')).toBeTruthy();
  });

  it('3단계 스텝을 모두 렌더링한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('트랜잭션 승인')).toBeTruthy();
    expect(screen.getByText('예치 진행 중')).toBeTruthy();
    expect(screen.getByText('확인 대기')).toBeTruthy();
  });

  it('biometric 상태에서 step 1 subtitle을 표시한다', () => {
    render(<TransactionProgressScreen />);
    expect(screen.getByText('지갑에서 트랜잭션을 승인해주세요')).toBeTruthy();
  });

  it('마운트 시 gaslessDeposit을 호출한다', () => {
    render(<TransactionProgressScreen />);
    expect(mockGaslessDeposit).toHaveBeenCalledTimes(1);
  });
});
