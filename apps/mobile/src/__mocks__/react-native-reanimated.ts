import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';

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
const FadeIn = { delay: () => ({ springify: () => ({}) }) };
const FadeOut = { delay: () => ({ springify: () => ({}) }) };
const FadeInDown = { delay: () => ({ springify: () => ({}) }) };
const FadeInUp = { delay: () => ({ springify: () => ({}) }) };
const SlideInRight = { delay: () => ({ springify: () => ({}) }) };
const ZoomIn = { delay: () => ({ springify: () => ({}) }) };
const useAnimatedRef = () => ({ current: null });
const useScrollViewOffset = () => ({ value: 0 });
const scrollTo = () => {};
const runOnJS = (fn: (...args: unknown[]) => void) => fn;
const runOnUI = (fn: (...args: unknown[]) => void) => fn;

export {
  Animated as default,
  Animated,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  useAnimatedRef,
  useScrollViewOffset,
  scrollTo,
  runOnJS,
  runOnUI,
};
