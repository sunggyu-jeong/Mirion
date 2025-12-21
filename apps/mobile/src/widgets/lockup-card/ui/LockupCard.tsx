import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/src/shared/ui/Button';
import { formatDistance } from 'date-fns';

interface LockupCardProps {
  amount: string;
  unlockTime: number;
  onWithdrawPress: () => void;
}

export const LockupCard = ({ amount, unlockTime, onWithdrawPress }: LockupCardProps) => {
  const isUnlocked = Date.now() / 1000 > unlockTime;
  const timeLeft = formatDistance(new Date(unlockTime * 1000), new Date(), { addSuffix: true });

  return (
    <View className="mx-5 bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-lg">
      <View className="flex-row justify-between mb-6">
        <Text className="text-gray-400 font-semibold">Active Lockup</Text>
        <Button
          label="Base L2"
          onPress={() => {}}
        />
      </View>

      <Text className="text-white text-5xl font-bold mb-4">{amount} ETH</Text>

      <View className="bg-black/30 p-4 rounded-xl mb-6">
        <Text className="text-gray-500 mb-1">Status</Text>
        <Text className="text-white text-xl font-mono">
          {isUnlocked ? 'Unlock Available 🔓' : `Unlocks ${timeLeft}`}
        </Text>
      </View>

      <TouchableOpacity
        disabled={!isUnlocked}
        onPress={onWithdrawPress}
        className={`w-full py-4 rounded-full items-center ${
          isUnlocked ? 'bg-[#00D632]' : 'bg-gray-800'
        }`}
      >
        <Text className={`font-bold text-lg ${isUnlocked ? 'text-black' : 'text-gray-500'}`}>
          {isUnlocked ? 'Withdraw Funds' : 'Locked'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
