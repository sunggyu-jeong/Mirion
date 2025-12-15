import { Stack } from 'expo-router';
import { StoreProvider } from "@/src/app/providers/StoreProvider";
import { WagmiProvider } from "@/src/app/providers/WagmiProvider";

export default function RootLayout() {
    return (
        <StoreProvider>
            <WagmiProvider>
                <Stack screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#ffffff' },
                }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </WagmiProvider>
        </StoreProvider>
    )
}