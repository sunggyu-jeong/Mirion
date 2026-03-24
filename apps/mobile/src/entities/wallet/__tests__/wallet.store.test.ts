jest.mock('../api/secure-key', () => ({
  secureKey: {
    has: jest.fn(),
    delete: jest.fn(),
    generate: jest.fn(),
    retrieve: jest.fn(),
    store: jest.fn(),
    retrieveData: jest.fn(),
  },
}));

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: { createHybridObject: jest.fn().mockReturnValue({}) },
}));

import { secureKey } from '../api/secure-key';
import { useWalletStore } from '../model/wallet.store';

const mockHas = jest.mocked(secureKey.has);
const mockDelete = jest.mocked(secureKey.delete);
const mockGenerate = jest.mocked(secureKey.generate);
const mockRetrieveData = jest.mocked(secureKey.retrieveData);

describe('useWalletStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWalletStore.setState({
      address: null,
      isInitialized: false,
      isConnected: false,
      walletType: null,
    });
  });

  describe('초기 상태', () => {
    it('address가 null이다', () => {
      expect(useWalletStore.getState().address).toBeNull();
    });

    it('초기화되지 않은 상태이다', () => {
      expect(useWalletStore.getState().isInitialized).toBe(false);
    });

    it('isConnected가 false이다', () => {
      expect(useWalletStore.getState().isConnected).toBe(false);
    });

    it('walletType이 null이다', () => {
      expect(useWalletStore.getState().walletType).toBeNull();
    });
  });

  describe('generateKey', () => {
    it('성공 시 isInitialized를 true로 설정한다', async () => {
      mockGenerate.mockResolvedValue(true);
      const result = await useWalletStore.getState().generateKey('wallet-1');
      expect(result).toBe(true);
      expect(useWalletStore.getState().isInitialized).toBe(true);
    });

    it('실패 시 isInitialized를 변경하지 않는다', async () => {
      mockGenerate.mockResolvedValue(false);
      await useWalletStore.getState().generateKey('wallet-1');
      expect(useWalletStore.getState().isInitialized).toBe(false);
    });

    it('keyId로 secureKey.generate를 호출한다', async () => {
      mockGenerate.mockResolvedValue(true);
      await useWalletStore.getState().generateKey('wallet-abc');
      expect(mockGenerate).toHaveBeenCalledWith('wallet-abc');
    });

    it('secureKey.generate의 에러를 전파한다', async () => {
      mockGenerate.mockRejectedValue(new Error('native error'));
      await expect(useWalletStore.getState().generateKey('wallet-1')).rejects.toThrow(
        'native error',
      );
    });
  });

  describe('hasKey', () => {
    it('secureKey.has에 위임한다', () => {
      mockHas.mockReturnValue(true);
      const result = useWalletStore.getState().hasKey('wallet-1');
      expect(mockHas).toHaveBeenCalledWith('wallet-1');
      expect(result).toBe(true);
    });

    it('키가 존재하지 않으면 false를 반환한다', () => {
      mockHas.mockReturnValue(false);
      expect(useWalletStore.getState().hasKey('wallet-1')).toBe(false);
    });
  });

  describe('deleteKey', () => {
    it('address와 isInitialized를 초기화한다', () => {
      mockDelete.mockReturnValue(true);
      useWalletStore.setState({ address: '0xABC', isInitialized: true });
      useWalletStore.getState().deleteKey('wallet-1');
      expect(useWalletStore.getState().address).toBeNull();
      expect(useWalletStore.getState().isInitialized).toBe(false);
    });

    it('keyId로 secureKey.delete를 호출한다', () => {
      mockDelete.mockReturnValue(true);
      useWalletStore.getState().deleteKey('wallet-1');
      expect(mockDelete).toHaveBeenCalledWith('wallet-1');
    });

    it('삭제 결과를 반환한다', () => {
      mockDelete.mockReturnValue(false);
      expect(useWalletStore.getState().deleteKey('wallet-1')).toBe(false);
    });
  });

  describe('setSession', () => {
    it('호출 후 address와 walletType이 올바르게 저장된다', () => {
      useWalletStore.getState().setSession('0xDEAD', 'walletconnect');
      const state = useWalletStore.getState();
      expect(state.address).toBe('0xDEAD');
      expect(state.walletType).toBe('walletconnect');
      expect(state.isConnected).toBe(true);
      expect(state.isInitialized).toBe(true);
    });

    it('Coinbase walletType을 저장한다', () => {
      useWalletStore.getState().setSession('0xCB01', 'coinbase');
      expect(useWalletStore.getState().walletType).toBe('coinbase');
    });
  });

  describe('clearSession', () => {
    it('호출 후 모든 세션 상태가 초기화된다', () => {
      useWalletStore.setState({
        address: '0xDEAD',
        walletType: 'walletconnect',
        isConnected: true,
        isInitialized: true,
      });
      useWalletStore.getState().clearSession();
      const state = useWalletStore.getState();
      expect(state.address).toBeNull();
      expect(state.walletType).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('syncSession', () => {
    it('딥링크 복귀 후 JSI retrieveData를 호출한다', async () => {
      mockRetrieveData.mockResolvedValue('0xDEAD');
      await useWalletStore.getState().syncSession('wallet-1');
      expect(mockRetrieveData).toHaveBeenCalledWith('wallet-1');
    });

    it('JSI retrieveData가 null을 반환하면 연결 상태가 해제된다', async () => {
      mockRetrieveData.mockResolvedValue(null);
      useWalletStore.setState({
        address: '0xDEAD',
        isConnected: true,
        walletType: 'walletconnect',
      });
      await useWalletStore.getState().syncSession('wallet-1');
      const state = useWalletStore.getState();
      expect(state.address).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.walletType).toBeNull();
    });

    it('JSI retrieveData가 address를 반환하면 상태를 변경하지 않는다', async () => {
      mockRetrieveData.mockResolvedValue('0xDEAD');
      useWalletStore.setState({
        address: '0xDEAD',
        isConnected: true,
        walletType: 'walletconnect',
      });
      await useWalletStore.getState().syncSession('wallet-1');
      expect(useWalletStore.getState().isConnected).toBe(true);
    });
  });
});
