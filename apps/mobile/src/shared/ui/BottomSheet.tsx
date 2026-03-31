import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type BottomSheetRef = {
  open: () => void;
  close: (callback?: () => void) => void;
};

type Props = {
  height: number;
  dismissThreshold?: number;
  onDismiss?: () => void;
  bottomInset?: number;
  horizontalInset?: number;
  children: React.ReactNode;
};

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export const BottomSheet = forwardRef<BottomSheetRef, Props>(
  (
    { height, dismissThreshold = 100, onDismiss, bottomInset = 0, horizontalInset = 0, children },
    ref,
  ) => {
    const [mounted, setMounted] = useState(false);
    const translateY = useSharedValue(height);
    const backdropOpacity = useSharedValue(0);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    const dismiss = useCallback(
      (callback?: () => void) => {
        translateY.value = withTiming(height, {
          duration: 220,
          easing: Easing.bezier(0.4, 0, 1, 1),
        });
        backdropOpacity.value = withTiming(0, { duration: 200 }, finished => {
          if (finished) {
            runOnJS(setMounted)(false);
            if (callback) {
              runOnJS(callback)();
            }
            if (onDismissRef.current) {
              runOnJS(onDismissRef.current)();
            }
          }
        });
      },
      [height, translateY, backdropOpacity],
    );

    const dismissRef = useRef(dismiss);
    dismissRef.current = dismiss;

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setMounted(true);
          translateY.value = height;
          backdropOpacity.value = 0;
          backdropOpacity.value = withTiming(1, { duration: 260 });
          translateY.value = withTiming(0, { duration: 320, easing: EASE_OUT });
        },
        close: (callback?) => dismissRef.current(callback),
      }),
      [height, translateY, backdropOpacity],
    );

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dy }) => dy > 8,
        onPanResponderMove: (_, { dy }) => {
          if (dy > 0) {
            translateY.value = dy;
          }
        },
        onPanResponderRelease: (_, { dy }) => {
          if (dy > dismissThreshold) {
            dismissRef.current();
          } else {
            translateY.value = withTiming(0, { duration: 280, easing: EASE_OUT });
          }
        },
      }),
    ).current;

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    if (!mounted) {
      return null;
    }

    return (
      <View
        style={StyleSheet.absoluteFillObject}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(0,0,0,0.5)' },
            backdropStyle,
          ]}
        />
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => dismissRef.current()}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: bottomInset,
              left: horizontalInset,
              right: horizontalInset,
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderRadius: bottomInset > 0 ? 24 : undefined,
            },
            sheetStyle,
          ]}
        >
          <View
            style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}
            {...panResponder.panHandlers}
          >
            <View
              style={{
                width: 33,
                height: 4,
                backgroundColor: '#f1f5f9',
                borderRadius: 99,
              }}
            />
          </View>
          {children}
        </Animated.View>
      </View>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';
