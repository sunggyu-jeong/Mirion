import type { ActivityEvent } from '@entities/unified-activity';
import type { WhaleTx } from '@entities/whale-tx';
import { useUnifiedActivity } from '@features/unified-feed';
import { formatUsd } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import { RadarDotLayer } from '@widgets/radar-dot-layer';
import { RadarViewport } from '@widgets/radar-viewport';
import { ChevronRight } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESS_SPRING = { damping: 18, stiffness: 400 } as const;

function RadarStats({ events }: { events: ActivityEvent[] }) {
  const onchain = events.filter(e => e.source === 'onchain');
  const cexCount = events.filter(e => e.source === 'cex').length;
  const totalUsd = onchain.reduce((s, e) => s + (e.data as WhaleTx).amountUsd, 0);
  const sends = onchain.filter(e => (e.data as WhaleTx).type === 'send').length;
  const receives = onchain.filter(e => (e.data as WhaleTx).type === 'receive').length;
  const total = sends + receives;
  const sellPct = total > 0 ? Math.round((sends / total) * 100) : 50;
  const buyPct = 100 - sellPct;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
            온체인 이동량
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
            {formatUsd(totalUsd)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
            감지 건수
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
              {onchain.length}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>온체인</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.25)' }}>
              +
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: '800', color: '#22D3EE', letterSpacing: -0.5 }}
            >
              {cexCount}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>거래소</Text>
          </View>
        </View>
      </View>
      {total > 0 && (
        <View style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#F43F5E' }}>
              매도 압력 {sellPct}%
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#22D3EE' }}>
              {buyPct}% 매수 압력
            </Text>
          </View>
          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.08)',
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            <View style={{ width: `${sellPct}%`, backgroundColor: '#F43F5E', borderRadius: 3 }} />
            <View style={{ width: 2, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <View style={{ flex: 1, backgroundColor: '#22D3EE', borderRadius: 3 }} />
          </View>
        </View>
      )}
    </View>
  );
}

type LegendItem = { color: string; label: string; isCex: boolean };

const LEGEND_ITEMS: LegendItem[] = [
  { color: '#22D3EE', label: '수신', isCex: false },
  { color: '#F43F5E', label: '전송', isCex: false },
  { color: '#A78BFA', label: '스왑', isCex: false },
  { color: '#4ADE80', label: '매수', isCex: true },
  { color: '#FB923C', label: '매도', isCex: true },
];

function RadarLegend() {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 2,
      }}
    >
      {LEGEND_ITEMS.map(item => (
        <View
          key={item.label}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: item.isCex ? 1.5 : 3.5,
              backgroundColor: item.color,
              shadowColor: item.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 3,
            }}
          />
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500' }}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FeedButton({ onPress, count }: { onPress: () => void; count: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      onPress={onPress}
      style={{ paddingHorizontal: 20, paddingTop: 4 }}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(6,182,212,0.25)',
            backgroundColor: 'rgba(6,182,212,0.06)',
          },
          animStyle,
        ]}
      >
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: 'white', letterSpacing: -0.3 }}>
            감지 피드 보기
          </Text>
          {count > 0 && (
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{count}건 감지됨</Text>
          )}
        </View>
        <ChevronRight
          size={18}
          color="#06B6D4"
          strokeWidth={2.5}
        />
      </Animated.View>
    </Pressable>
  );
}

export function HistoryScreen() {
  const { toRadarFeed } = useAppNavigation();
  const { data: allEvents, isLoading } = useUnifiedActivity('ALL');

  const handleFeedPress = useCallback(() => toRadarFeed(), [toRadarFeed]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#020B18' }}
        edges={['top']}
      >
        <View style={{ gap: 10, padding: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={{ height: 80, borderRadius: 16, backgroundColor: 'rgba(6,182,212,0.06)' }}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#020B18' }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
          고래 이동 레이더
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#06B6D4' }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#06B6D4' }}>실시간 감지 중</Text>
        </View>
      </View>

      <RadarViewport>
        <RadarDotLayer events={allEvents} />
      </RadarViewport>

      <RadarLegend />

      <RadarStats events={allEvents} />

      <FeedButton
        onPress={handleFeedPress}
        count={allEvents.length}
      />
    </SafeAreaView>
  );
}
