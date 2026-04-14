import { computeDailySummary } from '@entities/daily-summary';
import type { WhaleTx } from '@entities/whale-tx';
import { formatUsd } from '@shared/lib/format';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GAUGE_SPRING = { stiffness: 120, damping: 14 } as const;
const CARD_SPRING = { stiffness: 400, damping: 30 } as const;

function computeMirionScore(txs: WhaleTx[]): number {
  if (txs.length === 0) {
    return 50;
  }
  const receiveCnt = txs.filter(t => t.type === 'receive').length;
  const total = txs.length;
  return Math.round((receiveCnt / total) * 100);
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

function buildContextText(txs: WhaleTx[], score: number): string {
  if (txs.length === 0) {
    return '아직 오늘의 고래 활동 데이터가 없어요';
  }
  const summary = computeDailySummary(txs);
  const direction = score >= 60 ? '순매수' : score <= 40 ? '순매도' : '관망';
  return `고래 ${summary.totalCount}건 · ${formatUsd(summary.totalUsd)} ${direction}`;
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
    <View
      style={{
        height: 4,
        borderRadius: 2,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[{ height: '100%', borderRadius: 2 }, fillStyle]} />
    </View>
  );
}

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  score: number;
  txs: WhaleTx[];
}

function DetailModal({ visible, onClose, score, txs }: DetailModalProps) {
  const insets = useSafeAreaInsets();
  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top + 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 32,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172b', letterSpacing: -0.5 }}>
            미리온 지수 상세
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: pressed ? '#f1f5f9' : '#f8fafc',
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>닫기</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.5 }}>
              {today.toUpperCase()}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <Text
                style={{
                  fontSize: 72,
                  fontWeight: '800',
                  color: scoreColor(score),
                  letterSpacing: -2,
                  lineHeight: 80,
                }}
              >
                {score}
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: scoreColor(score),
                  marginBottom: 12,
                }}
              >
                {scoreLabel(score)}
              </Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
            >
              <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>약세</Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>강세</Text>
            </View>
            <View
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#f1f5f9',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${score}%`,
                  height: '100%',
                  backgroundColor: scoreColor(score),
                  borderRadius: 5,
                }}
              />
            </View>
          </View>

          {txs.length > 0 && (
            <View
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 20,
                padding: 20,
                gap: 14,
                borderWidth: 1,
                borderColor: '#f1f5f9',
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: '#0f172b', letterSpacing: -0.2 }}
              >
                상세 분석
              </Text>
              <View style={{ gap: 10 }}>
                {[
                  {
                    label: '매수 신호',
                    value: `${txs.filter(t => t.type === 'receive').length}건`,
                    color: '#22c55e',
                  },
                  {
                    label: '매도 신호',
                    value: `${txs.filter(t => t.type === 'send').length}건`,
                    color: '#fb2c36',
                  },
                  {
                    label: '총 이동량',
                    value: formatUsd(txs.reduce((s, t) => s + t.amountUsd, 0)),
                    color: '#0f172b',
                  },
                ].map(item => (
                  <View
                    key={item.label}
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <Text style={{ fontSize: 14, color: '#64748b' }}>{item.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: item.color }}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface BriefingCardProps {
  movements?: WhaleTx[];
}

export function BriefingCard({ movements }: BriefingCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useSharedValue(1);

  const txs = movements ?? [];
  const score = computeMirionScore(txs);
  const label = scoreLabel(score);
  const color = scoreColor(score);
  const contextText = buildContextText(txs, score);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, CARD_SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, CARD_SPRING);
        }}
        onPress={() => setModalVisible(true)}
      >
        <Animated.View
          entering={FadeInDown.springify()
            .stiffness(CARD_SPRING.stiffness)
            .damping(CARD_SPRING.damping)}
          style={[
            {
              backgroundColor: '#f8fafc',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: '#f1f5f9',
              gap: 16,
            },
            animStyle,
          ]}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#2b7fff', letterSpacing: 0.3 }}>
              오늘의 미리온 지수
            </Text>
            <ChevronRight
              size={14}
              color="#cbd5e1"
              strokeWidth={2}
            />
          </View>

          <Animated.View
            entering={FadeIn.delay(80).duration(300)}
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}
          >
            <Text
              style={{
                fontSize: 56,
                fontWeight: '800',
                color,
                letterSpacing: -2,
                lineHeight: 60,
              }}
            >
              {score}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color,
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              {label}
            </Text>
          </Animated.View>

          <View style={{ gap: 10 }}>
            <Text
              style={{ fontSize: 13, color: '#62748e', fontWeight: '400', letterSpacing: -0.1 }}
            >
              {contextText}
            </Text>
            <GaugeBar score={score} />
          </View>
        </Animated.View>
      </Pressable>

      <DetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        score={score}
        txs={txs}
      />
    </>
  );
}
