jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
  WC_SESSION_KEY: 'wc-session-key',
  CB_SESSION_KEY: 'cb-session-key',
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@shared/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@pages/legal', () => ({
  LEGAL_ACCEPTED_KEY: 'legal-accepted',
}));

import { useWalletStore } from '@entities/wallet';
import { useAppNavigation } from '@shared/lib/navigation';
import { storage } from '@shared/lib/storage';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { SplashScreen } from '../SplashScreen';

const mockToOnboarding = jest.fn();
const mockToMain = jest.fn();
const mockToLegal = jest.fn();
const mockSetSession = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(useAppNavigation).mockReturnValue({
    toOnboarding: mockToOnboarding,
    toMain: mockToMain,
    toLegal: mockToLegal,
  } as never);
  jest
    .mocked(useWalletStore)
    .mockImplementation(((selector: (s: { setSession: jest.Mock }) => unknown) =>
      selector({ setSession: mockSetSession })) as never);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('SplashScreen', () => {
  it('"LockFi" 텍스트를 렌더링한다', () => {
    jest.mocked(storage.getString).mockReturnValue(undefined);
    render(<SplashScreen />);
    expect(screen.getByText('LockFi')).toBeTruthy();
  });

  it('세션 없고 법적 고지 미동의 시 2초 후 toLegal을 호출한다', async () => {
    jest.mocked(storage.getString).mockReturnValue(undefined);
    render(<SplashScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockToLegal).toHaveBeenCalledTimes(1);
    expect(mockToOnboarding).not.toHaveBeenCalled();
    expect(mockToMain).not.toHaveBeenCalled();
  });

  it('세션 없고 법적 고지 동의 시 2초 후 toOnboarding을 호출한다', async () => {
    jest
      .mocked(storage.getString)
      .mockImplementation(key => (key === 'legal-accepted' ? '1' : undefined));
    render(<SplashScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockToOnboarding).toHaveBeenCalledTimes(1);
    expect(mockToLegal).not.toHaveBeenCalled();
    expect(mockToMain).not.toHaveBeenCalled();
  });

  it('wc-session-key가 있으면 주소 복원 후 toMain을 호출한다', async () => {
    jest
      .mocked(storage.getString)
      .mockImplementation(key => (key === 'wc-session-key' ? '0xUserAddress' : undefined));

    render(<SplashScreen />);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith('0xUserAddress', 'walletconnect');
      expect(mockToMain).toHaveBeenCalled();
    });
    expect(mockToOnboarding).not.toHaveBeenCalled();
  });

  it('cb-session-key가 있으면 coinbase 세션으로 toMain을 호출한다', async () => {
    jest
      .mocked(storage.getString)
      .mockImplementation(key => (key === 'cb-session-key' ? '0xCoinbaseAddress' : undefined));

    render(<SplashScreen />);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith('0xCoinbaseAddress', 'coinbase');
      expect(mockToMain).toHaveBeenCalled();
    });
  });
});
