import type { CexTrade } from '@entities/cex-trade';
import type { ActivityEvent } from '@entities/unified-activity';
import type { WhaleTx, WhaleTxType } from '@entities/whale-tx';
import { CENTER, RADAR_SIZE } from '@widgets/radar-viewport';
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const MAX_DOTS = 30;
const SWEEP_DURATION_MS = 3200;

const ONCHAIN_COLOR: Record<WhaleTxType, string> = {
  receive: '#22D3EE',
  send: '#F43F5E',
  swap: '#A78BFA',
};

const CEX_COLOR: Record<'buy' | 'sell', string> = {
  buy: '#4ADE80',
  sell: '#FB923C',
};

function dotSize(usd: number): number {
  if (usd >= 1_000_000) {
    return 13;
  }
  if (usd >= 100_000) {
    return 9;
  }
  return 6;
}

function hashToAngleRad(str: string): number {
  const hex = str.replace(/^0x/, '').slice(0, 6).padEnd(6, '0');
  const val = parseInt(hex, 16);
  return (val / 0xffffff) * Math.PI * 2;
}

function symbolTimestampToAngleRad(symbol: string, timestampMs: number): number {
  let hash = 0;
  const s = symbol + timestampMs.toString();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash * 31 + s.charCodeAt(i)) >>> 0) % 0xffffff;
  }
  return (hash / 0xffffff) * Math.PI * 2;
}

function amountToRadius(usd: number): number {
  const minR = CENTER * 0.15;
  const maxR = CENTER * 0.88;
  const clamped = Math.min(Math.max(usd, 0), 5_000_000);
  const ratio = Math.sqrt(clamped / 5_000_000);
  return minR + ratio * (maxR - minR);
}

interface DotCoord {
  key: string;
  x: number;
  y: number;
  angleRad: number;
  color: string;
  size: number;
  isCex: boolean;
}

function buildCoords(events: ActivityEvent[]): DotCoord[] {
  return events.slice(0, MAX_DOTS).map((event, i) => {
    if (event.source === 'onchain') {
      const tx = event.data as WhaleTx;
      const angle = hashToAngleRad(tx.txHash);
      const r = amountToRadius(tx.amountUsd);
      return {
        key: `onchain-${tx.txHash}-${i}`,
        x: CENTER + r * Math.cos(angle),
        y: CENTER + r * Math.sin(angle),
        angleRad: angle,
        color: ONCHAIN_COLOR[tx.type],
        size: dotSize(tx.amountUsd),
        isCex: false,
      };
    }
    const trade = event.data as CexTrade;
    const angle = symbolTimestampToAngleRad(trade.symbol, trade.timestampMs);
    const r = amountToRadius(trade.valueUsd);
    return {
      key: `cex-${trade.symbol}-${trade.timestampMs}-${i}`,
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
      angleRad: angle,
      color: CEX_COLOR[trade.side],
      size: dotSize(trade.valueUsd),
      isCex: true,
    };
  });
}

const DOT_SPRING = { stiffness: 500, damping: 22 } as const;

const GLOW_RISE = 80;
const GLOW_FALL = 240;
const GLOW_IDLE = SWEEP_DURATION_MS - GLOW_RISE - GLOW_FALL;
const PULSE_RISE = 110;
const PULSE_FALL = 260;
const PULSE_IDLE = SWEEP_DURATION_MS - PULSE_RISE - PULSE_FALL;
const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);

function EntrancePing({ size, color, delayMs }: { size: number; color: string; delayMs: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delayMs, withTiming(1, { duration: 700 }));
  }, [delayMs, progress]);

  const style = useAnimatedStyle(() => {
    const s = interpolate(progress.value, [0, 1], [size, size * 3.5]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0.7, 0.4, 0]);
    return {
      position: 'absolute' as const,
      width: s,
      height: s,
      borderRadius: s / 2,
      borderWidth: 1.5,
      borderColor: color,
      top: (size - s) / 2,
      left: (size - s) / 2,
      opacity,
    };
  });

  return <Animated.View style={style} />;
}

function SweepGlowRing({
  size,
  color,
  hitDelay,
}: {
  size: number;
  color: string;
  hitDelay: number;
}) {
  const opacity = useSharedValue(0);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      hitDelay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: GLOW_RISE, easing: EASE_OUT }),
          withTiming(0, { duration: GLOW_FALL, easing: EASE_IN }),
          withTiming(0, { duration: GLOW_IDLE }),
        ),
        -1,
        false,
      ),
    );
    ringScale.value = withDelay(
      hitDelay,
      withRepeat(
        withSequence(
          withTiming(2.6, { duration: GLOW_RISE + GLOW_FALL, easing: EASE_OUT }),
          withTiming(1, { duration: GLOW_IDLE }),
        ),
        -1,
        false,
      ),
    );
  }, [hitDelay, opacity, ringScale]);

  const style = useAnimatedStyle(() => {
    const s = size * ringScale.value;
    return {
      position: 'absolute' as const,
      width: s,
      height: s,
      borderRadius: s / 2,
      borderWidth: 1.5,
      borderColor: color,
      top: (size - s) / 2,
      left: (size - s) / 2,
      opacity: opacity.value,
    };
  });

  return <Animated.View style={style} />;
}

function RadarDot({ coord, index }: { coord: DotCoord; index: number }) {
  const entranceScale = useSharedValue(0);
  const sweepPulse = useSharedValue(1);
  const entranceDelayMs = index * 80;
  const hitDelay = Math.round((coord.angleRad / (Math.PI * 2)) * SWEEP_DURATION_MS);

  useEffect(() => {
    entranceScale.value = withDelay(entranceDelayMs, withSpring(1, DOT_SPRING));
  }, [entranceDelayMs, entranceScale]);

  useEffect(() => {
    sweepPulse.value = withDelay(
      hitDelay,
      withRepeat(
        withSequence(
          withTiming(1.55, { duration: PULSE_RISE, easing: EASE_OUT }),
          withTiming(1, { duration: PULSE_FALL, easing: EASE_IN }),
          withTiming(1, { duration: PULSE_IDLE }),
        ),
        -1,
        false,
      ),
    );
  }, [hitDelay, sweepPulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entranceScale.value * sweepPulse.value }],
  }));

  const { size, color, isCex } = coord;
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
          borderRadius: isCex ? 2 : half,
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
      <EntrancePing
        size={size}
        color={color}
        delayMs={entranceDelayMs + 120}
      />
      <SweepGlowRing
        size={size}
        color={color}
        hitDelay={hitDelay}
      />
    </Animated.View>
  );
}

interface RadarDotLayerProps {
  events: ActivityEvent[];
}

export function RadarDotLayer({ events }: RadarDotLayerProps) {
  const coords = useMemo(() => buildCoords(events), [events]);

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
          key={coord.key}
          coord={coord}
          index={i}
        />
      ))}
    </View>
  );
}
