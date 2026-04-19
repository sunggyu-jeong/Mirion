import type { WhaleTx } from '@entities/whale-tx';
import type { PriceChartPeriod, PricePoint } from '@features/market-chart';
import { useMarketChart } from '@features/market-chart';
import { Skeleton } from '@shared/ui';
import { SegmentedControl } from '@shared/ui';
import React, { useRef, useState } from 'react';
import { PanResponder, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

const PERIODS: { label: string; value: PriceChartPeriod }[] = [
  { label: '1일', value: '1D' },
  { label: '1주', value: '1W' },
  { label: '1달', value: '1M' },
];
const CHART_HEIGHT = 180;
const PAD_TOP = 24;
const PAD_BOTTOM = 12;
const Y_LABEL_WIDTH = 52;
const MIN_SCALE = 0.8;
const MAX_SCALE = 4.0;

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(2)}M`;
  }
  if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(1)}K`;
  }
  return `$${price.toFixed(2)}`;
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

function getPriceGuides(
  minP: number,
  maxP: number,
  _width: number,
): { y: number; price: number }[] {
  const priceRange = maxP - minP || 1;
  const usableH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const toY = (p: number) => CHART_HEIGHT - PAD_BOTTOM - ((p - minP) / priceRange) * usableH;
  const mid = (minP + maxP) / 2;
  return [
    { y: toY(maxP), price: maxP },
    { y: toY(mid), price: mid },
    { y: toY(minP), price: minP },
  ];
}

interface Props {
  whaleEvents?: WhaleTx[];
}

export function PriceChart({ whaleEvents = [] }: Props) {
  const [period, setPeriod] = useState<PriceChartPeriod>('1D');
  const [chartWidth, setChartWidth] = useState(0);
  const [scale, setScale] = useState(1);
  const lastDistance = useRef(0);
  const lastScale = useRef(1);
  const { data, isLoading } = useMarketChart(period);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: evt => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: evt => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: evt => {
        if (evt.nativeEvent.touches.length === 2) {
          const [t1, t2] = evt.nativeEvent.touches;
          lastDistance.current = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
          lastScale.current = scale;
        }
      },
      onPanResponderMove: evt => {
        if (evt.nativeEvent.touches.length === 2) {
          const [t1, t2] = evt.nativeEvent.touches;
          const dist = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
          if (lastDistance.current > 0) {
            const ratio = dist / lastDistance.current;
            setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * ratio)));
          }
          lastDistance.current = dist;
        }
      },
      onPanResponderRelease: () => {
        lastDistance.current = 0;
      },
    }),
  ).current;

  const prices = data ? data.map(p => p.price) : [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const lastPrice = data?.length ? data[data.length - 1].price : 0;
  const firstPrice = data?.length ? data[0].price : 0;

  const isPositive = lastPrice >= firstPrice;
  const lineColor = isPositive ? '#22D3EE' : '#F43F5E';
  const svgWidth = chartWidth * scale;

  const linePath = data && svgWidth > 0 ? buildLinePath(data, svgWidth) : '';
  const fillPath = data && svgWidth > 0 ? buildFillPath(data, svgWidth) : '';
  const markers = data && svgWidth > 0 ? getWhaleMarkers(data, whaleEvents, svgWidth) : [];
  const guides = data && maxPrice > 0 ? getPriceGuides(minPrice, maxPrice, svgWidth) : [];

  return (
    <View style={{ gap: 14 }}>
      <SegmentedControl
        options={PERIODS}
        value={period}
        onChange={setPeriod}
        dark
      />

      <View style={{ height: CHART_HEIGHT, flexDirection: 'row' }}>
        <View style={{ width: Y_LABEL_WIDTH, height: CHART_HEIGHT, position: 'relative' }}>
          {guides.map(g => (
            <Text
              key={g.price}
              style={{
                position: 'absolute',
                top: g.y - 8,
                right: 6,
                fontSize: 10,
                fontWeight: '600',
                color: 'rgba(255,255,255,0.45)',
                textAlign: 'right',
              }}
            >
              {formatPriceShort(g.price)}
            </Text>
          ))}
        </View>

        <View
          style={{ flex: 1, height: CHART_HEIGHT, borderRadius: 12, overflow: 'hidden' }}
          onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          {lastPrice > 0 && !isLoading && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
                backgroundColor: isPositive ? 'rgba(34,211,238,0.2)' : 'rgba(244,63,94,0.2)',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: isPositive ? '#22D3EE' : '#F43F5E',
                  letterSpacing: -0.3,
                }}
              >
                ${formatPrice(lastPrice)}
              </Text>
            </View>
          )}

          {scale > 1.05 && (
            <View
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                {scale.toFixed(1)}x
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
            <ScrollView
              horizontal
              scrollEnabled={scale > 1.05}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ width: svgWidth }}
            >
              <Animated.View entering={FadeIn.duration(400)}>
                <Svg
                  width={svgWidth}
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
                  {guides.map(g => (
                    <Line
                      key={g.price}
                      x1={0}
                      y1={g.y}
                      x2={svgWidth}
                      y2={g.y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  ))}
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
                      fill={m.type === 'send' ? '#F43F5E' : '#22D3EE'}
                      stroke="#020B18"
                      strokeWidth={1.5}
                    />
                  ))}
                </Svg>
              </Animated.View>
            </ScrollView>
          ) : null}
        </View>
      </View>

      {markers.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E' }} />
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>고래 전송</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22D3EE' }} />
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>고래 수신</Text>
          </View>
        </View>
      )}
    </View>
  );
}
