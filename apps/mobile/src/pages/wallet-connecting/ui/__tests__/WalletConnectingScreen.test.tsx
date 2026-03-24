jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    View: require('react-native').View,
    createAnimatedComponent: (c: any) => c,
  },
  useSharedValue: (v: any) => ({ value: v }),
  useAnimatedStyle: (fn: any) => {
    try {
      return fn();
    } catch {
      return {};
    }
  },
  withTiming: (v: any) => v,
  withRepeat: (v: any) => v,
  withSpring: (v: any) => v,
  Easing: { linear: (t: any) => t },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@shared/ui', () => ({
  PrimaryButton: ({ label, onPress }: { label: string; onPress?: () => void }) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        onPress={onPress}
        testID="cancel-btn"
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('@features/wallet-connect', () => ({
  useWalletConnect: jest.fn(),
  useCoinbaseWallet: jest.fn(),
}));

import { useCoinbaseWallet, useWalletConnect } from '@features/wallet-connect';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { WalletConnectingScreen } from '../WalletConnectingScreen';

const mockGoBack = jest.fn();
const mockToStaking = jest.fn();
const mockConnectMetaMask = jest.fn();
const mockConnectCoinbase = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppNavigation).mockReturnValue({
    goBack: mockGoBack,
    toStaking: mockToStaking,
  } as never);
  jest.mocked(useWalletConnect).mockReturnValue({
    connectWallet: mockConnectMetaMask,
  } as never);
  jest.mocked(useCoinbaseWallet).mockReturnValue({
    connectWallet: mockConnectCoinbase,
  } as never);
});

describe('WalletConnectingScreen', () => {
  describe('MetaMask', () => {
    beforeEach(() => {
      jest.mocked(useRoute).mockReturnValue({ params: { walletType: 'metamask' } } as never);
    });

    it('"MetaMask 연결 중..." 텍스트를 렌더링한다', () => {
      mockConnectMetaMask.mockReturnValue(new Promise(() => {}));
      render(<WalletConnectingScreen />);
      expect(screen.getByText('MetaMask 연결 중...')).toBeTruthy();
    });

    it('연결 성공 시 toStaking을 호출한다', async () => {
      mockConnectMetaMask.mockResolvedValue(undefined);

      render(<WalletConnectingScreen />);

      await waitFor(() => {
        expect(mockConnectMetaMask).toHaveBeenCalled();
        expect(mockToStaking).toHaveBeenCalled();
      });
    });

    it('연결 실패 시 goBack을 호출한다', async () => {
      mockConnectMetaMask.mockRejectedValue(new Error('연결 실패'));

      render(<WalletConnectingScreen />);

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });

  describe('Coinbase', () => {
    beforeEach(() => {
      jest.mocked(useRoute).mockReturnValue({ params: { walletType: 'coinbase' } } as never);
    });

    it('"Coinbase Wallet 연결 중..." 텍스트를 렌더링한다', () => {
      mockConnectCoinbase.mockReturnValue(new Promise(() => {}));
      render(<WalletConnectingScreen />);
      expect(screen.getByText('Coinbase Wallet 연결 중...')).toBeTruthy();
    });

    it('연결 성공 시 connectCoinbase를 호출한다', async () => {
      mockConnectCoinbase.mockResolvedValue(undefined);

      render(<WalletConnectingScreen />);

      await waitFor(() => {
        expect(mockConnectCoinbase).toHaveBeenCalled();
      });
    });
  });

  describe('취소 버튼', () => {
    beforeEach(() => {
      jest.mocked(useRoute).mockReturnValue({ params: { walletType: 'metamask' } } as never);
      mockConnectMetaMask.mockReturnValue(new Promise(() => {}));
    });

    it('취소 버튼 클릭 시 goBack을 호출한다', () => {
      render(<WalletConnectingScreen />);
      fireEvent.press(screen.getByTestId('cancel-btn'));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('언마운트 후 연결 완료', () => {
    beforeEach(() => {
      jest.mocked(useRoute).mockReturnValue({ params: { walletType: 'metamask' } } as never);
    });

    it('언마운트 후 연결 완료 시 toStaking을 호출하지 않는다', async () => {
      let resolve!: () => void;
      mockConnectMetaMask.mockReturnValue(
        new Promise<void>(r => {
          resolve = r;
        }),
      );

      const { unmount } = render(<WalletConnectingScreen />);
      unmount();
      resolve();

      await new Promise(r => setTimeout(r, 0));
      expect(mockToStaking).not.toHaveBeenCalled();
    });

    it('언마운트 후 연결 실패 시 goBack을 호출하지 않는다', async () => {
      let reject!: (e: Error) => void;
      mockConnectMetaMask.mockReturnValue(
        new Promise<void>((_, r) => {
          reject = r;
        }),
      );

      const { unmount } = render(<WalletConnectingScreen />);
      unmount();
      reject(new Error('fail'));

      await new Promise(r => setTimeout(r, 0));
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe('walletType 기본값', () => {
    beforeEach(() => {
      jest.mocked(useRoute).mockReturnValue({ params: undefined } as never);
      mockConnectMetaMask.mockReturnValue(new Promise(() => {}));
    });

    it('walletType 미지정 시 metamask로 fallback된다', () => {
      render(<WalletConnectingScreen />);
      expect(screen.getByText('MetaMask 연결 중...')).toBeTruthy();
    });
  });
});
