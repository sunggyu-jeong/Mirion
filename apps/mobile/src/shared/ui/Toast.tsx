import { useToastStore } from '@shared/lib/toast';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const BG: Record<string, string> = {
  success: '#22c55e',
  error: '#fb2c36',
  info: '#2b7fff',
};

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function ToastView() {
  const { visible, message, type, hide } = useToastStore();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 240, easing: EASE_OUT });
      opacity.value = withTiming(1, { duration: 160 });
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 }, finished => {
          if (finished) {
            runOnJS(hide)();
          }
        });
        translateY.value = withTiming(80, { duration: 200, easing: Easing.bezier(0.4, 0, 1, 1) });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: BG[type] ?? BG.info }, animStyle]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 999,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
});
