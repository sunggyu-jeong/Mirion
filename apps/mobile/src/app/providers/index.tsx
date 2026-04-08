import { useLoadingStore } from '@shared/lib/loading';
import { LoadingOverlay, ToastView } from '@shared/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Navigation } from '../navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

function GlobalLoadingOverlay() {
  const { visible } = useLoadingStore();
  return <LoadingOverlay visible={visible} />;
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={StyleSheet.absoluteFill}>
          <Navigation />
          <ToastView />
          <GlobalLoadingOverlay />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
