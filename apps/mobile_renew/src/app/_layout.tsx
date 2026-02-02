import WagmiProvider from '@/app/providers/WagmiProvider';
import { configureNotificationHandler } from '@/shared';
import '../shared/lib/utils/shims';

import { PortalProvider } from '@gorhom/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WagmiProvider>
        <QueryClientProvider client={queryClient}>
            <PortalProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#ffffff' },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="deposit" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </PortalProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </GestureHandlerRootView>
  );
}
