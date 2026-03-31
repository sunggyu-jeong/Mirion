import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      className="w-full"
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      }}
    >
      <Animated.View
        className={`${bg} rounded-lg w-full items-center justify-center`}
        style={[animatedStyle, { height }]}
      >
        <Text className={`text-[16px] ${textColor}`}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
