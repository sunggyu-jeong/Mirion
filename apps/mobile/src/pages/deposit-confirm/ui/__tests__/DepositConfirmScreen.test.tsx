import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {
      amountEth: '1.5',
      unlockDate: new Date('2026-02-28').toISOString(),
    },
  }),
}));

const mockGoBack = jest.fn();
const mockToTransactionProgress = jest.fn();
const mockToError = jest.fn();

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    goBack: mockGoBack,
    toTransactionProgress: mockToTransactionProgress,
    toError: mockToError,
  }),
}));

const mockCheckBalance = jest.fn();
jest.mock('@features/lido', () => ({
  useBalanceCheck: () => mockCheckBalance,
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { address: string }) => unknown) =>
    selector({ address: '0xTestAddress' }),
  ),
}));

jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(() => ({ estimatedApy: 3.5 })),
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    getBalance: jest.fn().mockResolvedValue(BigInt('2000000000000000000')),
  },
}));

import { DepositConfirmScreen } from '../DepositConfirmScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockCheckBalance.mockResolvedValue(true);
});

describe('DepositConfirmScreen', () => {
  it('스테이킹 금액을 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('1.5')).toBeTruthy();
  });

  it('"ETH 스테이킹하기" 버튼을 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('ETH 스테이킹하기')).toBeTruthy();
  });

  it('동의 텍스트를 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('위 내용을 확인했으며, 동의합니다.')).toBeTruthy();
  });

  it('비수탁형 DisclaimerBox를 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('비수탁형 서비스 안내')).toBeTruthy();
  });

  it('체크박스를 누르면 동의 상태가 토글된다', () => {
    render(<DepositConfirmScreen />);
    const checkbox = screen.getByText('위 내용을 확인했으며, 동의합니다.');
    fireEvent.press(checkbox.parent!);
    expect(screen.getByText('ETH 스테이킹하기')).toBeTruthy();
  });

  it('estimatedApy가 0이면 "-" 를 렌더링한다', () => {
    const { useLidoStore } = require('@entities/lido');
    jest.mocked(useLidoStore).mockReturnValue({ estimatedApy: 0 });
    render(<DepositConfirmScreen />);
    expect(screen.getByText('-')).toBeTruthy();
  });

  it('동의 미체크 상태에서 버튼 클릭 시 네비게이션 없음', () => {
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('ETH 스테이킹하기'));
    expect(screen.getByText('ETH 스테이킹하기')).toBeTruthy();
  });

  it('동의 후 스테이킹 버튼 클릭 시 잔고 확인 충분 → toTransactionProgress 호출', async () => {
    const { act } = require('@testing-library/react-native');
    mockCheckBalance.mockResolvedValue(true);
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('위 내용을 확인했으며, 동의합니다.').parent!);
    await act(async () => {
      fireEvent.press(screen.getByText('ETH 스테이킹하기'));
    });
    expect(mockToTransactionProgress).toHaveBeenCalled();
  });

  it('동의 후 스테이킹 버튼 클릭 시 잔고 부족 → toError 호출', async () => {
    const { act } = require('@testing-library/react-native');
    mockCheckBalance.mockResolvedValue(false);
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('위 내용을 확인했으며, 동의합니다.').parent!);
    await act(async () => {
      fireEvent.press(screen.getByText('ETH 스테이킹하기'));
    });
    expect(mockToError).toHaveBeenCalledWith({ errorType: 'balance' });
  });

  it('버튼 클릭 후 잔고 확인 중에는 "확인 중..." 레이블을 표시한다', async () => {
    const { act } = require('@testing-library/react-native');
    let resolveCheck: (val: boolean) => void;
    mockCheckBalance.mockReturnValue(
      new Promise(res => {
        resolveCheck = res;
      }),
    );
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('위 내용을 확인했으며, 동의합니다.').parent!);
    act(() => {
      fireEvent.press(screen.getByText('ETH 스테이킹하기'));
    });
    expect(screen.getByText('확인 중...')).toBeTruthy();
    await act(async () => {
      resolveCheck!(true);
    });
  });

  it('checkBalance 예외 발생 시 crash 없이 진행된다', async () => {
    const { act } = require('@testing-library/react-native');
    mockCheckBalance.mockRejectedValue(new Error('네트워크 오류'));
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('위 내용을 확인했으며, 동의합니다.').parent!);
    await act(async () => {
      fireEvent.press(screen.getByText('ETH 스테이킹하기'));
    });
    expect(mockToError).not.toHaveBeenCalled();
  });
});
