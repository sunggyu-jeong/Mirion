import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

jest.mock('@metamask/sdk', () =>
  jest.fn().mockImplementation(() => ({
    getProvider: jest.fn().mockReturnValue({ request: jest.fn() }),
    disconnect: jest.fn(),
  })),
);

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
  WC_SESSION_KEY: 'wc-session-key',
}));

jest.mock('@shared/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import { useWalletStore } from '@entities/wallet';
import MetaMaskSDK from '@metamask/sdk';
import { storage } from '@shared/lib/storage';

import { useWalletConnect } from '../model/use-wallet-connect';

const mockSetSession = jest.fn();
const mockClearSession = jest.fn();
const mockRequest = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(MetaMaskSDK).mockImplementation(
    () =>
      ({
        getProvider: () => ({ request: mockRequest }),
        disconnect: mockDisconnect,
      }) as never,
  );
  jest.mocked(useWalletStore).mockImplementation(((selector: (state: unknown) => unknown) =>
    selector({
      address: undefined,
      isConnected: false,
      setSession: mockSetSession,
      clearSession: mockClearSession,
    })) as never);
});

describe('useWalletConnect', () => {
  describe('초기 상태', () => {
    it('초기 isConnected가 false이다', () => {
      const { result } = renderHook(() => useWalletConnect());
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('connectWallet', () => {
    it('연결 성공 시 address를 MMKV에 저장한다', async () => {
      mockRequest.mockResolvedValue(['0xABC123']);

      const { result } = renderHook(() => useWalletConnect());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(storage.set).toHaveBeenCalledWith('wc-session-key', '0xABC123');
    });

    it('연결 성공 시 address가 스토어에 저장된다', async () => {
      mockRequest.mockResolvedValue(['0xABC123']);

      const { result } = renderHook(() => useWalletConnect());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(mockSetSession).toHaveBeenCalledWith('0xABC123', 'walletconnect');
    });

    it('연결 실패 시 에러가 전파된다', async () => {
      mockRequest.mockRejectedValue(new Error('연결 거부됨'));

      const { result } = renderHook(() => useWalletConnect());
      await expect(
        act(async () => {
          await result.current.connectWallet();
        }),
      ).rejects.toThrow('연결 거부됨');
    });

    it('연결 실패 시 storage.set이 호출되지 않는다', async () => {
      mockRequest.mockRejectedValue(new Error('연결 거부됨'));

      const { result } = renderHook(() => useWalletConnect());
      await act(async () => {
        await result.current.connectWallet().catch(() => {});
      });

      expect(storage.set).not.toHaveBeenCalled();
    });
  });

  describe('disconnectWallet', () => {
    it('disconnect 호출 시 storage.remove가 호출된다', () => {
      const { result } = renderHook(() => useWalletConnect());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(storage.remove).toHaveBeenCalledWith('wc-session-key');
    });

    it('disconnect 후 clearSession이 호출된다', () => {
      const { result } = renderHook(() => useWalletConnect());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(mockClearSession).toHaveBeenCalled();
    });
  });

  describe('앱 복귀 시 세션 동기화', () => {
    it('앱이 active 상태로 전환될 때 세션 없으면 clearSession 호출된다', () => {
      jest.mocked(storage.getString).mockReturnValue(undefined);

      renderHook(() => useWalletConnect());

      act(() => {
        const handlers = jest.mocked(AppState.addEventListener).mock.calls;
        const changeHandler = handlers.find(args => args[0] === 'change')?.[1] as
          | ((state: string) => void)
          | undefined;
        changeHandler?.('active');
      });

      expect(mockClearSession).toHaveBeenCalled();
    });
  });
});
