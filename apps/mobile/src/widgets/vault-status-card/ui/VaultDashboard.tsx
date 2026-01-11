import { useVaultInfo } from '@/src/entities/wallet/model/useVaultInfo';
import { useVaultActions } from '@/src/features/vault/model';
import { Button } from '@/src/shared';
import { VaultStatusCard } from '@/src/widgets/vault-status-card/ui/VaultStatusCard';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { formatUnits } from 'viem';

export const VaultDashboard = () => {
  const { vaultBalance, startDate, unlockDate, isLoading } = useVaultInfo();
  const { withdraw, isLoading: isVaultLoading } = useVaultActions();

  const formattedBalance = vaultBalance
    ? Number(formatUnits(vaultBalance, 18)).toFixed(4)
    : '0.0000';

  if (isLoading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 금고 대시보드</Text>

      <VaultStatusCard
        balance={formattedBalance}
        startDate={startDate}
        unlockDate={unlockDate}
      />

      <View style={styles.btnRow}>
        <Button
          label="추가 저장"
          onPress={() => {}}
          style={{ flex: 1 }}
        />
        <Button
          label="출금"
          onPress={withdraw}
          isLoading={isVaultLoading}
          variant="ghost"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
