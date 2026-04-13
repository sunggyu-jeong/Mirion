import { computeDailySummary } from '@entities/daily-summary';
import type { WhaleTx } from '@entities/whale-tx';
import { formatUsd } from '@shared/lib/format';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const GAUGE_SPRING = { stiffness: 120, damping: 14 } as const;
const CARD_SPRING = { stiffness: 400, damping: 30 } as const;

function computeMirionScore(txs: WhaleTx[]): number {
  if (txs.length === 0) {
    return 50;
  }
  const receiveCnt = txs.filter(t => t.type === 'receive').length;
  const sendCnt = txs.filter(t => t.type === 'send').length;
  const total = receiveCnt + sendCnt;
  if (total === 0) {
    return 50;
  }
  return Math.round((receiveCnt / total) * 100);
}

function buildBriefingText(txs: WhaleTx[], score: number): string {
  if (txs.length === 0) {
    return '아직 오늘의 고래 활동 데이터가 없습니다.';
  }
  const summary = computeDailySummary(txs);
  const direction = score >= 60 ? '순매수' : score <= 40 ? '순매도' : '관망';
  const amountStr = formatUsd(summary.totalUsd);
  return `대형 고래 ${summary.totalCount}건이 12시간 내 ${amountStr} ${direction} 중`;
}

function scoreLabel(score: number): string {
  if (score >= 70) {
    return '강세';
  }
  if (score >= 55) {
    return '약강세';
  }
  if (score >= 45) {
    return '중립';
  }
  if (score >= 30) {
    return '약약세';
  }
  return '약세';
}

function scoreColor(score: number): string {
  'worklet';
  if (score >= 70) {
    return '#22c55e';
  }
  if (score >= 55) {
    return '#86efac';
  }
  if (score >= 45) {
    return '#94a3b8';
  }
  if (score >= 30) {
    return '#fca5a5';
  }
  return '#fb2c36';
}

interface GaugeBarProps {
  score: number;
}

function GaugeBar({ score }: GaugeBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(score / 100, GAUGE_SPRING);
  }, [score, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: scoreColor(score),
  }));

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>약세</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '800',
              color: scoreColor(score),
              letterSpacing: -0.3,
            }}
          >
            {score}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: scoreColor(score),
            }}
          >
            {scoreLabel(score)}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>강세</Text>
      </View>

      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 3,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

interface BriefingCardProps {
  movements?: WhaleTx[];
}

export function BriefingCard({ movements }: BriefingCardProps) {
  const txs = movements ?? [];
  const score = computeMirionScore(txs);
  const briefingText = buildBriefingText(txs, score);

  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <Animated.View
      entering={FadeInDown.springify()
        .stiffness(CARD_SPRING.stiffness)
        .damping(CARD_SPRING.damping)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 3,
        gap: 14,
        marginBottom: 4,
      }}
    >
      <Animated.View
        entering={FadeInDown.delay(60).duration(260)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#2b7fff', letterSpacing: 0.3 }}>
          오늘의 미리온 지수
        </Text>
        <Text style={{ fontSize: 11, color: '#94a3b8' }}>{today}</Text>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(120).duration(280)}
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: '#0f172b',
          letterSpacing: -0.4,
          lineHeight: 24,
        }}
      >
        {briefingText}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <GaugeBar score={score} />
      </Animated.View>
    </Animated.View>
  );
}
