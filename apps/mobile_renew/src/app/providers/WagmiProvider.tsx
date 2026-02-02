import { getWagmiConfig } from '@/shared';
import { useMemo, type ReactNode } from 'react';
import { WagmiProvider as WagmiConfigProvider } from 'wagmi';


export default function WagmiProvider({ children }: { children: ReactNode }) {
  const wagmiConfig = useMemo(() => {
    try {
      return getWagmiConfig();
    } catch (e) {
      console.error('Failed to create Wagmi Config:', e);
      return null;
    }
  }, []);

  if (!wagmiConfig) {
    return <>{children}</>;
  }

  return <WagmiConfigProvider config={wagmiConfig}>{children}</WagmiConfigProvider>;
}
