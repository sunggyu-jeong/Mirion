import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import type { ChainFilter, WhaleProfile } from '@entities/whale';
import { useDailyBriefing } from '@features/daily-briefing';
import { useStreakTracker } from '@features/streak-tracker';
import { useWhaleFeed } from '@features/whale-feed';
import { useWhaleMovements } from '@features/whale-movements';
import { useAppNavigation } from '@shared/lib/navigation';
import { ChainFilterBar, Skeleton, StreakBadge } from '@shared/ui';
import { DailySummaryCard } from '@widgets/daily-summary';
import { WhaleCard } from '@widgets/whale-card';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function ItemSeparator() {
  return <View style={{ height: 12 }} />;
}

function SkeletonCard({ offset = 0 }: { offset?: number }) {
  const d = (n: number) => offset + n;
  return (
    <View style={{ backgroundColor: '#F2F4F6', borderRadius: 20, padding: 18, gap: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton
          width={44}
          height={44}
          borderRadius={13}
          delay={d(0)}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton
            width="52%"
            height={12}
            borderRadius={6}
            delay={d(40)}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Skeleton
              width="30%"
              height={9}
              borderRadius={4}
              delay={d(70)}
            />
            <Skeleton
              width={38}
              height={15}
              borderRadius={7}
              delay={d(85)}
            />
          </View>
        </View>
        <Skeleton
          width={18}
          height={18}
          borderRadius={9}
          delay={d(55)}
        />
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 7 }}>
          <Skeleton
            width={38}
            height={9}
            borderRadius={4}
            delay={d(90)}
          />
          <Skeleton
            width={108}
            height={15}
            borderRadius={6}
            delay={d(110)}
          />
        </View>
        <Skeleton
          width={64}
          height={26}
          borderRadius={13}
          delay={d(100)}
        />
      </View>
      <Skeleton
        width="62%"
        height={9}
        borderRadius={4}
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
            width={116}
            height={20}
            borderRadius={7}
            delay={0}
          />
          <Skeleton
            width={148}
            height={10}
            borderRadius={5}
            delay={40}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {[60, 44, 44, 44, 44].map((w, i) => (
            <Skeleton
              key={i}
              width={w}
              height={28}
              borderRadius={14}
              delay={i * 25}
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

function EmptyFiltered({ chain, onReset }: { chain: ChainFilter; onReset: () => void }) {
  const scale = useSharedValue(0.82);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, [scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
      <Animated.View style={[{ alignItems: 'center', gap: 20 }, animStyle]}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 26,
            backgroundColor: '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 42 }}>🔍</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: '#0f172b',
              letterSpacing: -0.3,
              textAlign: 'center',
            }}
          >
            {chain} 체인 고래 없음
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 21,
              letterSpacing: -0.01,
            }}
          >
            {`${chain} 체인에 등록된 고래가 없습니다\n다른 체인을 선택해 보세요`}
          </Text>
        </View>
        <Pressable
          onPress={onReset}
          style={{
            paddingHorizontal: 22,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: '#eff6ff',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2b7fff' }}>전체 보기</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const scale = useSharedValue(0.82);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, [scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
    >
      <Animated.View style={[{ alignItems: 'center', gap: 24 }, animStyle]}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 30,
            backgroundColor: '#fff1f2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 48 }}>🌐</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: '#0f172b',
              letterSpacing: -0.4,
              textAlign: 'center',
            }}
          >
            데이터를 불러오지 못했습니다
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 21,
              letterSpacing: -0.01,
            }}
          >
            {'네트워크 연결을 확인하거나\n잠시 후 다시 시도해 주세요'}
          </Text>
        </View>
        <Pressable
          onPress={onRetry}
          style={{
            paddingHorizontal: 28,
            paddingVertical: 13,
            borderRadius: 14,
            backgroundColor: '#2b7fff',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: 'white', letterSpacing: -0.02 }}>
            다시 시도
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function HomeScreen() {
  const isPro = useSubscriptionStore(s => s.isPro);
  const selectedChain = useAppSettingsStore(s => s.selectedChain);
  const setSelectedChain = useAppSettingsStore(s => s.setSelectedChain);
  const { data: whales, isLoading, isError, refetch } = useWhaleFeed();
  const { data: movements } = useWhaleMovements();
  const { toWhaleDetail, toSettings } = useAppNavigation();
  const streakCount = useStreakTracker();

  useDailyBriefing(movements);

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

  const handleResetFilter = useCallback(() => setSelectedChain('ALL'), [setSelectedChain]);

  const listHeader = (
    <View style={{ paddingTop: 20, paddingBottom: 16, gap: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', letterSpacing: -0.04 }}>
            고래 목록
          </Text>
          {!isPro && (
            <Text
              style={{ fontSize: 13, fontWeight: '400', color: '#94a3b8', letterSpacing: -0.01 }}
            >
              무료 플랜 · 3개 고래 제공 중
            </Text>
          )}
        </View>
        <StreakBadge count={streakCount} />
      </View>
      <DailySummaryCard movements={movements} />
      <ChainFilterBar
        value={selectedChain}
        onChange={setSelectedChain}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <SkeletonList />
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <FlatList
        data={filteredWhales}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyFiltered
            chain={selectedChain}
            onReset={handleResetFilter}
          />
        }
      />
    </SafeAreaView>
  );
}
