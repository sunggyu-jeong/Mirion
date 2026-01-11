import { StyleSheet, Text, View } from 'react-native';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { Button } from '@/src/shared';

export const VaultEmptyState = () => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const formatted = balance ? Number(formatUnits(balance.value, 18)).toFixed(4) : '0.0000';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>지갑 잔액: {formatted} ETH</Text>
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>🔒 금고에 저장된 자산이 없습니다.</Text>
      </View>
      <Button
        label="첫 이더리움 저장하기"
        onPress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#EFF6FF', borderRadius: 24, marginTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 12 },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyText: { color: '#1E40AF', fontWeight: '500' },
});
