import '@walletconnect/react-native-compat';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

//FIXME: WalletConnect 프로젝트 연동 필요
const projectId = '';

if (typeof window === 'undefined' || !(global as any).CustomEvent) {
  const noop = () => {};
  const globalAny = global as any;

  globalAny.window = globalAny;
  globalAny.addEventListener = noop;
  globalAny.removeEventListener = noop;
  globalAny.dispatchEvent = () => false;

  if (!globalAny.CustomEvent) {
    globalAny.CustomEvent = class CustomEvent {
      constructor(event: string, params: any) {
        (this as any).event = event;
        (this as any).params = params;
      }
    };
  }

  if (!globalAny.document) {
    globalAny.document = {
      addEventListener: noop,
      removeEventListener: noop,
    };
  }
}

const storage = createStorage({
  storage: AsyncStorage,
  key: 'lockfi-wagmi-storage',
});

export const config = createConfig({
  chains: [mainnet, sepolia],
  storage,
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'LockFi',
        description: 'TimeLock Wallet',
        url: 'https://lockfi.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: 'LockFi',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function getWagmiConfig() {
  return config;
}
