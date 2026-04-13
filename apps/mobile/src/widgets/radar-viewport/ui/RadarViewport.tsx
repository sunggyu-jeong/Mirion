import React from 'react';
import { Dimensions, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RADAR_SIZE = SCREEN_WIDTH - 40;
const CENTER = RADAR_SIZE / 2;

const RADAR_BG = '#060d1a';
const RING_COLOR = '#22c55e';

const RINGS = [1, 0.75, 0.5, 0.25] as const;
const RING_OPACITY = [0.08, 0.12, 0.18, 0.28] as const;

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
          backgroundColor: `rgba(34,197,94,0.12)`,
          top: CENTER - 0.5,
          left: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 1,
          height: RADAR_SIZE,
          backgroundColor: `rgba(34,197,94,0.12)`,
          left: CENTER - 0.5,
          top: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: RADAR_SIZE * 1.42,
          height: 1,
          backgroundColor: `rgba(34,197,94,0.07)`,
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
          backgroundColor: `rgba(34,197,94,0.07)`,
          top: CENTER - 0.5,
          left: -(RADAR_SIZE * 0.21),
          transform: [{ rotateZ: '-45deg' }],
        }}
      />
    </>
  );
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
      <CenterDot />

      {children}
    </View>
  );
}

export { CENTER, RADAR_SIZE };
