import { StoreProvider } from '@/src/composition/providers/StoreProvider';
import WagmiProvider from '@/src/composition/providers/WagmiProvider';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <StoreProvider>
      <WagmiProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </WagmiProvider>
    </StoreProvider>
  );
}
