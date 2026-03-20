jest.mock('@coinbase/wallet-mobile-sdk', () => ({
  configure: jest.fn(),
  initiateHandshake: jest.fn(),
  resetSession: jest.fn(),
}));

jest.mock('@entities/wallet', () => ({
  secureKey: {
    store: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
    retrieve: jest.fn(),
    retrieveData: jest.fn(),
  },
  useWalletStore: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react-native';
import { initiateHandshake, resetSession } from '@coinbase/wallet-mobile-sdk';
import { secureKey, useWalletStore } from '@entities/wallet';
import { useCoinbaseWallet } from '../model/use-coinbase-wallet';

const mockSetSession = jest.fn();
const mockClearSession = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useWalletStore).mockImplementation(
    ((selector: (state: unknown) => unknown) =>
      selector({
        setSession: mockSetSession,
        clearSession: mockClearSession,
      })) as never,
  );
});

describe('useCoinbaseWallet', () => {
  describe('connectWallet', () => {
    it('연결 성공 시 address가 스토어에 저장된다', async () => {
      jest.mocked(initiateHandshake).mockResolvedValue([
        [],
        { chain: '1', networkId: 1, address: '0xCB456DEF' },
      ]);
      jest.mocked(secureKey.store).mockResolvedValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(mockSetSession).toHaveBeenCalledWith('0xCB456DEF', 'coinbase');
    });

    it('연결 성공 시 address를 JSI에 저장한다', async () => {
      jest.mocked(initiateHandshake).mockResolvedValue([
        [],
        { chain: '1', networkId: 1, address: '0xCB456DEF' },
      ]);
      jest.mocked(secureKey.store).mockResolvedValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(secureKey.store).toHaveBeenCalledWith('cb-session-key', '0xCB456DEF');
    });

    it('account가 없을 때 에러가 전파된다', async () => {
      jest.mocked(initiateHandshake).mockResolvedValue([[], undefined]);

      const { result } = renderHook(() => useCoinbaseWallet());
      await expect(
        act(async () => {
          await result.current.connectWallet();
        }),
      ).rejects.toThrow('Coinbase 연결 실패: 계정을 가져올 수 없습니다');
    });

    it('initiateHandshake 실패 시 에러가 전파된다', async () => {
      jest.mocked(initiateHandshake).mockRejectedValue(new Error('SDK 오류'));

      const { result } = renderHook(() => useCoinbaseWallet());
      await expect(
        act(async () => {
          await result.current.connectWallet();
        }),
      ).rejects.toThrow('SDK 오류');
    });
  });

  describe('disconnectWallet', () => {
    it('resetSession 후 secureKey.delete가 호출된다', () => {
      jest.mocked(secureKey.delete).mockReturnValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(secureKey.delete).toHaveBeenCalledWith('cb-session-key');
    });

    it('disconnect 후 clearSession이 호출된다', () => {
      jest.mocked(secureKey.delete).mockReturnValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(mockClearSession).toHaveBeenCalled();
    });

    it('SDK resetSession이 호출된다', () => {
      const { result } = renderHook(() => useCoinbaseWallet());
      act(() => {
        result.current.disconnectWallet();
      });

      expect(resetSession).toHaveBeenCalled();
    });
  });
});
