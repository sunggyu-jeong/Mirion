import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockUseLockStore = jest.fn();

jest.mock('@entities/wallet', () => ({
  useWalletStore: (selector: (s: { address: string | null }) => unknown) =>
    selector({ address: '0xabc' }),
}));

jest.mock('@entities/lock', () => ({
  useLockStore: () => mockUseLockStore(),
}));

jest.mock('@features/staking', () => ({
  useWithdraw: () => ({
    withdraw: jest.fn(),
    txState: 'idle',
    errorMessage: null,
    needsDisclaimer: false,
    reset: jest.fn(),
  }),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    goBack: jest.fn(),
    toMain: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

import { SettlementReceiptModal } from '../SettlementReceiptModal';

const mockBalance = BigInt('1500000000000000000');
const mockReward = BigInt('12400000000000000');

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLockStore.mockReturnValue({
    balance: mockBalance,
    unlockTime: 0n,
    pendingReward: mockReward,
  });
});

describe('SettlementReceiptModal', () => {
  it('"정산 영수증" 타이틀을 렌더링한다', () => {
    render(<SettlementReceiptModal />);
    expect(screen.getByText('정산 영수증')).toBeTruthy();
  });

  it('영수증 항목들을 렌더링한다', () => {
    render(<SettlementReceiptModal />);
    expect(screen.getByText('예치 원금')).toBeTruthy();
    expect(screen.getByText('누적 이자')).toBeTruthy();
    expect(screen.getByText('가스비 정산')).toBeTruthy();
    expect(screen.getByText('수수료 3%')).toBeTruthy();
    expect(screen.getByText('최종 수령액')).toBeTruthy();
  });

  it('"지갑으로 받기" 버튼을 렌더링한다', () => {
    render(<SettlementReceiptModal />);
    expect(screen.getByText('지갑으로 받기')).toBeTruthy();
  });

  it('이자가 가스비보다 클 때 원금 텍스트를 렌더링한다', () => {
    render(<SettlementReceiptModal />);
    expect(screen.getByText('1.5000')).toBeTruthy();
  });
});
