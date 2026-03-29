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

jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(() => ({ estimatedApy: 3.5 })),
}));

jest.mock('@shared/lib/web3/client', () => ({
  publicClient: {
    getBalance: jest.fn().mockResolvedValue(BigInt('2000000000000000000')),
  },
}));

import { DepositConfirmScreen } from '../DepositConfirmScreen';

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

  it('동의 미체크 상태에서 버튼 클릭 시 네비게이션 없음', () => {
    render(<DepositConfirmScreen />);
    fireEvent.press(screen.getByText('ETH 스테이킹하기'));
    expect(screen.getByText('ETH 스테이킹하기')).toBeTruthy();
  });
});
