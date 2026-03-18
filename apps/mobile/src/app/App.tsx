import { NavigationContainer } from '@react-navigation/native';
import { PortalProvider } from '@gorhom/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider } from '@/src/app/providers/StoreProvider';
import WagmiProvider from '@/src/app/providers/WagmiProvider';
import { configureNotificationHandler } from '@/src/shared/lib';
import { RootNavigator } from './navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});

export default function App() {
  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WagmiProvider>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <PortalProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </PortalProvider>
          </StoreProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </GestureHandlerRootView>
  );
}
