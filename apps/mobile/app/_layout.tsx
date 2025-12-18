import { StoreProvider } from '@/src/composition/providers/StoreProvider';
import WagmiProvider from '@/src/composition/providers/WagmiProvider';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3
    }
  }
})

export default function RootLayout() {
  return (
    <WagmiProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#ffffff' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </StoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}