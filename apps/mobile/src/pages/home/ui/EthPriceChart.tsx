import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const CHART_HEIGHT = 80;
const PAD = 4;

function buildPaths(prices: number[], width: number): { line: string; area: string } {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = width - PAD * 2;
  const h = CHART_HEIGHT - PAD * 2;

  const pts = prices.map((p, i) => ({
    x: PAD + (i / (prices.length - 1)) * w,
    y: PAD + h - ((p - min) / range) * h,
  }));

  // 양쪽 제어점을 중점으로 잡는 smooth cubic bezier
  const line = pts
    .map((p, i) => {
      if (i === 0) {
        return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }
      const prev = pts[i - 1];
      const cpx = ((prev.x + p.x) / 2).toFixed(1);
      return `C ${cpx},${prev.y.toFixed(1)} ${cpx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  const last = pts[pts.length - 1];
  const first = pts[0];
  const area = `${line} L ${last.x.toFixed(1)},${CHART_HEIGHT} L ${first.x.toFixed(1)},${CHART_HEIGHT} Z`;

  return { line, area };
}

export function EthPriceChart({ prices }: { prices: number[] }) {
  const [width, setWidth] = useState(0);

  if (prices.length < 2) {
    return null;
  }

  const { line, area } = buildPaths(prices, width || 300);

  return (
    <View
      style={{ height: CHART_HEIGHT, marginTop: 16 }}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg
          width={width}
          height={CHART_HEIGHT}
        >
          <Defs>
            <LinearGradient
              id="ethGrad"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop
                offset="0"
                stopColor="#2b7fff"
                stopOpacity="0.2"
              />
              <Stop
                offset="1"
                stopColor="#2b7fff"
                stopOpacity="0"
              />
            </LinearGradient>
          </Defs>
          <Path
            d={area}
            fill="url(#ethGrad)"
          />
          <Path
            d={line}
            fill="none"
            stroke="#2b7fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}
