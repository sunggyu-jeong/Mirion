import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useVaultProgress } from '@/src/entities/vault/model/useVaultProgress';
import { formatYMD } from '@/src/shared';
import { ProgressBar } from '@/src/shared/ui/ProgressBar';

interface Props {
  balance: string;
  startDate: string;
  unlockDate: string;
}

export const VaultStatusCard = ({ balance, startDate, unlockDate }: Props) => {
  const { progressPercentage, remainingDays, isUnlocked } = useVaultProgress({
    startDate,
    unlockDate,
  });

  return (
    <View style={[styles.card, isUnlocked && styles.maturedCard]}>
      <View style={styles.header}>
        <Text style={styles.label}>내 보관함 자산</Text>
        <View style={[styles.statusBadge, isUnlocked ? styles.unlockedBadge : styles.lockedBadge]}>
          <Ionicons
            name={isUnlocked ? 'lock-open' : 'lock-closed'}
            size={12}
            color={isUnlocked ? '#10B981' : '#F59E0B'}
          />
          <Text style={[styles.statusText, { color: isUnlocked ? '#10B981' : '#D97706' }]}>
            {isUnlocked ? '잠금 해제' : '잠금 중'}
          </Text>
        </View>
      </View>

      <Text style={styles.balance}>{`${balance} ETH`}</Text>
      <View style={styles.divider} />

      {isUnlocked ? (
        /* 만기 상태 UI */
        <View style={styles.maturedSection}>
          <Text style={styles.maturedTitle}>축하합니다! 잠금이 해제되었습니다 🎉</Text>
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawText}>지금 출금하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* 진행 중 상태 UI */
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>목표 달성까지</Text>
            <Text style={styles.percentText}>{progressPercentage}%</Text>
          </View>
          <ProgressBar progress={progressPercentage} />
          <View style={styles.progressFooter}>
            <Text style={styles.dateText}>{`시작: ${formatYMD(startDate)}`}</Text>
            <Text style={styles.remainingText}>{`남은 기간: ${remainingDays}일`}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  maturedCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressSection: {
    marginBottom: 20,
  },
  lockedBadge: {
    backgroundColor: '#FFFBEB',
  },
  unlockedBadge: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0052FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0052FF',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  maturedSection: {
    alignItems: 'center',
  },
  maturedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  withdrawText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
