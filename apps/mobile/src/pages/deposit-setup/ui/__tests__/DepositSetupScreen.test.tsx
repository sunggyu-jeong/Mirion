import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockGoBack = jest.fn();
const mockToDepositConfirm = jest.fn();

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    goBack: mockGoBack,
    toDepositConfirm: mockToDepositConfirm,
  }),
}));

jest.mock('@entities/lido', () => ({
  useLidoStore: jest.fn(() => ({ estimatedApy: 3.5 })),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { address: string }) => unknown) =>
    selector({ address: '0xTestAddress' }),
  ),
}));

jest.mock('@features/lido', () => ({
  useEthBalance: jest.fn(() => ({ data: BigInt('1500000000000000000') })),
}));

import { useEthBalance } from '@features/lido';

import { DepositSetupScreen } from '../DepositSetupScreen';

describe('DepositSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useEthBalance).mockReturnValue({ data: BigInt('1500000000000000000') } as never);
  });

  it('기본 UI 요소를 렌더링한다', () => {
    render(<DepositSetupScreen />);
    expect(screen.getByText('얼마나 스테이킹할까요?')).toBeTruthy();
    expect(screen.getByText('확인')).toBeTruthy();
    expect(screen.getByPlaceholderText('0.0')).toBeTruthy();
  });

  it('잔액 조회 후 잔액과 최대 버튼을 표시한다', async () => {
    render(<DepositSetupScreen />);
    await waitFor(() => {
      expect(screen.getByText(/잔액: 1\.5000 ETH/)).toBeTruthy();
      expect(screen.getByText('최대')).toBeTruthy();
    });
  });

  it('최대 버튼을 누르면 잔액 전체가 입력 필드에 채워진다', async () => {
    render(<DepositSetupScreen />);
    await waitFor(() => expect(screen.getByText('최대')).toBeTruthy());
    fireEvent.press(screen.getByText('최대'));
    expect(screen.getByDisplayValue('1.500000')).toBeTruthy();
  });

  it('잔액 초과 입력 시 에러 메시지를 표시한다', async () => {
    render(<DepositSetupScreen />);
    await waitFor(() => expect(screen.getByText(/잔액:/)).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText('0.0'), '2.0');
    expect(screen.getByText('잔액을 초과할 수 없습니다')).toBeTruthy();
  });

  it('잔액 초과 시 확인 버튼을 눌러도 네비게이션하지 않는다', async () => {
    render(<DepositSetupScreen />);
    await waitFor(() => expect(screen.getByText(/잔액:/)).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText('0.0'), '2.0');
    fireEvent.press(screen.getByText('확인'));
    expect(mockToDepositConfirm).not.toHaveBeenCalled();
  });

  it('유효한 금액 입력 시 확인 버튼이 활성화되고 네비게이션한다', async () => {
    render(<DepositSetupScreen />);
    await waitFor(() => expect(screen.getByText(/잔액:/)).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText('0.0'), '1.0');
    fireEvent.press(screen.getByText('확인'));
    expect(mockToDepositConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ amountEth: '1.0' }),
    );
  });

  it('0 이하 입력 시 확인 버튼을 눌러도 네비게이션하지 않는다', () => {
    render(<DepositSetupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('0.0'), '0');
    fireEvent.press(screen.getByText('확인'));
    expect(mockToDepositConfirm).not.toHaveBeenCalled();
  });

  it('잔액 조회 실패 시 에러 없이 렌더링된다', async () => {
    jest.mocked(useEthBalance).mockReturnValue({ data: undefined } as never);
    render(<DepositSetupScreen />);
    await waitFor(() => {
      expect(screen.queryByText(/잔액:/)).toBeNull();
    });
    expect(screen.getByText('얼마나 스테이킹할까요?')).toBeTruthy();
  });
});
