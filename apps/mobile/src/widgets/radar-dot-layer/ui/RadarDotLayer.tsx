import type { WhaleTx, WhaleTxType } from '@entities/whale-tx';
import { CENTER, RADAR_SIZE } from '@widgets/radar-viewport';
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const MAX_DOTS = 20;

const TYPE_COLOR: Record<WhaleTxType, string> = {
  receive: '#22c55e',
  send: '#fb2c36',
  swap: '#f97316',
};

function dotSize(amountUsd: number): number {
  if (amountUsd >= 1_000_000) {
    return 13;
  }
  if (amountUsd >= 100_000) {
    return 9;
  }
  return 6;
}

function hashToAngleRad(txHash: string): number {
  const hex = txHash.replace(/^0x/, '').slice(0, 6).padEnd(6, '0');
  const val = parseInt(hex, 16);
  return (val / 0xffffff) * Math.PI * 2;
}

function amountToRadius(amountUsd: number): number {
  const minR = CENTER * 0.15;
  const maxR = CENTER * 0.88;
  const clamped = Math.min(Math.max(amountUsd, 0), 5_000_000);
  const ratio = Math.sqrt(clamped / 5_000_000);
  return minR + ratio * (maxR - minR);
}

interface RadarDotCoord {
  tx: WhaleTx;
  x: number;
  y: number;
  color: string;
  size: number;
}

function buildCoords(txs: WhaleTx[]): RadarDotCoord[] {
  return txs.slice(0, MAX_DOTS).map(tx => {
    const angle = hashToAngleRad(tx.txHash);
    const r = amountToRadius(tx.amountUsd);
    return {
      tx,
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
      color: TYPE_COLOR[tx.type],
      size: dotSize(tx.amountUsd),
    };
  });
}

const DOT_SPRING = { stiffness: 500, damping: 22 } as const;

function PingRing({ size, color, delayMs }: { size: number; color: string; delayMs: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delayMs, withTiming(1, { duration: 700 }));
  }, [delayMs, progress]);

  const pingStyle = useAnimatedStyle(() => {
    const s = interpolate(progress.value, [0, 1], [size, size * 3.5]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0.7, 0.4, 0]);
    return {
      position: 'absolute' as const,
      width: s,
      height: s,
      borderRadius: s / 2,
      borderWidth: 1.5,
      borderColor: color,
      top: -s / 2,
      left: -s / 2,
      opacity,
    };
  });

  return <Animated.View style={pingStyle} />;
}

function RadarDot({ coord, index }: { coord: RadarDotCoord; index: number }) {
  const scale = useSharedValue(0);
  const delayMs = index * 80;

  useEffect(() => {
    scale.value = withDelay(delayMs, withSpring(1, DOT_SPRING));
  }, [delayMs, scale]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const { size, color } = coord;
  const half = size / 2;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: coord.y - half,
          left: coord.x - half,
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: size * 0.8,
          elevation: 3,
          alignItems: 'center',
          justifyContent: 'center',
        },
        dotStyle,
      ]}
    >
      <PingRing
        size={size}
        color={color}
        delayMs={delayMs + 120}
      />
    </Animated.View>
  );
}

interface RadarDotLayerProps {
  txs: WhaleTx[];
}

export function RadarDotLayer({ txs }: RadarDotLayerProps) {
  const coords = useMemo(() => buildCoords(txs), [txs]);

  return (
    <View
      style={{
        position: 'absolute',
        width: RADAR_SIZE,
        height: RADAR_SIZE,
        top: 0,
        left: 0,
      }}
    >
      {coords.map((coord, i) => (
        <RadarDot
          key={coord.tx.txHash}
          coord={coord}
          index={i}
        />
      ))}
    </View>
  );
}
