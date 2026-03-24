import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

jest.mock('@metamask/sdk', () =>
  jest.fn().mockImplementation(() => ({
    getProvider: jest.fn().mockReturnValue({ request: jest.fn() }),
    disconnect: jest.fn(),
  })),
);

jest.mock('@entities/wallet', () => ({
  secureKey: {
    store: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
    retrieve: jest.fn(),
    retrieveData: jest.fn(),
  },
  useWalletStore: jest.fn(),
  WC_SESSION_KEY: 'wc-session-key',
}));

import MetaMaskSDK from '@metamask/sdk';
import { secureKey, useWalletStore } from '@entities/wallet';

import { useWalletConnect } from '../model/use-wallet-connect';

const mockSetSession = jest.fn();
const mockClearSession = jest.fn();
const mockSyncSession = jest.fn();
const mockRequest = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(MetaMaskSDK).mockImplementation(() => ({
    getProvider: () => ({ request: mockRequest }),
    disconnect: mockDisconnect,
  }) as never);
  jest.mocked(useWalletStore).mockImplementation(((selector: (state: unknown) => unknown) =>
    selector({
      address: undefined,
      isConnected: false,
      setSession: mockSetSession,
      clearSession: mockClearSession,
      syncSession: mockSyncSession,
    })) as never);
});

describe('useWalletConnect', () => {
  describe('초기 상태', () => {
    it('초기 isConnected가 false이다', () => {
      const { result } = renderHook(() => useWalletConnect());
      expect(result.current.isConnected).toBe(false);
    });

    it('초기 address가 undefined이다', () => {
      const { result } = renderHook(() => useWalletConnect());
      expect(result.current.address).toBeUndefined();
    });
  });

  describe('connectWallet', () => {
    it('연결 성공 시 address를 JSI에 저장한다', async () => {
      mockRequest.mockResolvedValue(['0xABC123']);
      jest.mocked(secureKey.store).mockResolvedValue(true);

      const { result } = renderHook(() => useWalletConnect());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(secureKey.store).toHaveBeenCalledWith('wc-session-key', '0xABC123');
    });

    it('연결 성공 시 address가 스토어에 저장된다', async () => {
      mockRequest.mockResolvedValue(['0xABC123']);
      jest.mocked(secureKey.store).mockResolvedValue(true);

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

    it('연결 실패 시 secureKey.store가 호출되지 않는다', async () => {
      mockRequest.mockRejectedValue(new Error('연결 거부됨'));

      const { result } = renderHook(() => useWalletConnect());
      await act(async () => {
        await result.current.connectWallet().catch(() => {});
      });

      expect(secureKey.store).not.toHaveBeenCalled();
    });
  });

  describe('disconnectWallet', () => {
    it('disconnect 호출 시 secureKey.delete가 호출된다', () => {
      jest.mocked(secureKey.delete).mockReturnValue(true);

      const { result } = renderHook(() => useWalletConnect());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(secureKey.delete).toHaveBeenCalledWith('wc-session-key');
    });

    it('disconnect 후 clearSession이 호출된다', () => {
      jest.mocked(secureKey.delete).mockReturnValue(true);

      const { result } = renderHook(() => useWalletConnect());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(mockClearSession).toHaveBeenCalled();
    });
  });

  describe('딥링크 복귀 후 상태 동기화', () => {
    it('앱이 active 상태로 전환될 때 syncSession이 호출된다', () => {
      mockSyncSession.mockResolvedValue(undefined);

      renderHook(() => useWalletConnect());

      act(() => {
        const handlers = jest.mocked(AppState.addEventListener).mock.calls;
        const changeHandler = handlers.find(args => args[0] === 'change')?.[1] as
          | ((state: string) => void)
          | undefined;
        changeHandler?.('active');
      });

      expect(mockSyncSession).toHaveBeenCalledWith('wc-session-key');
    });

    it('앱이 background 상태일 때 syncSession이 호출되지 않는다', () => {
      renderHook(() => useWalletConnect());

      act(() => {
        const handlers = jest.mocked(AppState.addEventListener).mock.calls;
        const changeHandler = handlers.find(args => args[0] === 'change')?.[1] as
          | ((state: string) => void)
          | undefined;
        changeHandler?.('background');
      });

      expect(mockSyncSession).not.toHaveBeenCalled();
    });
  });
});
