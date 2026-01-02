import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { useEthPrice } from '@/src/entities/price-tracker';

export const WalletHeader = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });
  const { data: price } = useEthPrice();

  const formattedBalance = balance ? formatUnits(balance.value, balance.decimals) : '0';
  const displayAddress = address ? `${address.slice(0, 6)} ... ${address.slice(-4)}` : '연결 안 됨';

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.leftSection}>
        <Text style={styles.brandTitle}>LockFi</Text>
        <Text style={styles.brandSubtitle}>Time-Locked Savings</Text>
      </View>

      <View style={styles.walletBadge}>
        <View style={[styles.statusDot, isConnected && styles.statusOnline]} />
        <View style={styles.walletInfo}>
          <Text style={styles.networkText}>Base L2</Text>
          <Text style={styles.addressText}>{displayAddress}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0047FF',
    lineHeight: 32,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 10,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  walletInfo: {
    flexDirection: 'column',
  },
  networkText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});
