import AsyncStorage from '@react-native-async-storage/async-storage';
import { createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

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
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

export function getWagmiConfig() {
  return config;
}
