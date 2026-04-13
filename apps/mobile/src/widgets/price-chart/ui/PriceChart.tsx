import type { WhaleTx } from '@entities/whale-tx';
import type { PriceChartPeriod, PricePoint } from '@features/market-chart';
import { useMarketChart } from '@features/market-chart';
import { Skeleton } from '@shared/ui';
import { SegmentedControl } from '@shared/ui';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const PERIODS: { label: string; value: PriceChartPeriod }[] = [
  { label: '1일', value: '1D' },
  { label: '1주', value: '1W' },
  { label: '1달', value: '1M' },
];
const CHART_HEIGHT = 180;
const PAD_TOP = 12;
const PAD_BOTTOM = 12;

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

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
  const [period, setPeriod] = useState<PriceChartPeriod>('1D');
  const [chartWidth, setChartWidth] = useState(0);
  const { data, isLoading } = useMarketChart(period);

  const prices = data ? data.map(p => p.price) : [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const lastPrice = data?.length ? data[data.length - 1].price : 0;
  const firstPrice = data?.length ? data[0].price : 0;

  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  const linePath = data && chartWidth > 0 ? buildLinePath(data, chartWidth) : '';
  const fillPath = data && chartWidth > 0 ? buildFillPath(data, chartWidth) : '';
  const markers = data && chartWidth > 0 ? getWhaleMarkers(data, whaleEvents, chartWidth) : [];

  return (
    <View style={{ gap: 14 }}>
      <SegmentedControl
        options={PERIODS}
        value={period}
        onChange={setPeriod}
      />

      {!isLoading && maxPrice > 0 && (
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              저점{'  '}
              <Text style={{ fontWeight: '700', color: '#0f172b' }}>${formatPrice(minPrice)}</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              고점{'  '}
              <Text style={{ fontWeight: '700', color: '#0f172b' }}>${formatPrice(maxPrice)}</Text>
            </Text>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
          </View>
        </View>
      )}

      <View
        style={{ height: CHART_HEIGHT, borderRadius: 12, overflow: 'hidden' }}
        onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
      >
        {lastPrice > 0 && !isLoading && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: isPositive ? '#dcfce7' : '#fee2e2',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: isPositive ? '#16a34a' : '#dc2626',
                letterSpacing: -0.3,
              }}
            >
              ${formatPrice(lastPrice)}
            </Text>
          </View>
        )}

        {isLoading || chartWidth === 0 ? (
          <Skeleton
            width="100%"
            height={CHART_HEIGHT}
            borderRadius={12}
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
                    stopOpacity={0.22}
                  />
                  <Stop
                    offset="75%"
                    stopColor={lineColor}
                    stopOpacity={0.04}
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
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {markers.map((m, i) => (
                <Circle
                  key={i}
                  cx={m.x}
                  cy={m.y}
                  r={4.5}
                  fill={m.type === 'send' ? '#ef4444' : '#22c55e'}
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}
            </Svg>
          </Animated.View>
        ) : null}
      </View>

      {markers.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
            <Text style={{ fontSize: 11, color: '#64748b' }}>고래 전송</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <Text style={{ fontSize: 11, color: '#64748b' }}>고래 수신</Text>
          </View>
        </View>
      )}
    </View>
  );
}
