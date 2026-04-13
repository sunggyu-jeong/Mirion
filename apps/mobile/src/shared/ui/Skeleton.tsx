import React, { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  delay?: number;
  style?: ViewStyle;
};

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 6,
  delay = 0,
  style,
}: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.45, {
          duration: 1400,
          easing: Easing.bezier(0.45, 0, 0.55, 1),
        }),
        -1,
        true,
      ),
    );
  }, [opacity, delay]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: '#F2F4F7',
        },
        animStyle,
        style,
      ]}
    />
  );
}
