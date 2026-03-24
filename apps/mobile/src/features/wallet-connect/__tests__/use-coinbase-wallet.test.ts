import { act, renderHook } from '@testing-library/react-native';

// jest.mock은 호이스팅되므로 팩토리 안에서 jest.fn() 직접 정의
jest.mock('@walletconnect/sign-client', () => ({
  __esModule: true,
  default: { init: jest.fn() },
}));

jest.mock('react-native', () => ({
  Linking: { openURL: jest.fn().mockResolvedValue(undefined) },
  useState: jest.requireActual('react').useState,
}));

jest.mock('@entities/wallet', () => ({
  secureKey: { store: jest.fn(), delete: jest.fn() },
  useWalletStore: jest.fn(),
  CB_SESSION_KEY: 'cb-session-key',
}));

import SignClient from '@walletconnect/sign-client';
import { secureKey, useWalletStore } from '@entities/wallet';
import { useCoinbaseWallet } from '../model/use-coinbase-wallet';

const mockSetSession = jest.fn();
const mockClearSession = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockSessionGetAll = jest.fn();

const mockClientInstance = {
  connect: mockConnect,
  disconnect: mockDisconnect,
  session: { getAll: mockSessionGetAll },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSessionGetAll.mockReturnValue([]);
  jest.mocked(SignClient.init).mockResolvedValue(mockClientInstance as never);
  jest.mocked(useWalletStore).mockImplementation(((selector: (state: unknown) => unknown) =>
    selector({ setSession: mockSetSession, clearSession: mockClearSession })) as never);
});

// clientPromise 캐시 초기화 (모듈 재로드)
beforeAll(() => {
  jest.resetModules();
});

describe('useCoinbaseWallet', () => {
  describe('connectWallet', () => {
    it('연결 성공 시 address가 스토어에 저장된다', async () => {
      mockConnect.mockResolvedValue({
        uri: 'wc:abc123',
        approval: jest.fn().mockResolvedValue({
          namespaces: { eip155: { accounts: ['eip155:84532:0xCB456DEF'] } },
        }),
      });
      jest.mocked(secureKey.store).mockResolvedValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => { await result.current.connectWallet(); });

      expect(mockSetSession).toHaveBeenCalledWith('0xCB456DEF', 'coinbase');
    });

    it('연결 성공 시 address를 JSI에 저장한다', async () => {
      mockConnect.mockResolvedValue({
        uri: 'wc:abc123',
        approval: jest.fn().mockResolvedValue({
          namespaces: { eip155: { accounts: ['eip155:84532:0xCB456DEF'] } },
        }),
      });
      jest.mocked(secureKey.store).mockResolvedValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => { await result.current.connectWallet(); });

      expect(secureKey.store).toHaveBeenCalledWith('cb-session-key', '0xCB456DEF');
    });

    it('account가 없을 때 에러가 전파된다', async () => {
      mockConnect.mockResolvedValue({
        uri: 'wc:abc123',
        approval: jest.fn().mockResolvedValue({
          namespaces: { eip155: { accounts: [] } },
        }),
      });

      const { result } = renderHook(() => useCoinbaseWallet());
      await expect(
        act(async () => { await result.current.connectWallet(); }),
      ).rejects.toThrow('Coinbase 연결 실패: 계정을 가져올 수 없습니다');
    });

    it('connect 실패 시 에러가 전파된다', async () => {
      mockConnect.mockRejectedValue(new Error('연결 오류'));

      const { result } = renderHook(() => useCoinbaseWallet());
      await expect(
        act(async () => { await result.current.connectWallet(); }),
      ).rejects.toThrow('연결 오류');
    });
  });

  describe('disconnectWallet', () => {
    it('disconnect 후 secureKey.delete가 호출된다', async () => {
      jest.mocked(secureKey.delete).mockReturnValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => { await result.current.disconnectWallet(); });

      expect(secureKey.delete).toHaveBeenCalledWith('cb-session-key');
    });

    it('disconnect 후 clearSession이 호출된다', async () => {
      jest.mocked(secureKey.delete).mockReturnValue(true);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => { await result.current.disconnectWallet(); });

      expect(mockClearSession).toHaveBeenCalled();
    });
  });
});
