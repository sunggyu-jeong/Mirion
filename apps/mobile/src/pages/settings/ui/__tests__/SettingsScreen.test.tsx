jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@features/wallet-connect', () => ({
  useWalletConnect: jest.fn(),
  useCoinbaseWallet: jest.fn(),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    ScreenTitle: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    SectionTitle: ({ title }: { title: string }) => <Text>{title}</Text>,
    PrimaryButton: ({ label, onPress }: { label: string; onPress?: () => void }) => (
      <TouchableOpacity
        onPress={onPress}
        testID={`btn-${label}`}
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@widgets/wallet-info', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    WalletAddressCard: ({ address }: { address: string | null }) => (
      <Text testID="wallet-address">{address ?? '-'}</Text>
    ),
    AppInfoCard: () => {
      const { View } = require('react-native');
      return <View testID="app-info-card" />;
    },
  };
});

import { useWalletStore } from '@entities/wallet';
import { useCoinbaseWallet, useWalletConnect } from '@features/wallet-connect';
import { useAppNavigation } from '@shared/lib/navigation';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { SettingsScreen } from '../SettingsScreen';

const mockDisconnectMetaMask = jest.fn();
const mockDisconnectCoinbase = jest.fn();
const mockToOnboarding = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppNavigation).mockReturnValue({ toOnboarding: mockToOnboarding } as never);
  jest
    .mocked(useWalletConnect)
    .mockReturnValue({ disconnectWallet: mockDisconnectMetaMask } as never);
  jest
    .mocked(useCoinbaseWallet)
    .mockReturnValue({ disconnectWallet: mockDisconnectCoinbase } as never);
});

describe('SettingsScreen', () => {
  it('"설정" 타이틀을 렌더링한다', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: null; walletType: null }) => unknown) =>
        selector({ address: null, walletType: null }),
      );
    render(<SettingsScreen />);
    expect(screen.getByText('설정')).toBeTruthy();
  });

  it('지갑 정보 섹션을 렌더링한다', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: string; walletType: string }) => unknown) =>
        selector({ address: '0xABC', walletType: 'walletconnect' }),
      );
    render(<SettingsScreen />);
    expect(screen.getByText('지갑 정보')).toBeTruthy();
    expect(screen.getByText('정보')).toBeTruthy();
  });

  it('address가 있으면 "지갑 연결 해제" 버튼을 렌더링한다', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: string; walletType: string }) => unknown) =>
        selector({ address: '0xABC', walletType: 'walletconnect' }),
      );
    render(<SettingsScreen />);
    expect(screen.getByText('지갑 연결 해제')).toBeTruthy();
  });

  it('address가 null이면 "지갑 연결 해제" 버튼을 렌더링하지 않는다', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: null; walletType: null }) => unknown) =>
        selector({ address: null, walletType: null }),
      );
    render(<SettingsScreen />);
    expect(screen.queryByText('지갑 연결 해제')).toBeNull();
  });

  it('walletconnect 타입일 때 MetaMask 연결 해제 호출', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: string; walletType: string }) => unknown) =>
        selector({ address: '0xABC', walletType: 'walletconnect' }),
      );
    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('btn-지갑 연결 해제'));
    expect(mockDisconnectMetaMask).toHaveBeenCalled();
    expect(mockToOnboarding).toHaveBeenCalled();
  });

  it('coinbase 타입일 때 Coinbase 연결 해제 호출', () => {
    jest
      .mocked(useWalletStore)
      .mockImplementation((selector: (s: { address: string; walletType: string }) => unknown) =>
        selector({ address: '0xDEF', walletType: 'coinbase' }),
      );
    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('btn-지갑 연결 해제'));
    expect(mockDisconnectCoinbase).toHaveBeenCalled();
    expect(mockToOnboarding).toHaveBeenCalled();
  });
});
