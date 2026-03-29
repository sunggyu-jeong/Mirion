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
const withTiming = (toValue: number) => toValue;
const withSpring = (toValue: number) => toValue;
const withSequence = (...values: number[]) => values[values.length - 1];
const withDelay = (_delay: number, value: number) => value;
const withRepeat = (value: number) => value;
const interpolate = (value: number, input: number[], output: number[]) => output[0];
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
  runOnJS,
  runOnUI,
  scrollTo,
  SlideInRight,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
};
