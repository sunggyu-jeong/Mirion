import { useLidoStore } from '@entities/lido';
import { useEthPrice } from '@features/staking';
import { InfoCard } from '@shared/ui';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const DURATION_OPTIONS = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
  { label: '1년', months: 12 },
  { label: '2년', months: 24 },
  { label: '5년', months: 60 },
];

function calcGrowth(principal: number, apyPercent: number, months: number): number[] {
  const monthlyRate = apyPercent / 100 / 12;
  return Array.from({ length: months + 1 }, (_, i) => principal * Math.pow(1 + monthlyRate, i));
}

const CHART_HEIGHT = 140;
const PAD_X = 36;
const PAD_RIGHT = 24;
const PAD_Y = 12;

function GrowthChart({ data, months }: { data: number[]; months: number }) {
  const [width, setWidth] = useState(0);
  if (data.length < 2 || width === 0) {
    return (
      <View
        style={{ height: CHART_HEIGHT }}
        onLayout={e => setWidth(e.nativeEvent.layout.width)}
      />
    );
  }

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

  // Y축 레이블: 시작값, 끝값
  const fmt = (v: number) => (v >= 1 ? v.toFixed(2) : v.toFixed(4));

  // 기간별 고정 눈금 (소수점 방지)
  const TICK_MAP: Record<number, number[]> = {
    1: [0, 1],
    3: [0, 1, 2, 3],
    6: [0, 2, 4, 6],
    12: [0, 3, 6, 9, 12],
    24: [0, 6, 12, 18, 24],
    60: [0, 12, 24, 36, 48, 60],
  };
  const tickMonths = TICK_MAP[months] ?? [0, months];
  const fmtMonth = (m: number) => {
    if (m === 0) {
      return '지금';
    }
    if (m % 12 === 0) {
      return `${m / 12}년`;
    }
    return `${m}개월`;
  };
  const xLabels = tickMonths.map(m => ({ x: pts[m].x, label: fmtMonth(m) }));

  return (
    <View
      style={{ height: CHART_HEIGHT + 20 }}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg
          width={width}
          height={CHART_HEIGHT + 20}
        >
          <Defs>
            <LinearGradient
              id="simGrad"
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
          {/* 가로 기준선 */}
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
            fill="url(#simGrad)"
          />
          <Path
            d={line}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Y축 레이블 */}
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
          {/* X축 레이블 */}
          {xLabels.map(({ x, label }, i) => (
            <SvgText
              key={i}
              x={x}
              y={CHART_HEIGHT + 14}
              fontSize="9"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

export function SimulatorScreen() {
  const { estimatedApy } = useLidoStore();
  const { data: ethPrice } = useEthPrice();
  const apy = estimatedApy > 0 ? estimatedApy : 3.5;

  const [amountText, setAmountText] = useState('1');
  const [selectedMonths, setSelectedMonths] = useState(12);

  const principal = parseFloat(amountText) || 0;
  const growthData = principal > 0 ? calcGrowth(principal, apy, selectedMonths) : [];
  const finalBalance = growthData[growthData.length - 1] ?? principal;
  const earned = finalBalance - principal;

  // USD 환산
  const priceNum = ethPrice ? parseFloat(ethPrice.price.replace(/[^0-9.]/g, '')) : 0;
  const earnedUsd = priceNum > 0 ? (earned * priceNum).toFixed(2) : null;
  const finalUsd = priceNum > 0 ? (finalBalance * priceNum).toFixed(2) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              gap: 16,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}>
              <Text
                style={{ fontSize: 22, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}
              >
                수익 시뮬레이터
              </Text>
              <Text style={{ fontSize: 14, color: '#62748e', marginTop: 4 }}>
                스테이킹하면 얼마나 벌 수 있는지 확인해보세요
              </Text>
            </Animated.View>

            {/* ETH 금액 입력 */}
            <Animated.View entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}>
              <InfoCard>
                <Text style={{ fontSize: 13, color: '#62748e', marginBottom: 8 }}>
                  스테이킹 금액
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <TextInput
                    style={{ flex: 1, fontSize: 22, fontWeight: '700', color: '#0f172b' }}
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#cad5e2"
                  />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#62748e' }}>ETH</Text>
                </View>
                {/* 빠른 선택 */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {['0.1', '0.5', '1', '5', '10'].map(v => (
                    <Pressable
                      key={v}
                      onPress={() => setAmountText(v)}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: amountText === v ? '#2b7fff' : '#f1f5f9',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: amountText === v ? '#fff' : '#62748e',
                        }}
                      >
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </InfoCard>
            </Animated.View>

            {/* 기간 선택 */}
            <Animated.View entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}>
              <InfoCard>
                <Text style={{ fontSize: 13, color: '#62748e', marginBottom: 8 }}>
                  스테이킹 기간
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {DURATION_OPTIONS.map(opt => (
                    <Pressable
                      key={opt.months}
                      onPress={() => setSelectedMonths(opt.months)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: selectedMonths === opt.months ? '#2b7fff' : '#f1f5f9',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: selectedMonths === opt.months ? '#fff' : '#62748e',
                        }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </InfoCard>
            </Animated.View>

            {/* 결과 카드 */}
            {principal > 0 && (
              <Animated.View entering={FadeInDown.delay(180).duration(260).easing(EASE_OUT)}>
                <InfoCard>
                  <View style={{ gap: 4, marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, color: '#62748e' }}>
                      APY {apy.toFixed(1)}% 기준 예상 수익
                    </Text>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: '#22c55e',
                        letterSpacing: -0.3,
                      }}
                    >
                      +{earned.toFixed(6)} ETH
                    </Text>
                    {earnedUsd && (
                      <Text style={{ fontSize: 14, color: '#62748e' }}>
                        ≈ ${Number(earnedUsd).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      borderTopWidth: 1,
                      borderTopColor: '#e2e8f0',
                      marginBottom: 16,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 12, color: '#94a3b8' }}>원금</Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>
                        {principal.toFixed(4)} ETH
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: '#94a3b8' }}>최종 잔고</Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>
                        {finalBalance.toFixed(6)} ETH
                      </Text>
                      {finalUsd && (
                        <Text style={{ fontSize: 12, color: '#62748e' }}>
                          ≈ ${Number(finalUsd).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  <GrowthChart
                    data={growthData}
                    months={selectedMonths}
                  />
                </InfoCard>
              </Animated.View>
            )}

            {/* 안내 문구 */}
            <Animated.View entering={FadeInDown.delay(240).duration(260).easing(EASE_OUT)}>
              <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 16 }}>
                {
                  '본 시뮬레이터는 현재 Lido APY 기준 예상치입니다.\n실제 수익은 시장 상황에 따라 달라질 수 있습니다.'
                }
              </Text>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
