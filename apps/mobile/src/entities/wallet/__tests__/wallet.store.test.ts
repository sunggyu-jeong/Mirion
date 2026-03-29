import { useWalletStore } from '../model/wallet.store';

describe('useWalletStore', () => {
  beforeEach(() => {
    useWalletStore.setState({ address: null, isConnected: false, walletType: null });
  });

  describe('초기 상태', () => {
    it('address가 null이다', () => {
      expect(useWalletStore.getState().address).toBeNull();
    });

    it('isConnected가 false이다', () => {
      expect(useWalletStore.getState().isConnected).toBe(false);
    });

    it('walletType이 null이다', () => {
      expect(useWalletStore.getState().walletType).toBeNull();
    });
  });

  describe('setSession', () => {
    it('address와 walletType이 올바르게 저장된다', () => {
      useWalletStore.getState().setSession('0xDEAD', 'walletconnect');
      const state = useWalletStore.getState();
      expect(state.address).toBe('0xDEAD');
      expect(state.walletType).toBe('walletconnect');
      expect(state.isConnected).toBe(true);
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
      });
      useWalletStore.getState().clearSession();
      const state = useWalletStore.getState();
      expect(state.address).toBeNull();
      expect(state.walletType).toBeNull();
      expect(state.isConnected).toBe(false);
    });
  });
});
