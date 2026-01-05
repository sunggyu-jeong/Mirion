import { formatDistance } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/src/shared/ui/Button';

interface LockupCardProps {
  amount: string;
  unlockTime: number;
  onWithdrawPress: () => void;
}

export const LockupCard = ({ amount, unlockTime, onWithdrawPress }: LockupCardProps) => {
  const isUnlocked = Date.now() / 1000 > unlockTime;
  const timeLeft = formatDistance(new Date(unlockTime * 1000), new Date(), { addSuffix: true });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Active Lockup</Text>
        <Button
          label="Base L2"
          onPress={() => {}}
        />
      </View>

      <Text style={styles.amountText}>{amount} ETH</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>
          {isUnlocked ? 'Unlock Available 🔓' : `Unlocks ${timeLeft}`}
        </Text>
      </View>

      <TouchableOpacity
        disabled={!isUnlocked}
        onPress={onWithdrawPress}
        style={[styles.withdrawButton, isUnlocked ? styles.buttonUnlocked : styles.buttonLocked]}
      >
        <Text style={[styles.withdrawText, isUnlocked ? styles.textUnlocked : styles.textLocked]}>
          {isUnlocked ? 'Withdraw Funds' : 'Locked'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 16,
  },
  statusBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusLabel: {
    color: '#6B7280',
    marginBottom: 4,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'monospace',
  },
  withdrawButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
  },
  buttonUnlocked: {
    backgroundColor: '#00D632',
  },
  buttonLocked: {
    backgroundColor: '#1F2937',
  },
  withdrawText: {
    fontWeight: '700',
    fontSize: 18,
  },
  textUnlocked: {
    color: '#000000',
  },
  textLocked: {
    color: '#6B7280',
  },
});
