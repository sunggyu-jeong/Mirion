jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn((selector: (s: { setSession: jest.Mock }) => unknown) =>
    selector({ setSession: jest.fn() }),
  ),
  secureKey: { store: jest.fn().mockResolvedValue(true) },
  WC_SESSION_KEY: 'wc-session-key',
}));

jest.mock('@shared/ui', () => ({
  PrimaryButton: ({ label, onPress }: { label: string; onPress?: () => void }) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        onPress={onPress}
        testID={`btn-${label}`}
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  },
}));

import { useAppNavigation } from '@shared/lib/navigation';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { WalletConnectScreen } from '../WalletConnectScreen';

const mockGoBack = jest.fn();
const mockToWalletConnecting = jest.fn();
const mockToMain = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(useAppNavigation).mockReturnValue({
    goBack: mockGoBack,
    toWalletConnecting: mockToWalletConnecting,
    toMain: mockToMain,
  } as never);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WalletConnectScreen', () => {
  it('"지갑 연결" 타이틀을 렌더링한다', () => {
    render(<WalletConnectScreen />);
    expect(screen.getByText('지갑 연결')).toBeTruthy();
  });

  it('MetaMask 옵션을 렌더링한다', () => {
    render(<WalletConnectScreen />);
    expect(screen.getByText('MetaMask')).toBeTruthy();
  });

  it('Coinbase Wallet 옵션을 렌더링한다', () => {
    render(<WalletConnectScreen />);
    expect(screen.getByText('Coinbase Wallet')).toBeTruthy();
  });

  it('"연결하기" 버튼을 렌더링한다', () => {
    render(<WalletConnectScreen />);
    expect(screen.getByText('연결하기')).toBeTruthy();
  });

  it('이용약관 텍스트를 렌더링한다', () => {
    render(<WalletConnectScreen />);
    expect(screen.getByText(/이용약관/)).toBeTruthy();
  });

  it('연결하기 버튼 클릭 후 toWalletConnecting이 호출된다', async () => {
    render(<WalletConnectScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-연결하기'));
      jest.advanceTimersByTime(300);
    });

    expect(mockToWalletConnecting).toHaveBeenCalledWith('metamask');
  });

  it('Coinbase 선택 후 연결하기 클릭 시 coinbase walletType으로 호출된다', async () => {
    render(<WalletConnectScreen />);

    fireEvent.press(screen.getByText('Coinbase Wallet'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-연결하기'));
      jest.advanceTimersByTime(300);
    });

    expect(mockToWalletConnecting).toHaveBeenCalledWith('coinbase');
  });

  it('Coinbase 선택 후 MetaMask 재선택 시 metamask walletType으로 호출된다', async () => {
    render(<WalletConnectScreen />);

    fireEvent.press(screen.getByText('Coinbase Wallet'));
    fireEvent.press(screen.getByText('MetaMask'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-연결하기'));
      jest.advanceTimersByTime(300);
    });

    expect(mockToWalletConnecting).toHaveBeenCalledWith('metamask');
  });
});
