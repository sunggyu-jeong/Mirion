import type { WhaleTx } from '@entities/whale-tx';
import type { PriceChartPeriod, PricePoint } from '@features/market-chart';
import { useMarketChart } from '@features/market-chart';
import { Skeleton } from '@shared/ui';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const PERIODS: PriceChartPeriod[] = ['1D', '1W', '1M'];
const CHART_HEIGHT = 200;
const PAD_TOP = 12;
const PAD_BOTTOM = 12;

function buildLinePath(points: PricePoint[], width: number): string {
  if (points.length < 2) {
    return '';
  }
  const prices = points.map(p => p.price);
  const times = points.map(p => p.timestampMs);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 1;
  const minT = times[0];
  const maxT = times[times.length - 1];
  const timeRange = maxT - minT || 1;
  const usableH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const toX = (t: number) => ((t - minT) / timeRange) * width;
  const toY = (p: number) => CHART_HEIGHT - PAD_BOTTOM - ((p - minP) / priceRange) * usableH;

  return points
    .map((pt, i) => {
      const x = toX(pt.timestampMs);
      const y = toY(pt.price);
      if (i === 0) {
        return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      const prev = points[i - 1];
      const px = toX(prev.timestampMs);
      const py = toY(prev.price);
      const cx = ((px + x) / 2).toFixed(1);
      return `C ${cx} ${py.toFixed(1)} ${cx} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function buildFillPath(points: PricePoint[], width: number): string {
  const line = buildLinePath(points, width);
  if (!line) {
    return '';
  }
  return `${line} L ${width.toFixed(1)} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
}

function getWhaleMarkers(
  points: PricePoint[],
  whaleEvents: WhaleTx[],
  width: number,
): { x: number; y: number; type: WhaleTx['type'] }[] {
  if (points.length < 2) {
    return [];
  }
  const prices = points.map(p => p.price);
  const times = points.map(p => p.timestampMs);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 1;
  const minT = times[0];
  const maxT = times[times.length - 1];
  const timeRange = maxT - minT || 1;
  const usableH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const toX = (t: number) => ((t - minT) / timeRange) * width;
  const toY = (p: number) => CHART_HEIGHT - PAD_BOTTOM - ((p - minP) / priceRange) * usableH;

  return whaleEvents
    .filter(tx => tx.timestampMs >= minT && tx.timestampMs <= maxT)
    .map(tx => {
      const nearest = points.reduce((a, b) =>
        Math.abs(a.timestampMs - tx.timestampMs) < Math.abs(b.timestampMs - tx.timestampMs) ? a : b,
      );
      return { x: toX(tx.timestampMs), y: toY(nearest.price), type: tx.type };
    });
}

interface Props {
  whaleEvents?: WhaleTx[];
}

export function PriceChart({ whaleEvents = [] }: Props) {
  const [period, setPeriod] = useState<PriceChartPeriod>('1W');
  const [chartWidth, setChartWidth] = useState(0);
  const { data, isLoading } = useMarketChart(period);

  const isPositive = data && data.length >= 2 ? data[data.length - 1].price >= data[0].price : true;
  const lineColor = isPositive ? '#22c55e' : '#fb2c36';

  const linePath = data && chartWidth > 0 ? buildLinePath(data, chartWidth) : '';
  const fillPath = data && chartWidth > 0 ? buildFillPath(data, chartWidth) : '';
  const markers = data && chartWidth > 0 ? getWhaleMarkers(data, whaleEvents, chartWidth) : [];

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 6, alignSelf: 'flex-end' }}>
        {PERIODS.map(p => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 8,
              backgroundColor: period === p ? '#0f172b' : '#e2e8f0',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: period === p ? 'white' : '#62748e',
                letterSpacing: 0.2,
              }}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={{ height: CHART_HEIGHT, borderRadius: 8, overflow: 'hidden' }}
        onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
      >
        {isLoading || chartWidth === 0 ? (
          <Skeleton
            width="100%"
            height={CHART_HEIGHT}
            borderRadius={8}
          />
        ) : linePath ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={{ flex: 1 }}
          >
            <Svg
              width={chartWidth}
              height={CHART_HEIGHT}
            >
              <Defs>
                <LinearGradient
                  id="chartFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop
                    offset="0%"
                    stopColor={lineColor}
                    stopOpacity={0.18}
                  />
                  <Stop
                    offset="100%"
                    stopColor={lineColor}
                    stopOpacity={0}
                  />
                </LinearGradient>
              </Defs>
              <Path
                d={fillPath}
                fill="url(#chartFill)"
              />
              <Path
                d={linePath}
                stroke={lineColor}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {markers.map((m, i) => (
                <Circle
                  key={i}
                  cx={m.x}
                  cy={m.y}
                  r={4}
                  fill={m.type === 'send' ? '#fb2c36' : '#22c55e'}
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}
            </Svg>
          </Animated.View>
        ) : null}
      </View>

      {markers.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fb2c36' }} />
            <Text style={{ fontSize: 11, color: '#62748e' }}>고래 전송</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <Text style={{ fontSize: 11, color: '#62748e' }}>고래 수신</Text>
          </View>
        </View>
      )}
    </View>
  );
}
