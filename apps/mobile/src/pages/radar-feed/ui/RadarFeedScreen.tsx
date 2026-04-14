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
  return <View style={{ height: 16 }} />;
}

function LiveSummaryHeader({ events }: { events: ActivityEvent[] }) {
  const summary = useMemo(() => {
    if (events.length === 0) return '감지된 활동이 없어요';
    
    const ethTxs = events.filter(e => 
      e.source === 'onchain' && (e.data as WhaleTx).asset === 'ETH'
    ).length;
    const btcTxs = events.filter(e => 
      e.source === 'onchain' && (e.data as WhaleTx).asset === 'BTC'
    ).length;
    const cexBuys = events.filter(e => 
      e.source === 'cex' && (e.data as { side: string }).side === 'buy'
    ).length;

    if (ethTxs > btcTxs && ethTxs > 2) return '지금 이더리움 고래들이 아주 바빠요 🐋';
    if (btcTxs > ethTxs && btcTxs > 2) return '비트코인에서 큰 움직임이 포착됐어요 💰';
    if (cexBuys > 5) return '거래소에서 매수세가 강하게 들어오고 있어요 🚀';
    
    return '시장에 새로운 큰 움직임들이 올라오고 있어요';
  }, [events]);

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: 'white', lineHeight: 34, letterSpacing: -0.8 }}>
        {summary}
      </Text>
    </View>
  );
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
      if (sourceFilter === 'ONCHAIN' && e.source !== 'onchain') return false;
      if (sourceFilter === 'CEX' && e.source !== 'cex') return false;
      if (threshold > 0) {
        const usd = e.source === 'onchain' 
          ? (e.data as WhaleTx).amountUsd 
          : ((e.data as { valueUsd: number }).valueUsd ?? 0);
        if (usd < threshold) return false;
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
        entering={FadeInDown.delay(Math.min(index * 50, 400))
          .duration(300)
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
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Pressable
          onPress={goBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={10}
        >
          <ChevronLeft size={22} color="white" strokeWidth={2.5} />
        </Pressable>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={processedEvents}
        keyExtractor={item => item.event.id}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <LiveSummaryHeader events={allEvents} />
            <View style={{ paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
              <FilterChipBar
                options={SOURCE_OPTIONS}
                value={sourceFilter}
                onChange={setSourceFilter}
                activeColor="#06B6D4"
                dark
              />
              <ChainFilterBar
                value={selectedChain}
                onChange={setSelectedChain}
                dark
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Text style={{ fontSize: 48 }}>🔭</Text>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                아직 조용하네요
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 22 }}>
                {'고래들이 움직이기 시작하면\n여기에 가장 먼저 알려드릴게요.'}
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
