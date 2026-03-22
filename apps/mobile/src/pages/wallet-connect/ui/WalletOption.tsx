import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type WalletOptionProps = {
  label: string;
  icon: ReturnType<typeof require>;
  selected: boolean;
  onPress: () => void;
};

export function WalletOption({ label, icon, selected, onPress }: WalletOptionProps) {
  return (
    <TouchableOpacity
      className={`flex-row h-[62px] items-center gap-x-4 p-4 rounded-xl ${selected ? 'bg-[#f1f5f9]' : ''}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="size-[30px] items-center justify-center">
        <Image
          source={icon}
          className="size-[26px]"
          resizeMode="contain"
        />
      </View>
      <View className="flex-1">
        <Text className="text-[16px] text-[#0f172b] leading-[1.5] tracking-[-0.16px]">{label}</Text>
      </View>
      {selected ? (
        <View className="size-[24px] bg-[#2b7fff] rounded-full items-center justify-center">
          <Text className="text-white text-[14px] font-bold leading-[1]">✓</Text>
        </View>
      ) : (
        <View className="size-[24px] rounded-full border border-[#cbd5e1]" />
      )}
    </TouchableOpacity>
  );
}
