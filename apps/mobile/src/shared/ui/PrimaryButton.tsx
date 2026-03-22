import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  height?: number;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
  label,
  onPress,
  height = 52,
  variant = 'primary',
}: PrimaryButtonProps) {
  const bg = variant === 'primary' ? 'bg-[#2b7fff]' : 'bg-[#f1f5f9]';
  const textColor = variant === 'primary' ? 'text-[#f8fafc]' : 'text-[#1d293d]';

  return (
    <TouchableOpacity
      className={`${bg} rounded-lg w-full items-center justify-center`}
      style={{ height }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className={`text-[16px] ${textColor}`}>{label}</Text>
    </TouchableOpacity>
  );
}
