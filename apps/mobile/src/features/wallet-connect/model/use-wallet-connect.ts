import { secureKey, useWalletStore, WC_SESSION_KEY } from '@entities/wallet';
import MetaMaskSDK from '@metamask/sdk';
import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useWalletConnect() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const address = useWalletStore(s => s.address);
  const isConnected = useWalletStore(s => s.isConnected);
  const setSession = useWalletStore(s => s.setSession);
  const clearSession = useWalletStore(s => s.clearSession);
  const syncSession = useWalletStore(s => s.syncSession);
  const sdkRef = useRef(
    new MetaMaskSDK({ dappMetadata: { name: 'LockFi', url: 'https://lockfi.app' } }),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        syncSession(WC_SESSION_KEY);
      }
    });
    return () => sub.remove();
  }, [syncSession]);

  const connectWallet = async () => {
    setIsPending(true);
    setError(null);
    try {
      const ethereum = sdkRef.current.getProvider();
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const account = accounts[0];
      await secureKey.store(WC_SESSION_KEY, account);
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
    secureKey.delete(WC_SESSION_KEY);
    clearSession();
  };

  return { connectWallet, disconnectWallet, address, isConnected, isPending, error };
}
