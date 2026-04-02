import { useWalletStore } from '@entities/wallet';
import { useCoinbaseWallet, useWalletConnect } from '@features/wallet-connect';
import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton, ScreenTitle, SectionTitle } from '@shared/ui';
import { AppInfoCard, WalletAddressCard } from '@widgets/wallet-info';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
  const address = useWalletStore(s => s.address);
  const walletType = useWalletStore(s => s.walletType);
  const { disconnectWallet: disconnectMetaMask } = useWalletConnect();
  const { disconnectWallet: disconnectCoinbase } = useCoinbaseWallet();
  const { toOnboarding } = useAppNavigation();

  const handleDisconnect = () => {
    if (walletType === 'walletconnect') {
      disconnectMetaMask();
    } else {
      disconnectCoinbase();
    }
    toOnboarding();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle style={{ marginBottom: 40 }}>설정</ScreenTitle>

        <View style={{ gap: 40 }}>
          <View style={{ gap: 20 }}>
            <SectionTitle title="지갑 정보" />
            <WalletAddressCard address={address} />
            {address && (
              <PrimaryButton
                label="지갑 연결 해제"
                variant="secondary"
                onPress={handleDisconnect}
              />
            )}
          </View>

          <View style={{ gap: 20 }}>
            <SectionTitle title="정보" />
            <AppInfoCard />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
