import { baseSepolia } from 'viem/chains';
import { createConfig, http } from 'wagmi';

export function getWagmiConfig() {
  return createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
  });
}
