import { useWalletStore, WC_SESSION_KEY } from '@entities/wallet';
import MetaMaskSDK from '@metamask/sdk';
import { storage } from '@shared/lib/storage';
import { toast } from '@shared/lib/toast';
import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useWalletConnect() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const address = useWalletStore(s => s.address);
  const isConnected = useWalletStore(s => s.isConnected);
  const setSession = useWalletStore(s => s.setSession);
  const clearSession = useWalletStore(s => s.clearSession);
  const sdkRef = useRef(
    new MetaMaskSDK({ dappMetadata: { name: 'LockFi', url: 'https://lockfi.app' } }),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        const saved = storage.getString(WC_SESSION_KEY);
        if (!saved) {
          clearSession();
        }
      }
    });
    return () => sub.remove();
  }, [clearSession]);

  const connectWallet = async () => {
    setIsPending(true);
    setError(null);
    try {
      const ethereum = sdkRef.current.getProvider();
      if (!ethereum) {
        throw new Error('Provider를 초기화할 수 없습니다');
      }
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const account = accounts[0];

      const chainId = (await ethereum.request({ method: 'eth_chainId' })) as string;
      if (parseInt(chainId, 16) !== 1) {
        toast.error('이더리움 메인넷에 연결해주세요 (현재 네트워크가 다릅니다)');
      }

      storage.set(WC_SESSION_KEY, account);
      setSession(account, 'walletconnect');
      return account;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  const disconnectWallet = () => {
    sdkRef.current.disconnect();
    storage.remove(WC_SESSION_KEY);
    clearSession();
  };

  return { connectWallet, disconnectWallet, address, isConnected, isPending, error };
}
