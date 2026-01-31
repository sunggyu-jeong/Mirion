import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Button } from '@/src/shared/ui/Button';

interface Props {
  maxBalance: number;
  onSubmit: (amount: string) => void;
}

export const DepositInputForm = ({ maxBalance, onSubmit }: Props) => {
  const [amount, setAmount] = useState('');

  const handleMax = () => {
    const safeMax = Math.max(0, maxBalance - 0.005);
    setAmount(safeMax.toString());
  };

  const isValid = Number(amount) > 0 && Number(amount) <= maxBalance;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>얼마를{'\n'}보관하시겠어요?</Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          autoFocus
          style={styles.input}
          placeholderTextColor="#E5E8EB"
        />
        <Text style={styles.unitText}>ETH</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.balanceText}>보유 {maxBalance} ETH</Text>
        <TouchableOpacity onPress={handleMax}>
          <Text style={styles.maxButtonText}>최대 입력</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          label="확인"
          onPress={() => onSubmit(amount)}
          disabled={!isValid}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  unitText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  balanceText: {
    color: '#6B7280',
    fontSize: 14,
  },
  maxButtonText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
});
