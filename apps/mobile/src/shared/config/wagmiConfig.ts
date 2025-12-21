import AsyncStorage from '@react-native-async-storage/async-storage';
import { createConfig, createStorage, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

const storage = createStorage({
  storage: {
    getItem: key => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: key => AsyncStorage.removeItem(key),
  },
  key: 'rakpy-wagmi',
});

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage,
});

export function getWagmiConfig() {
  return config;
}
