import { getWagmiConfig } from '@/src/shared/config/wagmiConfig';
import React, { useMemo } from 'react';
import { WagmiProvider as WagmiConfigProvider } from 'wagmi';

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
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
