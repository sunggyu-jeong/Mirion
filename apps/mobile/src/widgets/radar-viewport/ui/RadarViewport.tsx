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
const RADAR_SIZE = SCREEN_WIDTH - 40;
const CENTER = RADAR_SIZE / 2;

const RADAR_BG = '#060d1a';
const RING_COLOR = '#22c55e';

const RINGS = [1, 0.75, 0.5, 0.25] as const;
const RING_OPACITY = [0.08, 0.12, 0.18, 0.28] as const;

const SWEEP_DURATION = 3000;
const RIPPLE_DURATION = 2400;

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
        borderColor: `rgba(34,197,94,${opacity})`,
        alignSelf: 'center',
        top: CENTER - size / 2,
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
          backgroundColor: 'rgba(34,197,94,0.12)',
          top: CENTER - 0.5,
          left: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 1,
          height: RADAR_SIZE,
          backgroundColor: 'rgba(34,197,94,0.12)',
          left: CENTER - 0.5,
          top: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: RADAR_SIZE * 1.42,
          height: 1,
          backgroundColor: 'rgba(34,197,94,0.07)',
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
          backgroundColor: 'rgba(34,197,94,0.07)',
          top: CENTER - 0.5,
          left: -(RADAR_SIZE * 0.21),
          transform: [{ rotateZ: '-45deg' }],
        }}
      />
    </>
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

  const armStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const trail1Style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value - 18}deg` }],
    opacity: 0.3,
  }));

  const trail2Style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value - 36}deg` }],
    opacity: 0.15,
  }));

  const trail3Style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value - 54}deg` }],
    opacity: 0.07,
  }));

  const armBase = {
    position: 'absolute' as const,
    width: CENTER,
    height: 2,
    top: CENTER - 1,
    left: CENTER,
    backgroundColor: RING_COLOR,
    borderRadius: 1,
    transformOrigin: 'left center' as const,
  };

  return (
    <>
      <Animated.View style={[armBase, trail3Style]} />
      <Animated.View style={[armBase, trail2Style]} />
      <Animated.View style={[armBase, trail1Style]} />
      <Animated.View style={[armBase, armStyle]} />
    </>
  );
}

function RipplePulse({ delayMs }: { delayMs: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: RIPPLE_DURATION, easing: Easing.out(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, progress]);

  const rippleStyle = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1], [12, RADAR_SIZE * 0.85]);
    const opacity = interpolate(progress.value, [0, 0.2, 1], [0, 0.45, 0]);
    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: RING_COLOR,
      top: CENTER - size / 2,
      left: CENTER - size / 2,
      opacity,
    };
  });

  return <Animated.View style={rippleStyle} />;
}

function CenterDot() {
  return (
    <View
      style={{
        position: 'absolute',
        top: CENTER - 5,
        left: CENTER - 5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: RING_COLOR,
        shadowColor: RING_COLOR,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
      }}
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
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
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
      <RipplePulse delayMs={800} />
      <RipplePulse delayMs={1600} />

      <SweepArm />
      <CenterDot />

      {children}
    </View>
  );
}

export { CENTER, RADAR_SIZE };
