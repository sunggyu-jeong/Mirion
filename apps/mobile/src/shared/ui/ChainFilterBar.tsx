import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type ChainFilter = 'ALL' | 'ETH' | 'BTC' | 'SOL' | 'BNB';

const CHAIN_OPTIONS: { value: ChainFilter; label: string; color: string }[] = [
  { value: 'ALL', label: '전체', color: '#2b7fff' },
  { value: 'ETH', label: 'ETH', color: '#627EEA' },
  { value: 'BTC', label: 'BTC', color: '#F7931A' },
  { value: 'SOL', label: 'SOL', color: '#9945FF' },
  { value: 'BNB', label: 'BNB', color: '#F3BA2F' },
];

const TOSS_PRESS = { damping: 18, stiffness: 400 } as const;

function ChainPill({
  option,
  isActive,
  onPress,
}: {
  option: (typeof CHAIN_OPTIONS)[number];
  isActive: boolean;
  onPress: (value: ChainFilter) => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.93, TOSS_PRESS);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, TOSS_PRESS);
      }}
      onPress={useCallback(() => onPress(option.value), [onPress, option.value])}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            backgroundColor: isActive ? option.color : '#f1f5f9',
          },
          animatedStyle,
        ]}
      >
        {option.value !== 'ALL' && (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: isActive ? 'rgba(255,255,255,0.85)' : option.color,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: isActive ? 'white' : '#62748e',
            letterSpacing: -0.01,
          }}
        >
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

type Props = {
  value: ChainFilter;
  onChange: (chain: ChainFilter) => void;
};

export function ChainFilterBar({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {CHAIN_OPTIONS.map(option => (
        <ChainPill
          key={option.value}
          option={option}
          isActive={value === option.value}
          onPress={onChange}
        />
      ))}
    </ScrollView>
  );
}
