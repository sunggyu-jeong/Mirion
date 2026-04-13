import { useSubscriptionStore } from '@entities/subscription';
import type { ActivityEvent } from '@entities/unified-activity';
import type { ChainFilter } from '@entities/whale';
import { useUnifiedActivity } from '@features/unified-feed';
import { ChainFilterBar } from '@shared/ui';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { UnifiedActivityItem } from './UnifiedActivityItem';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ProcessedEvent>);
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const FREE_ONCHAIN_LIMIT = 3;

type ProcessedEvent = { event: ActivityEvent; isLocked: boolean };

type Props = {
  chainFilter: ChainFilter;
  onChainChange: (chain: ChainFilter) => void;
  onUpgrade: () => void;
  headerTitle?: React.ReactNode;
};

function ItemSeparator() {
  return <View style={{ height: 10 }} />;
}

export function UnifiedActivityList({ chainFilter, onChainChange, onUpgrade, headerTitle }: Props) {
  const isPro = useSubscriptionStore(s => s.isPro);
  const { data: events, isLoading } = useUnifiedActivity(chainFilter);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const filterBarStyle = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (scrollY.value - 40) / 30));
    return {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: t * 0.07,
      shadowRadius: 6,
      elevation: t > 0 ? 3 : 0,
      borderBottomWidth: 1,
      borderBottomColor: `rgba(226, 232, 240, ${t * 0.5})`,
      zIndex: 1000,
    };
  });

  const processedEvents = useMemo<ProcessedEvent[]>(() => {
    if (!events) {
      return [];
    }
    let onchainCount = 0;
    return events.map(event => {
      if (event.source === 'onchain') {
        onchainCount++;
        return { event, isLocked: !isPro && onchainCount > FREE_ONCHAIN_LIMIT };
      }
      return { event, isLocked: false };
    });
  }, [events, isPro]);

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
          onUpgrade={onUpgrade}
        />
      </Animated.View>
    ),
    [onUpgrade],
  );

  if (isLoading) {
    return (
      <View style={{ gap: 10, paddingHorizontal: 20, paddingTop: 20 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={{ height: 128, borderRadius: 16, backgroundColor: '#f1f5f9' }}
          />
        ))}
      </View>
    );
  }

  return (
    <AnimatedFlatList
      data={processedEvents}
      keyExtractor={item => item.event.id}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      stickyHeaderIndices={[1]}
      ListHeaderComponent={
        <>
          <View style={{ backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16 }}>
            {headerTitle}
          </View>
          <Animated.View
            style={[
              { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white' },
              filterBarStyle,
            ]}
          >
            <ChainFilterBar
              value={chainFilter}
              onChange={onChainChange}
            />
          </Animated.View>
        </>
      }
      ListFooterComponent={
        processedEvents.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20 }}>
            <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
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
        <View style={{ minHeight: 384, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 30 }}>🔍</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>
            감지된 활동 없음
          </Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 }}>
            {'고래 이동 및 거래소 대량 체결이\n감지되면 바로 표시됩니다.'}
          </Text>
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#22c55e' }}>
              실시간 감지 중
            </Text>
          </View>
        </View>
      }
    />
  );
}
