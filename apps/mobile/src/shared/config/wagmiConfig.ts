import AsyncStorage from '@react-native-async-storage/async-storage';
import { createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';

if (typeof window === 'undefined') {
  (global as any).window = global;
  (global as any).window.addEventListener = () => {};
  (global as any).window.removeEventListener = () => {};
}

const storage = createStorage({
  storage: AsyncStorage,
  key: 'lockfi-wagmi-storage',
});

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage,
  ssr: false,
  multiInjectedProviderDiscovery: false,
});

export function getWagmiConfig() {
  return config;
}
