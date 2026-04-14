import { useSubscriptionStore } from '@entities/subscription';
import type { ActivityEvent } from '@entities/unified-activity';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { useUnifiedActivity } from '@features/unified-feed';
import { useAppNavigation } from '@shared/lib/navigation';
import { ChainFilterBar, FilterChipBar } from '@shared/ui';
import type { ChipOption } from '@shared/ui/FilterChipBar';
import { UnifiedActivityItem } from '@widgets/unified-activity';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type SourceFilter = 'ALL' | 'ONCHAIN' | 'CEX';
type AmountFilter = 'ALL' | '100K' | '500K' | '1M' | '5M';
type ProcessedEvent = { event: ActivityEvent; isLocked: boolean };

const FREE_ONCHAIN_LIMIT = 3;
const FREE_CEX_LIMIT = 3;
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const SOURCE_OPTIONS: ChipOption<SourceFilter>[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ONCHAIN', label: '온체인' },
  { value: 'CEX', label: '거래소' },
];

const AMOUNT_OPTIONS: ChipOption<AmountFilter>[] = [
  { value: 'ALL', label: '전체' },
  { value: '100K', label: '$100K+' },
  { value: '500K', label: '$500K+' },
  { value: '1M', label: '$1M+' },
  { value: '5M', label: '$5M+' },
];

const AMOUNT_THRESHOLD: Record<AmountFilter, number> = {
  ALL: 0,
  '100K': 100_000,
  '500K': 500_000,
  '1M': 1_000_000,
  '5M': 5_000_000,
};

function ItemSeparator() {
  return <View style={{ height: 10 }} />;
}

export function RadarFeedScreen() {
  const { goBack, toSettings } = useAppNavigation();
  const isPro = useSubscriptionStore(s => s.isPro);
  const [selectedChain, setSelectedChain] = useState<ChainFilter>('ALL');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('ALL');

  const { data: allEvents } = useUnifiedActivity(selectedChain);

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  const filteredEvents = useMemo(() => {
    const threshold = AMOUNT_THRESHOLD[amountFilter];
    return allEvents.filter(e => {
      if (sourceFilter === 'ONCHAIN' && e.source !== 'onchain') {
        return false;
      }
      if (sourceFilter === 'CEX' && e.source !== 'cex') {
        return false;
      }
      if (threshold > 0) {
        const usd =
          e.source === 'onchain'
            ? (e.data as WhaleTx).amountUsd
            : ((e.data as { usdValue: number }).usdValue ?? 0);
        if (usd < threshold) {
          return false;
        }
      }
      return true;
    });
  }, [allEvents, sourceFilter, amountFilter]);

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#020B18' }}
      edges={['top']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          gap: 8,
        }}
      >
        <Pressable
          onPress={goBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.07)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={8}
        >
          <ChevronLeft
            size={20}
            color="rgba(255,255,255,0.7)"
            strokeWidth={2}
          />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '800', color: 'white', letterSpacing: -0.4 }}>
          감지 피드
        </Text>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06B6D4' }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#06B6D4' }}>실시간</Text>
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={processedEvents}
        keyExtractor={item => item.event.id}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 10 }}>
            <FilterChipBar
              options={SOURCE_OPTIONS}
              value={sourceFilter}
              onChange={setSourceFilter}
              activeColor="#06B6D4"
              dark
            />
            <FilterChipBar
              options={AMOUNT_OPTIONS}
              value={amountFilter}
              onChange={setAmountFilter}
              activeColor="#0c3d5c"
              dark
            />
            <ChainFilterBar
              value={selectedChain}
              onChange={setSelectedChain}
              dark
            />
            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(6,182,212,0.12)',
                marginTop: 2,
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={{ minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Text style={{ fontSize: 32 }}>🔍</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
              감지된 활동 없음
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.35)',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {'고래 이동 및 거래소 대량 체결이\n감지되면 바로 표시됩니다.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          processedEvents.length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 20 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06B6D4' }} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#06B6D4' }}>
                실시간 감지 중
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                · {processedEvents.length}건 발견
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
