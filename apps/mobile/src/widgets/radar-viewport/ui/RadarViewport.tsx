import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const RADAR_SIZE = SCREEN_WIDTH - 40;
export const CENTER = RADAR_SIZE / 2;

const RADAR_BG = '#020B18';
const RING_COLOR = '#06B6D4';
const SWEEP_DURATION = 3200;
const RIPPLE_DURATION = 2600;

const RINGS = [1, 0.75, 0.5, 0.25] as const;
const RING_OPACITY = [0.07, 0.11, 0.17, 0.26] as const;

function Ring({ ratio, opacity }: { ratio: number; opacity: number }) {
  const size = RADAR_SIZE * ratio;
  return (
    <View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: `rgba(6,182,212,${opacity})`,
        top: CENTER - size / 2,
        left: CENTER - size / 2,
      }}
    />
  );
}

function CrossLines() {
  return (
    <>
      <View
        style={{
          position: 'absolute',
          width: RADAR_SIZE,
          height: 1,
          backgroundColor: 'rgba(6,182,212,0.10)',
          top: CENTER - 0.5,
          left: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 1,
          height: RADAR_SIZE,
          backgroundColor: 'rgba(6,182,212,0.10)',
          left: CENTER - 0.5,
          top: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: RADAR_SIZE * 1.42,
          height: 1,
          backgroundColor: 'rgba(6,182,212,0.05)',
          top: CENTER - 0.5,
          left: -(RADAR_SIZE * 0.21),
          transform: [{ rotateZ: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: RADAR_SIZE * 1.42,
          height: 1,
          backgroundColor: 'rgba(6,182,212,0.05)',
          top: CENTER - 0.5,
          left: -(RADAR_SIZE * 0.21),
          transform: [{ rotateZ: '-45deg' }],
        }}
      />
    </>
  );
}

const TRAIL_CONFIGS = [
  { offset: -54, opacity: 0.04 },
  { offset: -40, opacity: 0.09 },
  { offset: -26, opacity: 0.2 },
  { offset: -13, opacity: 0.38 },
  { offset: 0, opacity: 1.0 },
] as const;

function SweepLayer({
  rotation,
  angleOffset,
  opacity,
}: {
  rotation: Animated.SharedValue<number>;
  angleOffset: number;
  opacity: number;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value + angleOffset}deg` }],
    opacity,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE, top: 0, left: 0 },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: CENTER - 1,
          left: CENTER,
          width: CENTER - 4,
          height: 2,
          backgroundColor: RING_COLOR,
          borderRadius: 1,
        }}
      />
    </Animated.View>
  );
}

function SweepArm() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: SWEEP_DURATION, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  return (
    <>
      {TRAIL_CONFIGS.map(({ offset, opacity }) => (
        <SweepLayer
          key={offset}
          rotation={rotation}
          angleOffset={offset}
          opacity={opacity}
        />
      ))}
    </>
  );
}

function RipplePulse({ delayMs }: { delayMs: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1, { duration: RIPPLE_DURATION, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
  }, [delayMs, progress]);

  const rippleStyle = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1], [8, RADAR_SIZE * 0.9]);
    const opacity = interpolate(progress.value, [0, 0.08, 0.65, 1], [0, 0.55, 0.12, 0]);
    return {
      position: 'absolute' as const,
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.2,
      borderColor: RING_COLOR,
      top: CENTER - size / 2,
      left: CENTER - size / 2,
      opacity,
    };
  });

  return <Animated.View style={rippleStyle} />;
}

function CenterDot() {
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(0.6, { duration: 900, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(pulse.value, [0.6, 1], [0.6, 1]),
    shadowRadius: interpolate(pulse.value, [0.6, 1], [6, 14]),
    transform: [{ scale: interpolate(pulse.value, [0.6, 1], [1, 1.15]) }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: CENTER - 5,
          left: CENTER - 5,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: RING_COLOR,
          shadowColor: RING_COLOR,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 4,
          zIndex: 20,
        },
        glowStyle,
      ]}
    />
  );
}

export function RadarViewport({ children }: { children?: React.ReactNode }) {
  return (
    <View
      style={{
        width: RADAR_SIZE,
        height: RADAR_SIZE,
        borderRadius: RADAR_SIZE / 2,
        backgroundColor: RADAR_BG,
        alignSelf: 'center',
        overflow: 'hidden',
        shadowColor: RING_COLOR,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 28,
        elevation: 8,
      }}
    >
      {RINGS.map((ratio, i) => (
        <Ring
          key={ratio}
          ratio={ratio}
          opacity={RING_OPACITY[i]!}
        />
      ))}

      <CrossLines />

      <RipplePulse delayMs={0} />
      <RipplePulse delayMs={867} />
      <RipplePulse delayMs={1734} />

      <SweepArm />
      <CenterDot />

      {children}
    </View>
  );
}
