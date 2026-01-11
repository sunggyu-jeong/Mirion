import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAccount } from 'wagmi';

import { useVaultInfo } from '@/src/entities/wallet/model/useVaultInfo';
import ConnectWalletSheet from '@/src/entities/wallet/ui/ConnectWalletSheet';
import { useWalletAuth } from '@/src/features/wallet';
import { LivePriceCard } from '@/src/widgets/live-price-card';
import { VaultDashboard } from '@/src/widgets/vault-status-card/ui/VaultDashboard';
import { VaultEmptyState } from '@/src/widgets/vault-status-card/ui/VaultEmptyState';
import { WalletConnectionBanner } from '@/src/widgets/vault-status-card/ui/WalletConnectionBanner';

export default function HomePage() {
  const { isConnected } = useAccount();
  const { hasAssets } = useVaultInfo();
  const { connect } = useWalletAuth();
  const sheetRef = useRef<any>(null);

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LivePriceCard />

          {!isConnected ? (
            <WalletConnectionBanner onConnect={() => sheetRef.current?.expand()} />
          ) : !hasAssets ? (
            <VaultEmptyState />
          ) : (
            <VaultDashboard />
          )}
          <View style={styles.footer}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="black"
            />
            <Text style={styles.footerText}>
              자산을 저장하면 설정한 기간 동안 출금이 제한됩니다.
            </Text>
          </View>
        </ScrollView>
      </View>
      <ConnectWalletSheet
        ref={sheetRef}
        onConnect={id => connect(id)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
  },
});
