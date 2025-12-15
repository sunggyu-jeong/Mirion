import { config } from "@/src/shared/config/wagmiConfig";
import { WagmiProvider as Provider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Props {
    children: React.ReactNode;
}

const queryClient = new QueryClient();

export const WagmiProvider = ({ children}: Props) => {
    return (
        <Provider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )
}
