import '../shared/lib/utils/shims';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { StoreProvider } from '@/src/app/providers/StoreProvider';
import WagmiProvider from '@/src/app/providers/WagmiProvider';
import { configureNotificationHandler } from '@/src/shared/lib';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    configureNotificationHandler();
  }, []);
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
