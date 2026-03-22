import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  height?: number;
};

export function PrimaryButton({ label, onPress, height = 52 }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className="bg-[#2b7fff] rounded-lg w-full items-center justify-center"
      style={{ height }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className="text-[16px] text-[#f8fafc]">{label}</Text>
    </TouchableOpacity>
  );
}
