import { act, renderHook } from '@testing-library/react-native';

jest.mock('@walletconnect/sign-client', () => ({
  __esModule: true,
  default: { init: jest.fn() },
}));

jest.mock('react-native', () => ({
  Linking: { openURL: jest.fn().mockResolvedValue(undefined) },
  useState: jest.requireActual('react').useState,
}));

jest.mock('@entities/wallet', () => ({
  useWalletStore: jest.fn(),
  CB_SESSION_KEY: 'cb-session-key',
}));

jest.mock('@shared/lib/storage', () => ({
  storage: {
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import { useWalletStore } from '@entities/wallet';
import { storage } from '@shared/lib/storage';
import SignClient from '@walletconnect/sign-client';

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
  jest
    .mocked(useWalletStore)
    .mockImplementation(((selector: (state: unknown) => unknown) =>
      selector({ setSession: mockSetSession, clearSession: mockClearSession })) as never);
});

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

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(mockSetSession).toHaveBeenCalledWith('0xCB456DEF', 'coinbase');
    });

    it('연결 성공 시 address를 MMKV에 저장한다', async () => {
      mockConnect.mockResolvedValue({
        uri: 'wc:abc123',
        approval: jest.fn().mockResolvedValue({
          namespaces: { eip155: { accounts: ['eip155:84532:0xCB456DEF'] } },
        }),
      });

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(storage.set).toHaveBeenCalledWith('cb-session-key', '0xCB456DEF');
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
        act(async () => {
          await result.current.connectWallet();
        }),
      ).rejects.toThrow('Coinbase 연결 실패: 계정을 가져올 수 없습니다');
    });
  });

  describe('disconnectWallet', () => {
    it('disconnect 후 storage.remove가 호출된다', async () => {
      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(storage.remove).toHaveBeenCalledWith('cb-session-key');
    });

    it('disconnect 후 clearSession이 호출된다', async () => {
      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(mockClearSession).toHaveBeenCalled();
    });

    it('세션이 있으면 각 세션을 disconnect한다', async () => {
      mockSessionGetAll.mockReturnValue([{ topic: 'topic-1' }, { topic: 'topic-2' }]);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(mockDisconnect).toHaveBeenCalledTimes(2);
      expect(mockDisconnect).toHaveBeenCalledWith({
        topic: 'topic-1',
        reason: { code: 6000, message: 'User disconnected' },
      });
    });

    it('disconnect 중 에러가 발생해도 clearSession은 호출된다', async () => {
      mockDisconnect.mockRejectedValue(new Error('disconnect 실패'));
      mockSessionGetAll.mockReturnValue([{ topic: 'topic-err' }]);

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(mockClearSession).toHaveBeenCalled();
    });
  });

  describe('connectWallet — uri 없음', () => {
    it('uri가 없으면 Linking.openURL을 호출하지 않는다', async () => {
      const { Linking } = require('react-native');
      mockConnect.mockResolvedValue({
        uri: undefined,
        approval: jest.fn().mockResolvedValue({
          namespaces: { eip155: { accounts: ['eip155:84532:0xCB456DEF'] } },
        }),
      });

      const { result } = renderHook(() => useCoinbaseWallet());
      await act(async () => {
        await result.current.connectWallet();
      });

      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('connectWallet — 비Error 예외', () => {
    it('string 예외도 Error로 변환하여 처리한다', async () => {
      mockConnect.mockRejectedValue('string error');

      const { result } = renderHook(() => useCoinbaseWallet());
      await expect(
        act(async () => {
          await result.current.connectWallet();
        }),
      ).rejects.toThrow('string error');
    });
  });
});
