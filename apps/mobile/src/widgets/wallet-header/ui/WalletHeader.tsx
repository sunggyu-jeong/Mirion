import { StyleSheet, Text, View } from 'react-native';
import { formatUnits } from 'viem';
import { useBalance, useConnection } from 'wagmi';

import { useEthPrice } from '@/src/entities/price-tracker';

export const WalletHeader = () => {
  const { address } = useConnection();
  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });
  const { data: price } = useEthPrice();

  const formattedBalance = balance ? formatUnits(balance.value, balance.decimals) : '0';

  const krwValue =
    balance && price
      ? (parseFloat(formattedBalance) * price).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
      : '0';

  return (
    <View style={styles.container}>
      <View style={styles.addressBadge}>
        <Text style={styles.addressText}>
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}
        </Text>
      </View>

      <Text style={styles.krwText}>₩{krwValue}</Text>

      <Text style={styles.ethText}>{parseFloat(formattedBalance).toFixed(4)} ETH</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#000000',
  },
  addressBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  addressText: {
    color: '#9CA3AF',
    fontWeight: '700',
    fontSize: 12,
  },
  krwText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  ethText: {
    color: '#6B7280',
    fontSize: 18,
    marginTop: 8,
    fontWeight: '500',
  },
});
