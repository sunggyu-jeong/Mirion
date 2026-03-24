jest.mock('react-native-nitro-modules', () => ({
  NitroModules: { createHybridObject: jest.fn().mockReturnValue({}) },
}));

jest.mock('@entities/wallet', () => ({
  secureKey: {
    has: jest.fn(),
    retrieveData: jest.fn(),
  },
  useWalletStore: jest.fn(),
  WC_SESSION_KEY: 'wc-session-key',
  CB_SESSION_KEY: 'cb-session-key',
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

import { secureKey, useWalletStore } from '@entities/wallet';
import { useAppNavigation } from '@shared/lib/navigation';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { SplashScreen } from '../SplashScreen';

const mockToOnboarding = jest.fn();
const mockToStaking = jest.fn();
const mockSetSession = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(useAppNavigation).mockReturnValue({
    toOnboarding: mockToOnboarding,
    toStaking: mockToStaking,
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
    jest.mocked(secureKey.has).mockReturnValue(false);
    render(<SplashScreen />);
    expect(screen.getByText('LockFi')).toBeTruthy();
  });

  it('세션 없을 때 2초 후 toOnboarding을 호출한다', async () => {
    jest.mocked(secureKey.has).mockReturnValue(false);
    render(<SplashScreen />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockToOnboarding).toHaveBeenCalledTimes(1);
    expect(mockToStaking).not.toHaveBeenCalled();
  });

  it('wc-session-key가 있으면 주소 복원 후 toStaking을 호출한다', async () => {
    jest.mocked(secureKey.has).mockImplementation(key => key === 'wc-session-key');
    jest.mocked(secureKey.retrieveData).mockResolvedValue('0xUserAddress');

    render(<SplashScreen />);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith('0xUserAddress', 'walletconnect');
      expect(mockToStaking).toHaveBeenCalled();
    });
    expect(mockToOnboarding).not.toHaveBeenCalled();
  });

  it('cb-session-key가 있으면 coinbase 세션으로 toStaking을 호출한다', async () => {
    jest.mocked(secureKey.has).mockImplementation(key => key === 'cb-session-key');
    jest.mocked(secureKey.retrieveData).mockResolvedValue('0xCoinbaseAddress');

    render(<SplashScreen />);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith('0xCoinbaseAddress', 'coinbase');
      expect(mockToStaking).toHaveBeenCalled();
    });
  });

  it('키가 있지만 데이터가 null이면 toOnboarding을 호출한다', async () => {
    jest.mocked(secureKey.has).mockImplementation(key => key === 'wc-session-key');
    jest.mocked(secureKey.retrieveData).mockResolvedValue(null);

    render(<SplashScreen />);

    // retrieveData Promise가 resolve될 때까지 마이크로태스크를 플러시
    await act(async () => {});

    // setTimeout 2000ms 경과
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockToStaking).not.toHaveBeenCalled();
    expect(mockToOnboarding).toHaveBeenCalled();
  });
});
