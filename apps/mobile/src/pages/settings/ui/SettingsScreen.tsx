import { useWalletStore } from '@entities/wallet';
import { useCoinbaseWallet, useWalletConnect } from '@features/wallet-connect';
import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton, ScreenTitle } from '@shared/ui';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 18,
        fontWeight: '700',
        color: '#1d293d',
        lineHeight: 25.2,
      }}
    >
      {title}
    </Text>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#62748e',
          letterSpacing: -0.028,
          lineHeight: 21,
          width: 79,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#0f172b',
          lineHeight: 18,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

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
            <View
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: 12,
                padding: 16,
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#62748e',
                  letterSpacing: -0.028,
                  lineHeight: 21,
                }}
              >
                연결된 주소
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '400',
                  color: '#0f172b',
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {address ?? '-'}
              </Text>
            </View>
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
            <View
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: 12,
                padding: 16,
                gap: 16,
              }}
            >
              <InfoRow
                label="버전"
                value="1.0.0"
              />
              <InfoRow
                label="네트워크"
                value="Ethereum Mainnet (Lido)"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
