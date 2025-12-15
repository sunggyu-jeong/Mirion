import { config } from '@/src/shared/config/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider as Provider } from 'wagmi';

interface Props {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export const WagmiProvider = ({ children }: Props) => {
  return (
    <Provider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
};
