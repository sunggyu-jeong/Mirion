import WagmiProvider from '@/app/providers/WagmiProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}
export const Web3Provider = ({ children }: Props) => {
  return (
    <WagmiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
