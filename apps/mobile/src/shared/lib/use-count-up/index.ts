import { useState } from 'react';
import { useEffect } from 'react';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export function useCountUp(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(0);
  const shared = useSharedValue(0);

  useEffect(() => {
    shared.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [shared, target, duration]);

  useAnimatedReaction(
    () => shared.value,
    value => {
      runOnJS(setDisplayed)(value);
    },
  );

  return displayed;
}
