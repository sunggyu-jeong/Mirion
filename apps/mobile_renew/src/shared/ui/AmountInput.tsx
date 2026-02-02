import { common, gray } from '@/shared/styles';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onMaxPress: () => void;
}

export const AmountInput = ({ value, onChangeText, onMaxPress }: AmountInputProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="0.0"
        keyboardType="numeric"
        placeholderTextColor={gray[400]}
      />
      <View style={styles.suffixContainer}>
        <TouchableOpacity style={styles.maxButton} onPress={onMaxPress}>
          <Text style={styles.maxText}>MAX</Text>
        </TouchableOpacity>
        <Text style={styles.unitText}>ETH</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: common.white,
    borderRadius: 16,
    padding: 16,
    height: 64,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: gray[900],
  },
  suffixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  maxText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  unitText: {
    fontSize: 18,
    fontWeight: '700',
    color: gray[900],
  },
});