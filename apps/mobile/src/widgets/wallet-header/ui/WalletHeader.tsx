import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

export const WalletHeader = () => {
  const { address, isConnected } = useAccount();

  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  const formattedBalance = balance
    ? Number(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : '0.0000';

  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '연결 안 됨';

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <View style={styles.leftSection}>
        <Text style={styles.brandTitle}>LockFi</Text>
        <Text style={styles.brandSubtitle}>Time-Locked Savings</Text>
      </View>

      <View style={styles.walletBadge}>
        <View style={[styles.statusDot, isConnected && styles.statusOnline]} />

        <View style={styles.walletInfo}>
          <Text style={styles.networkText}>Base L2</Text>
          <Text style={styles.addressText}>
            {isConnected ? `${formattedBalance} ${balance?.symbol || 'ETH'}` : displayAddress}
          </Text>
          {isConnected && <Text style={styles.miniAddressText}>{displayAddress}</Text>}
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
    // 3. 리액트 네이티브 표준 쉐도우 설정
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftSection: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0047FF',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  walletInfo: {
    flexDirection: 'column',
  },
  networkText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  miniAddressText: {
    fontSize: 10,
    color: '#6B7280',
  },
});
