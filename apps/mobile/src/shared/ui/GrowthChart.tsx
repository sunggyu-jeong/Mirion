import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

const CHART_HEIGHT = 140;
const PAD_X = 36;
const PAD_RIGHT = 24;
const PAD_Y = 12;

type XTick = { index: number; label: string };

type Props = {
  data: number[];
  xTicks: XTick[];
};

function buildPaths(data: number[], width: number) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const chartW = width - PAD_X - PAD_RIGHT;
  const chartH = CHART_HEIGHT - PAD_Y * 2;

  const pts = data.map((v, i) => ({
    x: PAD_X + (i / (data.length - 1)) * chartW,
    y: PAD_Y + chartH - ((v - min) / range) * chartH,
  }));

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

  return { pts, line, area, min, max };
}

function fmt(v: number): string {
  return v >= 1 ? v.toFixed(2) : v.toFixed(4);
}

export function GrowthChart({ data, xTicks }: Props) {
  const [width, setWidth] = useState(0);

  if (data.length < 2) {
    return null;
  }

  if (width === 0) {
    return (
      <View
        style={{ height: 140 }}
        onLayout={e => setWidth(e.nativeEvent.layout.width)}
      />
    );
  }

  const { pts, line, area, min, max } = buildPaths(data, width);
  const chartH = CHART_HEIGHT - PAD_Y * 2;

  return (
    <View
      style={{ height: 160 }}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      <Svg
        width={width}
        height={CHART_HEIGHT + 20}
      >
        <Defs>
          <LinearGradient
            id="growthGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <Stop
              offset="0"
              stopColor="#22c55e"
              stopOpacity="0.25"
            />
            <Stop
              offset="1"
              stopColor="#22c55e"
              stopOpacity="0"
            />
          </LinearGradient>
        </Defs>
        <Line
          x1={PAD_X}
          y1={PAD_Y + chartH}
          x2={width - PAD_RIGHT}
          y2={PAD_Y + chartH}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        <Path
          d={area}
          fill="url(#growthGrad)"
        />
        <Path
          d={line}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgText
          x={PAD_X - 4}
          y={PAD_Y + 4}
          fontSize="9"
          fill="#94a3b8"
          textAnchor="end"
        >
          {fmt(max)}
        </SvgText>
        <SvgText
          x={PAD_X - 4}
          y={PAD_Y + chartH}
          fontSize="9"
          fill="#94a3b8"
          textAnchor="end"
        >
          {fmt(min)}
        </SvgText>
        {xTicks.map(({ index, label }) => (
          <SvgText
            key={index}
            x={pts[index].x}
            y={CHART_HEIGHT + 14}
            fontSize="9"
            fill="#94a3b8"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
