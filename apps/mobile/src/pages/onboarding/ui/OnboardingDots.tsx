import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SLIDES } from './OnboardingSlides';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function Dot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const progress = useSharedValue(index === 0 ? 1 : 0);

  const style = useAnimatedStyle(() => {
    progress.value = withTiming(activeIndex === index ? 1 : 0, {
      duration: 220,
      easing: EASE_OUT,
    });
    return {
      width: interpolate(progress.value, [0, 1], [7, 22]),
      opacity: interpolate(progress.value, [0, 1], [0.3, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 7,
          borderRadius: 4,
          backgroundColor: SLIDES[activeIndex]?.accentColor ?? '#2b7fff',
        },
        style,
      ]}
    />
  );
}

export function OnboardingDots({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
      {SLIDES.map((_, i) => (
        <Dot
          key={i}
          index={i}
          activeIndex={activeIndex}
        />
      ))}
    </View>
  );
}
