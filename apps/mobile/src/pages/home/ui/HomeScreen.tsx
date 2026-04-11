import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import type { WhaleProfile } from '@entities/whale';
import { useCexTrades } from '@features/cex-trades';
import { useDailyBriefing } from '@features/daily-briefing';
import { useStreakTracker } from '@features/streak-tracker';
import { useWhaleFeed } from '@features/whale-feed';
import { useWhaleMovements } from '@features/whale-movements';
import { useAppNavigation } from '@shared/lib/navigation';
import { CexWhaleFeed } from '@widgets/cex-whale-feed';
import { HomeHeader } from '@widgets/home-header';
import { WhaleCard } from '@widgets/whale-card';
import React, { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyFiltered, ErrorState, SkeletonList } from './HomeStates';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const CEX_PREVIEW_COUNT = 5;

export function HomeScreen() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const selectedChain = useAppSettingsStore(s => s.selectedChain);
  const setSelectedChain = useAppSettingsStore(s => s.setSelectedChain);
  const { data: whales, isLoading, isError, refetch } = useWhaleFeed();
  const { data: movements } = useWhaleMovements();
  const { data: cexTrades } = useCexTrades();
  const { toWhaleDetail, toSettings } = useAppNavigation();
  const streakCount = useStreakTracker();

  useDailyBriefing(movements);

  const filteredWhales = useMemo(() => {
    if (!whales) {
      return [];
    }
    return selectedChain === 'ALL' ? whales : whales.filter(w => w.chain === selectedChain);
  }, [whales, selectedChain]);

  const recentCexTrades = useMemo(() => cexTrades?.slice(0, CEX_PREVIEW_COUNT) ?? [], [cexTrades]);

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

  if (isLoading) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: 'white' }}
      >
        <SkeletonList />
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: 'white' }}
      >
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <FlatList
        data={filteredWhales}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HomeHeader
              streakCount={streakCount}
              selectedChain={selectedChain}
              onChainChange={setSelectedChain}
              movements={movements}
            />
            {recentCexTrades.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <CexWhaleFeed trades={recentCexTrades} />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <EmptyFiltered
            chain={selectedChain}
            onReset={() => setSelectedChain('ALL')}
          />
        }
      />
    </SafeAreaView>
  );
}
