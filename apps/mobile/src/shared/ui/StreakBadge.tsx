import React from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

type Props = { count: number };

function flameTint(count: number): { bg: string; text: string; label: string } {
  if (count >= 30) {
    return { bg: '#fff1f2', text: '#fb2c36', label: '전설' };
  }
  if (count >= 14) {
    return { bg: '#fff7ed', text: '#f97316', label: '불꽃' };
  }
  if (count >= 7) {
    return { bg: '#fefce8', text: '#eab308', label: '열정' };
  }
  return { bg: '#f0fdf4', text: '#22c55e', label: '시작' };
}

export function StreakBadge({ count }: Props) {
  if (count <= 0) {
    return null;
  }

  const tint = flameTint(count);

  return (
    <Animated.View entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: tint.bg,
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <Text style={{ fontSize: 13 }}>🔥</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: tint.text }}>{count}일 연속</Text>
      </View>
    </Animated.View>
  );
}
