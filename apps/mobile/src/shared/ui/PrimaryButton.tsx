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
  const backgroundColor = variant === 'primary' ? '#2b7fff' : '#f1f5f9';
  const textColor = variant === 'primary' ? '#f8fafc' : '#1d293d';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={{ width: '100%' }}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            height,
            backgroundColor,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: 16, color: textColor }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
