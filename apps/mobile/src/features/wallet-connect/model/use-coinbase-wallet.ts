import { CB_SESSION_KEY, useWalletStore } from '@entities/wallet';
import { storage } from '@shared/lib/storage';
import SignClient from '@walletconnect/sign-client';
import { useRef, useState } from 'react';
import { Linking } from 'react-native';

const PROJECT_ID = 'b6a245dd890f6d3f0528ffc01efa78aa';
const CHAIN_CAIP = 'eip155:8453';

let clientPromise: Promise<InstanceType<typeof SignClient>> | null = null;

function getSignClient() {
  if (!clientPromise) {
    clientPromise = SignClient.init({
      projectId: PROJECT_ID,
      metadata: {
        name: 'LockFi',
        description: 'LockFi DeFi App',
        url: 'https://lockfi.app',
        icons: ['https://lockfi.app/icon.png'],
      },
    }).catch(e => {
      clientPromise = null;
      throw e;
    });
  }
  return clientPromise;
}

export function useCoinbaseWallet() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setSession = useWalletStore(s => s.setSession);
  const clearSession = useWalletStore(s => s.clearSession);
  const isMounted = useRef(true);

  const connectWallet = async () => {
    setIsPending(true);
    setError(null);
    try {
      const client = await getSignClient();

      const { uri, approval } = await client.connect({
        requiredNamespaces: {
          eip155: {
            methods: ['eth_sendTransaction', 'personal_sign', 'eth_sign'],
            chains: [CHAIN_CAIP],
            events: ['accountsChanged', 'chainChanged'],
          },
        },
      });

      if (uri) {
        await Linking.openURL(`cbwallet://wc?uri=${encodeURIComponent(uri)}`);
      }

      const session = await approval();
      const accounts = session.namespaces.eip155?.accounts ?? [];
      const address = accounts[0]?.split(':')[2];

      if (!address) {
        throw new Error('Coinbase 연결 실패: 계정을 가져올 수 없습니다');
      }

      storage.set(CB_SESSION_KEY, address);
      setSession(address, 'coinbase');
      return address;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (isMounted.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setIsPending(false);
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      const client = await getSignClient();
      const sessions = client.session.getAll();
      await Promise.all(
        sessions.map(s =>
          client.disconnect({
            topic: s.topic,
            reason: { code: 6000, message: 'User disconnected' },
          }),
        ),
      );
    } catch {
      // 세션이 없거나 이미 끊긴 경우 무시
    }
    storage.remove(CB_SESSION_KEY);
    clearSession();
  };

  return { connectWallet, disconnectWallet, isPending, error };
}
