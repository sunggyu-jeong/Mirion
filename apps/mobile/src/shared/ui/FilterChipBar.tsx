import React, { useCallback, useEffect } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TOSS_BLUE = '#3182F6';
const INACTIVE_BG = '#f1f5f9';
const INACTIVE_TEXT = '#62748e';
const PRESS_SPRING = { damping: 18, stiffness: 400 } as const;
const COLOR_TIMING = { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) } as const;

export type ChipOption<T extends string = string> = {
  value: T;
  label: string;
};

function Chip<T extends string>({
  option,
  isActive,
  activeColor,
  onPress,
}: {
  option: ChipOption<T>;
  isActive: boolean;
  activeColor: string;
  onPress: (v: T) => void;
}) {
  const progress = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, COLOR_TIMING);
  }, [isActive, progress]);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [INACTIVE_BG, activeColor]),
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [INACTIVE_TEXT, '#ffffff']),
  }));

  const handlePress = useCallback(() => onPress(option.value), [onPress, option.value]);

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.93, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 7,
            borderRadius: 20,
          },
          bgStyle,
        ]}
      >
        <Animated.Text
          style={[{ fontSize: 13, fontWeight: '600', letterSpacing: -0.2 }, textStyle]}
        >
          {option.label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

interface FilterChipBarProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  activeColor?: string;
}

export function FilterChipBar<T extends string>({
  options,
  value,
  onChange,
  activeColor = TOSS_BLUE,
}: FilterChipBarProps<T>) {
  return (
    <FlatList
      data={options}
      keyExtractor={item => item.value}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
      renderItem={({ item }) => (
        <Chip
          option={item}
          isActive={value === item.value}
          activeColor={activeColor}
          onPress={onChange}
        />
      )}
    />
  );
}
