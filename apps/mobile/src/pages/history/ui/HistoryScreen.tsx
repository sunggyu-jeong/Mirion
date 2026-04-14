import { useSubscriptionStore } from '@entities/subscription';
import type { ActivityEvent } from '@entities/unified-activity';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { useUnifiedActivity } from '@features/unified-feed';
import { formatUsd } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import { ChainFilterBar, FilterChipBar } from '@shared/ui';
import type { ChipOption } from '@shared/ui/FilterChipBar';
import { RadarDotLayer } from '@widgets/radar-dot-layer';
import { RadarViewport } from '@widgets/radar-viewport';
import { UnifiedActivityItem } from '@widgets/unified-activity';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type SourceFilter = 'ALL' | 'ONCHAIN' | 'CEX';
type AmountFilter = 'ALL' | '100K' | '500K' | '1M' | '5M';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const FREE_ONCHAIN_LIMIT = 3;
const FREE_CEX_LIMIT = 3;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ProcessedEvent>);

type ProcessedEvent = { event: ActivityEvent; isLocked: boolean };

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
    <View style={{ marginTop: 20, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ gap: 3 }}>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
            온체인 이동량
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
            {formatUsd(totalUsd)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
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
              style={{ fontSize: 20, fontWeight: '800', color: '#38bdf8', letterSpacing: -0.5 }}
            >
              {cexCount}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>거래소</Text>
          </View>
        </View>
      </View>

      {total > 0 && (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#fb2c36' }}>
              매도 압력 {sellPct}%
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#22c55e' }}>
              {buyPct}% 매수 압력
            </Text>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.08)',
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            <View style={{ width: `${sellPct}%`, backgroundColor: '#fb2c36', borderRadius: 3 }} />
            <View style={{ width: 2, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <View style={{ flex: 1, backgroundColor: '#22c55e', borderRadius: 3 }} />
          </View>
        </View>
      )}
    </View>
  );
}

export function HistoryScreen() {
  const { toSettings } = useAppNavigation();
  const isPro = useSubscriptionStore(s => s.isPro);
  const [selectedChain, setSelectedChain] = useState<ChainFilter>('ALL');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('ALL');

  const { data: allEvents, isLoading } = useUnifiedActivity(selectedChain);

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  const onchainTxs = useMemo<WhaleTx[]>(
    () =>
      allEvents
        .filter((e): e is Extract<ActivityEvent, { source: 'onchain' }> => e.source === 'onchain')
        .map(e => e.data),
    [allEvents],
  );

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

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#060d1a' }}
        edges={['top']}
      >
        <View style={{ gap: 10, padding: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              style={{ height: 128, borderRadius: 16, backgroundColor: 'rgba(34,197,94,0.06)' }}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#060d1a' }}
      edges={['top']}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
            고래 이동 레이더
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22c55e' }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#22c55e' }}>
              실시간 감지 중
            </Text>
          </View>
        </View>

        <RadarViewport>
          <RadarDotLayer txs={onchainTxs} />
        </RadarViewport>

        <SentimentGauge events={allEvents} />
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: 'hidden',
          marginTop: 24,
        }}
      >
        <AnimatedFlatList
          data={processedEvents}
          keyExtractor={item => item.event.id}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10 }}>
              <FilterChipBar
                options={SOURCE_OPTIONS}
                value={sourceFilter}
                onChange={setSourceFilter}
              />
              <FilterChipBar
                options={AMOUNT_OPTIONS}
                value={amountFilter}
                onChange={setAmountFilter}
                activeColor="#0f172b"
              />
              <ChainFilterBar
                value={selectedChain}
                onChange={setSelectedChain}
              />
            </View>
          }
          ListFooterComponent={
            processedEvents.length > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 20 }}>
                <View
                  style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }}
                />
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
            <View
              style={{ minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 12 }}
            >
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
      </View>
    </SafeAreaView>
  );
}
