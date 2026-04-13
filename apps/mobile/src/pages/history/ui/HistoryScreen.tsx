import { useSubscriptionStore } from '@entities/subscription';
import type { ActivityEvent } from '@entities/unified-activity';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { useUnifiedActivity } from '@features/unified-feed';
import { formatUsd } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import { ChainFilterBar } from '@shared/ui';
import { RadarViewport } from '@widgets/radar-viewport';
import { UnifiedActivityItem } from '@widgets/unified-activity';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type SourceFilter = 'ALL' | 'ONCHAIN' | 'CEX';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const FREE_ONCHAIN_LIMIT = 3;
const FREE_CEX_LIMIT = 3;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ProcessedEvent>);

type ProcessedEvent = { event: ActivityEvent; isLocked: boolean };

function ItemSeparator() {
  return <View style={{ height: 10 }} />;
}

function SentimentGauge({ events }: { events: ActivityEvent[] }) {
  const onchain = events.filter(e => e.source === 'onchain');
  const sends = onchain.filter(e => (e.data as WhaleTx).type === 'send').length;
  const receives = onchain.filter(e => (e.data as WhaleTx).type === 'receive').length;
  const total = sends + receives;
  const sellRatio = total > 0 ? sends / total : 0.5;
  const sellPct = Math.round(sellRatio * 100);
  const buyPct = 100 - sellPct;

  const totalUsd = onchain.reduce((s, e) => s + (e.data as WhaleTx).amountUsd, 0);
  const cexCount = events.filter(e => e.source === 'cex').length;

  return (
    <View
      style={{
        marginBottom: 14,
        backgroundColor: '#f8fafc',
        borderRadius: 18,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>온체인 이동량</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172b', letterSpacing: -0.5 }}>
            {formatUsd(totalUsd)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>감지 건수</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <Text
              style={{ fontSize: 18, fontWeight: '800', color: '#0f172b', letterSpacing: -0.5 }}
            >
              {onchain.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>온체인</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#94a3b8' }}>+</Text>
            <Text
              style={{ fontSize: 18, fontWeight: '800', color: '#0284c7', letterSpacing: -0.5 }}
            >
              {cexCount}
            </Text>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>거래소</Text>
          </View>
        </View>
      </View>

      {total > 0 && (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#ef4444' }}>
              매도 압력 {sellPct}%
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#22c55e' }}>
              {buyPct}% 매수 압력
            </Text>
          </View>
          <View
            style={{
              height: 7,
              borderRadius: 4,
              backgroundColor: '#f1f5f9',
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            <View style={{ width: `${sellPct}%`, backgroundColor: '#ef4444', borderRadius: 4 }} />
            <View style={{ width: 2, backgroundColor: 'white' }} />
            <View style={{ flex: 1, backgroundColor: '#22c55e', borderRadius: 4 }} />
          </View>
        </View>
      )}
    </View>
  );
}

function SourceFilterTab({
  value,
  onChange,
}: {
  value: SourceFilter;
  onChange: (v: SourceFilter) => void;
}) {
  const tabs: { label: string; value: SourceFilter }[] = [
    { label: '전체', value: 'ALL' },
    { label: '온체인', value: 'ONCHAIN' },
    { label: '거래소', value: 'CEX' },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {tabs.map(tab => {
        const active = value === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: active ? '#0f172b' : '#f1f5f9',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: active ? 'white' : '#64748b',
                letterSpacing: -0.2,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HistoryScreen() {
  const { toSettings } = useAppNavigation();
  const isPro = useSubscriptionStore(s => s.isPro);
  const [selectedChain, setSelectedChain] = useState<ChainFilter>('ALL');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');

  const { data: allEvents, isLoading } = useUnifiedActivity(selectedChain);

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  const filteredEvents = useMemo(() => {
    if (sourceFilter === 'ALL') {
      return allEvents;
    }
    if (sourceFilter === 'ONCHAIN') {
      return allEvents.filter(e => e.source === 'onchain');
    }
    return allEvents.filter(e => e.source === 'cex');
  }, [allEvents, sourceFilter]);

  const processedEvents = useMemo<ProcessedEvent[]>(() => {
    let onchainCount = 0;
    let cexCount = 0;
    return filteredEvents.map(event => {
      if (event.source === 'onchain') {
        onchainCount++;
        return { event, isLocked: !isPro && onchainCount > FREE_ONCHAIN_LIMIT };
      }
      cexCount++;
      return { event, isLocked: !isPro && cexCount > FREE_CEX_LIMIT };
    });
  }, [filteredEvents, isPro]);

  const renderItem = useCallback(
    ({ item, index }: { item: ProcessedEvent; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 40, 400))
          .duration(260)
          .easing(EASE_OUT)}
        style={{ paddingHorizontal: 20 }}
      >
        <UnifiedActivityItem
          event={item.event}
          isLocked={item.isLocked}
          onUpgrade={handleUpgrade}
        />
      </Animated.View>
    ),
    [handleUpgrade],
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'white' }}
        edges={['top']}
      >
        <View style={{ gap: 10, padding: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              style={{ height: 128, borderRadius: 16, backgroundColor: '#f1f5f9' }}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['top']}
    >
      <AnimatedFlatList
        data={processedEvents}
        keyExtractor={item => item.event.id}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', letterSpacing: -0.5 }}
                >
                  고래 이동 레이더
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View
                    style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22c55e' }}
                  />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#22c55e' }}>
                    실시간 감지 중
                  </Text>
                </View>
              </View>

              <RadarViewport />

              <View style={{ marginTop: 20 }}>
                <SentimentGauge events={allEvents} />
              </View>
            </View>

            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: 'white',
                gap: 10,
              }}
            >
              <SourceFilterTab
                value={sourceFilter}
                onChange={setSourceFilter}
              />
              <ChainFilterBar
                value={selectedChain}
                onChange={setSelectedChain}
              />
            </View>
          </>
        }
        ListFooterComponent={
          processedEvents.length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 20 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#22c55e' }}>
                실시간 감지 중
              </Text>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                · {processedEvents.length}건 발견
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ minHeight: 320, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Text style={{ fontSize: 32 }}>🔍</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>
              감지된 활동 없음
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 }}>
              {'고래 이동 및 거래소 대량 체결이\n감지되면 바로 표시됩니다.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
