import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { StoreProvider } from '@/src/composition/providers/StoreProvider';
import WagmiProvider from '@/src/composition/providers/WagmiProvider';
import { configureNotificationHandler } from '@/src/shared/lib';

if (typeof window !== 'undefined') {
  if (typeof (window as any).CustomEvent !== 'function') {
    (window as any).CustomEvent = class CustomEvent {
      constructor(event: string, params: any) {
        return { type: event, detail: params?.detail };
      }
    };
  }
} else {
  (global as any).window = (global as any).window || {};
  (global as any).CustomEvent = class CustomEvent {
    constructor(event: string, params: any) {
      return { type: event, detail: params?.detail };
    }
  };
}

if (!(global as any).window.addEventListener) {
  (global as any).window.addEventListener = () => {};
  (global as any).window.removeEventListener = () => {};
  (global as any).window.dispatchEvent = () => true;
}

if (typeof global.crypto === 'undefined') {
  (global as any).crypto = Crypto as any;
}

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
