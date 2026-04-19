import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DURATION = 160;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

type Option<T> = {
  label: string;
  value: T;
};

type Props<T> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  dark?: boolean;
};

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  dark = false,
}: Props<T>) {
  const activeIndex = options.findIndex(o => o.value === value);
  const segWidth = useSharedValue(0);
  const totalWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => {
    const w = totalWidth.value / options.length;
    return {
      width: w,
      transform: [
        {
          translateX: withTiming(activeIndex * w, { duration: DURATION, easing: EASE }),
        },
      ],
    };
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
        borderRadius: 10,
        padding: 3,
        opacity: disabled ? 0.45 : 1,
      }}
      onLayout={e => {
        totalWidth.value = e.nativeEvent.layout.width - 6;
        segWidth.value = (e.nativeEvent.layout.width - 6) / options.length;
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 3,
            left: 3,
            bottom: 3,
            backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'white',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: dark ? 0 : 0.08,
            shadowRadius: 2,
            elevation: dark ? 0 : 2,
          },
          indicatorStyle,
        ]}
      />
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 7 }}
            onPress={() => !disabled && onChange(opt.value)}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? '600' : '400',
                color: dark
                  ? isActive
                    ? 'white'
                    : 'rgba(255,255,255,0.4)'
                  : isActive
                    ? '#0f172b'
                    : '#94a3b8',
                letterSpacing: -0.01,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
