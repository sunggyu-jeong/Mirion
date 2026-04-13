import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: (component: React.ComponentType) => component,
};

const useSharedValue = (init: number) => ({ value: init });
const useAnimatedStyle = (fn: () => object) => fn();
const withTiming = (toValue: number, _config?: unknown, callback?: (finished: boolean) => void) => {
  if (callback) {
    callback(true);
  }
  return toValue;
};
const withSpring = (toValue: number) => toValue;
const withSequence = (...values: number[]) => values[values.length - 1];
const withDelay = (_delay: number, value: number) => value;
const withRepeat = (value: number) => value;
const interpolate = (value: number, input: number[], output: number[]) => output[0];
const interpolateColor = (_value: number, _inputRange: number[], outputRange: string[]) =>
  outputRange[0];
const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  out: (easing: (t: number) => number) => easing,
  in: (easing: (t: number) => number) => easing,
  inOut: (easing: (t: number) => number) => easing,
  bezier: () => (t: number) => t,
};

function makeAnimationMock() {
  const self: Record<string, () => object> = {
    delay: () => self,
    springify: () => ({}),
    duration: () => self,
    easing: () => ({}),
    damping: () => self,
    stiffness: () => self,
  };
  return self;
}

const FadeIn = makeAnimationMock();
const FadeOut = makeAnimationMock();
const FadeInDown = makeAnimationMock();
const FadeInUp = makeAnimationMock();
const SlideInRight = makeAnimationMock();
const ZoomIn = makeAnimationMock();
const BounceIn = makeAnimationMock();
const useAnimatedRef = () => ({ current: null });
const useScrollViewOffset = () => ({ value: 0 });
const scrollTo = () => {};
const runOnJS = (fn: (...args: unknown[]) => void) => fn;
const runOnUI = (fn: (...args: unknown[]) => void) => fn;
const useDerivedValue = <T>(fn: () => T) => ({ value: fn() });
const useAnimatedProps = (fn: () => object) => fn();
const useAnimatedReaction = (prepare: () => unknown, react: (value: unknown) => void) => {
  // Runs after every render to simulate worklet reaction firing on shared value changes
  React.useEffect(() => {
    react(prepare());
  });
};

export {
  Animated,
  BounceIn,
  Animated as default,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  runOnUI,
  scrollTo,
  SlideInRight,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
};
