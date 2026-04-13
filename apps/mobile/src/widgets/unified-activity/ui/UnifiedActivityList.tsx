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
  return <View className="h-2.5" />;
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
        className="px-5"
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
      <View className="gap-2.5 px-5 pt-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            className="h-32 rounded-2xl bg-slate-100"
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
          <View className="bg-white px-5 pt-4">{headerTitle}</View>
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
          <View className="flex-row items-center gap-2 p-5">
            <View className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <Text className="text-[12px] font-medium text-green-500">실시간 감지 중</Text>
            <Text className="text-[12px] text-slate-400">· {processedEvents.length}건 발견</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="min-h-96 items-center justify-center gap-3">
          <Text className="text-3xl">🔍</Text>
          <Text className="text-[15px] font-semibold text-[#0f172b]">감지된 활동 없음</Text>
          <Text className="text-center text-[13px] leading-5 text-slate-400">
            {'고래 이동 및 CEX 대량 체결이\n감지되면 바로 표시됩니다.'}
          </Text>
          <View className="mt-2 flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <Text className="text-[12px] font-medium text-green-500">실시간 감지 중</Text>
          </View>
        </View>
      }
    />
  );
}
