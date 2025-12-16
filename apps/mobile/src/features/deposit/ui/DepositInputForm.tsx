import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Button } from '@/src/shared/ui/Button';

interface Props {
  maxBalance: number;
  onSubmit: (amount: string) => void;
}

export const DepositInputForm = ({ maxBalance, onSubmit }: Props) => {
  const [amount, setAmount] = useState('');

  const handleMax = () => {
    //FIXME: gas price 계산 후 넣어주기
    const safeMax = Math.max(0, maxBalance - 0.005);
    setAmount(safeMax.toString());
  };

  const isValid = Number(amount) > 0 && Number(amount) <= maxBalance;

  return (
    <View className="flex-1 mt-10">
      <Text className="text-3xl font-bold text-text-900 mb-8">얼마를{'\n'}보관하시겠어요?</Text>

      <View className="flex-row items-baseline border-b-2 border-primary pb-2">
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          autoFocus
          className="flex-1 text-4xl font-bold text-text-900 leading-tight"
          placeholderTextColor="#E5E8EB"
        />
        <Text className="text-xl font-bold text-text-900 ml-2">ETH</Text>
      </View>

      <View className="flex-row justify-between mt-3">
        <Text className="text-text-500 text-sm">보유 {maxBalance} ETH</Text>
        <TouchableOpacity onPress={handleMax}>
          <Text className="text-primary font-bold text-sm">최대 입력</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-end pb-4">
        <Button
          label="확인"
          onPress={() => onSubmit(amount)}
          disabled={!isValid}
        />
      </View>
    </View>
  );
};
