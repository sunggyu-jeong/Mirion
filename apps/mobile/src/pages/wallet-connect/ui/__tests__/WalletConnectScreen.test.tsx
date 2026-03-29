jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@features/wallet-connect', () => ({
  useWalletConnect: jest.fn(),
  useCoinbaseWallet: jest.fn(),
}));

jest.mock('@shared/ui', () => {
  const React = require('react');
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
      { children }: { children: React.ReactNode; onDismiss?: () => void },
      ref: React.Ref<{ open: () => void; close: (cb?: () => void) => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({
        open: jest.fn(),
        close: (cb?: () => void) => cb?.(),
      }));
      return <>{children}</>;
    },
  );
  BottomSheet.displayName = 'BottomSheet';
  return { PrimaryButton, BottomSheet };
});

import { useCoinbaseWallet, useWalletConnect } from '@features/wallet-connect';
import { useAppNavigation } from '@shared/lib/navigation';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { WalletConnectScreen } from '../WalletConnectScreen';

const mockGoBack = jest.fn();
const mockToMain = jest.fn();
const mockConnectMetaMask = jest.fn();
const mockConnectCoinbase = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useAppNavigation)
    .mockReturnValue({ goBack: mockGoBack, toMain: mockToMain } as never);
  jest
    .mocked(useWalletConnect)
    .mockReturnValue({ connectWallet: mockConnectMetaMask, isPending: false } as never);
  jest
    .mocked(useCoinbaseWallet)
    .mockReturnValue({ connectWallet: mockConnectCoinbase, isPending: false } as never);
  mockConnectMetaMask.mockResolvedValue('0xabc');
  mockConnectCoinbase.mockResolvedValue('0xdef');
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

  it('MetaMask 선택 후 연결하기 누르면 connectMetaMask가 호출된다', async () => {
    render(<WalletConnectScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-연결하기'));
    });
    expect(mockConnectMetaMask).toHaveBeenCalled();
    expect(mockToMain).toHaveBeenCalled();
  });

  it('Coinbase 선택 후 연결하기 누르면 connectCoinbase가 호출된다', async () => {
    render(<WalletConnectScreen />);
    fireEvent.press(screen.getByText('Coinbase Wallet'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-연결하기'));
    });
    expect(mockConnectCoinbase).toHaveBeenCalled();
    expect(mockToMain).toHaveBeenCalled();
  });

  it('연결 실패 시 toMain이 호출되지 않는다', async () => {
    mockConnectMetaMask.mockRejectedValue(new Error('사용자 취소'));
    render(<WalletConnectScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('btn-연결하기'));
    });
    expect(mockToMain).not.toHaveBeenCalled();
  });
});
