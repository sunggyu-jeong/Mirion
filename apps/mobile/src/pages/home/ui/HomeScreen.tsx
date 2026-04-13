import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import type { WhaleProfile } from '@entities/whale';
import { useDailyBriefing } from '@features/daily-briefing';
import { useStreakTracker } from '@features/streak-tracker';
import { useWhaleFeed } from '@features/whale-feed';
import { useWhaleMovements } from '@features/whale-movements';
import { useAppNavigation } from '@shared/lib/navigation';
import { HomeHeader } from '@widgets/home-header';
import { MirionHeader } from '@widgets/mirion-header';
import { WhaleCard } from '@widgets/whale-card';
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyFiltered, ErrorState, SkeletonList } from './HomeStates';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const HEADER_HEIGHT = 52;

export function HomeScreen() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const selectedChain = useAppSettingsStore(s => s.selectedChain);
  const setSelectedChain = useAppSettingsStore(s => s.setSelectedChain);
  const { data: whales, isLoading, isError, refetch } = useWhaleFeed();
  const { data: movements } = useWhaleMovements();
  const { toWhaleDetail, toSettings } = useAppNavigation();
  const streakCount = useStreakTracker();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useDailyBriefing(movements);

  const filteredWhales = useMemo(() => {
    if (!whales) {
      return [];
    }
    return selectedChain === 'ALL' ? whales : whales.filter(w => w.chain === selectedChain);
  }, [whales, selectedChain]);

  const renderItem = useCallback(
    ({ item, index }: { item: WhaleProfile; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 60)
          .duration(260)
          .easing(EASE_OUT)}
      >
        <WhaleCard
          whale={item}
          isPro={isPro}
          onPress={toWhaleDetail}
          onUpgrade={toSettings}
        />
      </Animated.View>
    ),
    [isPro, toWhaleDetail, toSettings],
  );

  const headerTopPadding = insets.top + HEADER_HEIGHT;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <MirionHeader scrollY={scrollY} />
        <View style={{ flex: 1, paddingTop: headerTopPadding }}>
          <SkeletonList />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <MirionHeader scrollY={scrollY} />
        <View style={{ flex: 1, paddingTop: headerTopPadding }}>
          <ErrorState onRetry={refetch} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <MirionHeader scrollY={scrollY} />
      <Animated.FlatList
        data={filteredWhales}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{
          paddingTop: headerTopPadding + 8,
          paddingHorizontal: 20,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <HomeHeader
            streakCount={streakCount}
            selectedChain={selectedChain}
            onChainChange={setSelectedChain}
            movements={movements}
            whales={whales}
            onWhalePress={toWhaleDetail}
          />
        }
        ListEmptyComponent={
          <EmptyFiltered
            chain={selectedChain}
            onReset={() => setSelectedChain('ALL')}
          />
        }
      />
    </View>
  );
}
