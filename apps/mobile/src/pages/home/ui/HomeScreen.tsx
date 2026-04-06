import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import type { WhaleProfile } from '@entities/whale';
import { useWhaleFeed } from '@features/whale-feed';
import { useAppNavigation } from '@shared/lib/navigation';
import { ChainFilterBar, Skeleton } from '@shared/ui';
import { WhaleCard } from '@widgets/whale-card';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function ItemSeparator() {
  return <View style={{ height: 12 }} />;
}

function SkeletonList() {
  return (
    <View style={{ gap: 12, paddingHorizontal: 20 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={148}
          borderRadius={20}
        />
      ))}
    </View>
  );
}

export function HomeScreen() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const selectedChain = useAppSettingsStore(s => s.selectedChain);
  const setSelectedChain = useAppSettingsStore(s => s.setSelectedChain);
  const { data: whales, isLoading } = useWhaleFeed();
  const { toWhaleDetail, toSettings } = useAppNavigation();

  const filteredWhales = useMemo(() => {
    if (!whales) {
      return [];
    }
    if (selectedChain === 'ALL') {
      return whales;
    }
    return whales.filter(w => w.chain === selectedChain);
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

  const keyExtractor = useCallback((item: WhaleProfile) => item.id, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {isLoading ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={filteredWhales}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ paddingTop: 20, paddingBottom: 16, gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: '800',
                    color: '#0f172b',
                    letterSpacing: -0.04,
                  }}
                >
                  고래 목록
                </Text>
                {!isPro && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '400',
                      color: '#94a3b8',
                      letterSpacing: -0.01,
                    }}
                  >
                    무료 플랜 · 3개 고래 제공 중
                  </Text>
                )}
              </View>
              <ChainFilterBar
                value={selectedChain}
                onChange={setSelectedChain}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
