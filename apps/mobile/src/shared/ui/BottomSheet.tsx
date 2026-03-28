import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

export type BottomSheetRef = {
  open: () => void;
  close: (callback?: () => void) => void;
};

type Props = {
  height: number;
  dismissThreshold?: number;
  translateYOffset?: Animated.Value;
  onDismiss?: () => void;
  bottomInset?: number;
  horizontalInset?: number;
  children: React.ReactNode;
};

export const BottomSheet = forwardRef<BottomSheetRef, Props>(
  (
    {
      height,
      dismissThreshold = 80,
      translateYOffset,
      onDismiss,
      bottomInset = 0,
      horizontalInset = 0,
      children,
    },
    ref,
  ) => {
    const [mounted, setMounted] = useState(false);
    const pendingOpen = useRef(false);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(height)).current;

    const closeSheet = useCallback(
      (callback?: () => void) => {
        Animated.parallel([
          Animated.timing(sheetTranslateY, {
            toValue: height,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setMounted(false);
          sheetTranslateY.setValue(height);
          backdropOpacity.setValue(0);
          callback?.();
        });
      },
      [height, sheetTranslateY, backdropOpacity],
    );

    const closeSheetRef = useRef(closeSheet);
    closeSheetRef.current = closeSheet;

    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          pendingOpen.current = true;
          setMounted(true);
        },
        close: (callback?) => closeSheetRef.current(callback),
      }),
      [],
    );

    useEffect(() => {
      if (mounted && pendingOpen.current) {
        pendingOpen.current = false;
        backdropOpacity.setValue(0);
        sheetTranslateY.setValue(height);
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        });
      }
    }, [mounted, backdropOpacity, sheetTranslateY, height]);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dy }) => dy > 8,
        onPanResponderMove: (_, { dy }) => {
          if (dy > 0) {
            sheetTranslateY.setValue(dy);
          }
        },
        onPanResponderRelease: (_, { dy }) => {
          if (dy > dismissThreshold) {
            closeSheetRef.current(() => onDismissRef.current?.());
          } else {
            Animated.spring(sheetTranslateY, {
              toValue: 0,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    ).current;

    if (!mounted) {
      return null;
    }

    const transform = translateYOffset
      ? [{ translateY: Animated.subtract(sheetTranslateY, translateYOffset) }]
      : [{ translateY: sheetTranslateY }];

    return (
      <View
        style={StyleSheet.absoluteFillObject}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity },
          ]}
        />
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => closeSheetRef.current(() => onDismissRef.current?.())}
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
            { transform },
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
