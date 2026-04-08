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

function SkeletonCard({ offset = 0 }: { offset?: number }) {
  const d = (n: number) => offset + n;
  return (
    <View
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 18,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 7 }}>
          <Skeleton
            width="42%"
            height={14}
            borderRadius={7}
            delay={d(0)}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Skeleton
              width="28%"
              height={11}
              borderRadius={5}
              delay={d(50)}
            />
            <Skeleton
              width={36}
              height={16}
              borderRadius={4}
              delay={d(70)}
            />
          </View>
        </View>
        <Skeleton
          width={20}
          height={20}
          borderRadius={10}
          delay={d(40)}
        />
      </View>

      <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />

      <View
        style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}
      >
        <View style={{ gap: 6 }}>
          <Skeleton
            width={44}
            height={11}
            borderRadius={5}
            delay={d(90)}
          />
          <Skeleton
            width={110}
            height={20}
            borderRadius={7}
            delay={d(110)}
          />
        </View>
        <Skeleton
          width={62}
          height={28}
          borderRadius={10}
          delay={d(100)}
        />
      </View>

      <Skeleton
        width="68%"
        height={11}
        borderRadius={5}
        delay={d(130)}
      />
    </View>
  );
}

function SkeletonList() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={{ paddingTop: 20, paddingBottom: 16, gap: 12 }}>
        <View style={{ gap: 8 }}>
          <Skeleton
            width={120}
            height={22}
            borderRadius={8}
            delay={0}
          />
          <Skeleton
            width={160}
            height={12}
            borderRadius={5}
            delay={40}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton
              key={i}
              width={52}
              height={30}
              borderRadius={15}
              delay={i * 30}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard
            key={i}
            offset={i * 70}
          />
        ))}
      </View>
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
