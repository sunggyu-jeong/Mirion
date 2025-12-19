import { http, createConfig, createStorage } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { mock } from 'wagmi/connectors'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  },
  connectors: [
    mock({
      accounts: ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8']
    })
  ],
  storage: createStorage({
    storage: AsyncStorage,
    key: 'rakpy-wagmi'
  })
});

export function getWagmiConfig() {
  return config;
}