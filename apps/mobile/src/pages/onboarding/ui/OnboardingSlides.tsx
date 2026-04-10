import React from 'react';
import { Dimensions, Text, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
}

export const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🐋',
    title: '고래를\n따라가세요',
    subtitle: '전 세계 최대 규모 투자자들의\n매수·매도를 실시간으로 포착합니다',
    accentColor: '#2b7fff',
    bgColor: '#eff6ff',
  },
  {
    id: '2',
    emoji: '📡',
    title: '실시간\n이동 레이더',
    subtitle: '100 ETH 이상 대규모 이체를 즉시 감지\n누가 무엇을 움직이는지 먼저 알 수 있습니다',
    accentColor: '#22c55e',
    bgColor: '#f0fdf4',
  },
  {
    id: '3',
    emoji: '📈',
    title: 'ETH 가격과\n고래 시그널',
    subtitle: '차트 위 고래 이체 마커로\n가격 변동의 선행 신호를 확인하세요',
    accentColor: '#f59e0b',
    bgColor: '#fefce8',
  },
  {
    id: '4',
    emoji: '🔓',
    title: 'PRO로\n더 깊이',
    subtitle: '20+ 고래 추적 · 무제한 내역\n실시간 푸시 알림까지 모두 해제됩니다',
    accentColor: '#a855f7',
    bgColor: '#fdf4ff',
  },
];

export function SlideItem({ item }: { item: Slide }) {
  return (
    <View
      style={{
        width: SCREEN_W,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 36,
        }}
      >
        <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
      </View>

      <Text
        style={{
          fontSize: 34,
          fontWeight: '900',
          color: '#0f172b',
          letterSpacing: -1,
          textAlign: 'center',
          lineHeight: 42,
          marginBottom: 16,
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '400',
          color: '#62748e',
          textAlign: 'center',
          lineHeight: 23,
          letterSpacing: -0.02,
        }}
      >
        {item.subtitle}
      </Text>
    </View>
  );
}
