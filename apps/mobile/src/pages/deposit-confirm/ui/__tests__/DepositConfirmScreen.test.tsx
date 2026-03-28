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

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    goBack: jest.fn(),
    toTransactionProgress: jest.fn(),
    toError: jest.fn(),
  }),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { address: string }) => unknown) =>
    selector({ address: '0xTestAddress' }),
  ),
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    getBalance: jest.fn().mockResolvedValue(BigInt('2000000000000000000')), // 2 ETH
  },
}));

import { DepositConfirmScreen } from '../DepositConfirmScreen';

describe('DepositConfirmScreen', () => {
  it('잠금 금액과 날짜를 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('1.5')).toBeTruthy();
    expect(screen.getByText('2026.02.28')).toBeTruthy();
  });

  it('면책 동의 체크 전에는 버튼이 secondary 상태다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('지갑 잠그기')).toBeTruthy();
  });

  it('면책 동의 텍스트를 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('위 위험 요소를 확인했으며, 동의 합니다.')).toBeTruthy();
  });

  it('원금 차감 가능성 DisclaimerBox를 렌더링한다', () => {
    render(<DepositConfirmScreen />);
    expect(screen.getByText('원금 차감 가능성 안내')).toBeTruthy();
  });

  it('체크박스를 누르면 동의 상태가 토글된다', () => {
    render(<DepositConfirmScreen />);
    const checkbox = screen.getByText('위 위험 요소를 확인했으며, 동의 합니다.');
    fireEvent.press(checkbox.parent!);
    expect(screen.getByText('지갑 잠그기')).toBeTruthy();
  });

  it('동의 미체크 상태에서 버튼 클릭 시 네비게이션 없음', () => {
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('지갑 잠그기'));
    expect(screen.getByText('지갑 잠그기')).toBeTruthy();
  });
});
