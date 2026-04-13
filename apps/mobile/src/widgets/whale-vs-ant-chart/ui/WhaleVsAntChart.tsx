import type { WhaleTx } from '@entities/whale-tx';
import { formatUsd } from '@shared/lib/format';
import { AnimatedNumber } from '@shared/ui';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const BAR_SPRING = { stiffness: 120, damping: 14 } as const;
const BUY_COLOR = '#22c55e';
const SELL_COLOR = '#fb2c36';
const BAR_HEIGHT = 14;

function computeRatio(txs: WhaleTx[]): {
  buyRatio: number;
  buyUsd: number;
  sellUsd: number;
} {
  const buyUsd = txs.filter(t => t.type === 'receive').reduce((s, t) => s + t.amountUsd, 0);
  const sellUsd = txs.filter(t => t.type === 'send').reduce((s, t) => s + t.amountUsd, 0);
  const total = buyUsd + sellUsd;
  return {
    buyRatio: total > 0 ? buyUsd / total : 0.5,
    buyUsd,
    sellUsd,
  };
}

interface GaugeBarProps {
  ratio: Animated.SharedValue<number>;
}

function GaugeBar({ ratio }: GaugeBarProps) {
  const [barWidth, setBarWidth] = useState(0);

  const buyStyle = useAnimatedStyle(() => ({
    width: interpolate(ratio.value, [0, 1], [0, barWidth]),
    backgroundColor: BUY_COLOR,
  }));

  const sellStyle = useAnimatedStyle(() => ({
    width: interpolate(ratio.value, [0, 1], [barWidth, 0]),
    backgroundColor: SELL_COLOR,
  }));

  return (
    <View
      onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
      style={{
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        backgroundColor: '#f1f5f9',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[{ height: '100%', borderRadius: BAR_HEIGHT / 2 }, buyStyle]} />
      <View style={{ width: 2, backgroundColor: 'white', zIndex: 1 }} />
      <Animated.View
        style={[{ height: '100%', flex: 1, borderRadius: BAR_HEIGHT / 2 }, sellStyle]}
      />
    </View>
  );
}

interface PctLabelProps {
  pct: number;
  color: string;
  align: 'left' | 'right';
}

function PctLabel({ pct, color, align }: PctLabelProps) {
  return (
    <View
      style={{
        flexDirection: align === 'right' ? 'row-reverse' : 'row',
        alignItems: 'baseline',
        gap: 2,
      }}
    >
      <AnimatedNumber
        value={String(pct)}
        fontSize={18}
        fontWeight="800"
        color={color}
        letterSpacing={-0.4}
      />
      <Text style={{ fontSize: 12, fontWeight: '600', color, letterSpacing: -0.2 }}>%</Text>
    </View>
  );
}

interface WhaleVsAntChartProps {
  movements?: WhaleTx[];
}

export function WhaleVsAntChart({ movements }: WhaleVsAntChartProps) {
  const ratio = useSharedValue(0.5);
  const txs = movements ?? [];
  const { buyRatio, buyUsd, sellUsd } = computeRatio(txs);

  const buyPct = Math.round(buyRatio * 100);
  const sellPct = 100 - buyPct;

  useEffect(() => {
    ratio.value = withSpring(buyRatio, BAR_SPRING);
  }, [buyRatio, ratio]);

  return (
    <Animated.View
      entering={FadeInDown.delay(60).springify().stiffness(400).damping(30)}
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}>
          고래 힘겨루기
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#22c55e' }}>실시간</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 18 }}>🐋</Text>
          <View style={{ gap: 1 }}>
            <PctLabel
              pct={buyPct}
              color={BUY_COLOR}
              align="left"
            />
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '500' }}>매수</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: '#cbd5e1', fontWeight: '500', letterSpacing: 0.5 }}>
            VS
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ gap: 1, alignItems: 'flex-end' }}>
            <PctLabel
              pct={sellPct}
              color={SELL_COLOR}
              align="right"
            />
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '500' }}>매도</Text>
          </View>
          <Text style={{ fontSize: 18 }}>🔴</Text>
        </View>
      </View>

      <GaugeBar ratio={ratio} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: BUY_COLOR }}>
          {formatUsd(buyUsd)}
        </Text>
        <Text style={{ fontSize: 11, color: '#cbd5e1' }}>|</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: SELL_COLOR }}>
          {formatUsd(sellUsd)}
        </Text>
      </View>
    </Animated.View>
  );
}
