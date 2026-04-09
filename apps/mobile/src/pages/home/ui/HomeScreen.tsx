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
import { RefreshCcw, SearchX, WifiOff } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';
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
  return (
    <Animated.View
      entering={FadeIn.delay(60).duration(340).easing(EASE_OUT)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 72 }}
    >
      <View style={{ alignItems: 'center', gap: 28 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 26,
            backgroundColor: '#F2F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SearchX
            size={34}
            color="#B0B8C1"
            strokeWidth={1.5}
          />
        </View>

        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontSize: 19,
              fontWeight: '700',
              color: '#191F28',
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            {chain} 체인 고래가 없어요
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#8B95A1',
              textAlign: 'center',
              lineHeight: 21,
              letterSpacing: -0.01,
            }}
          >
            {'해당 체인에 등록된 고래가 없습니다\n다른 체인을 선택해 보세요'}
          </Text>
        </View>

        <Pressable
          onPress={onReset}
          style={{
            paddingHorizontal: 22,
            paddingVertical: 11,
            borderRadius: 12,
            backgroundColor: '#F2F4F6',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#3182F6', letterSpacing: -0.01 }}>
            전체 고래 보기
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(0).duration(380).easing(EASE_OUT)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 }}
    >
      <View style={{ alignItems: 'center', gap: 32 }}>
        {/* 아이콘 */}
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 28,
            backgroundColor: '#F2F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOff
            size={36}
            color="#B0B8C1"
            strokeWidth={1.5}
          />
        </View>

        {/* 텍스트 */}
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#191F28',
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            연결에 문제가 생겼어요
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#8B95A1',
              textAlign: 'center',
              lineHeight: 22,
              letterSpacing: -0.01,
            }}
          >
            {'네트워크 상태를 확인하고\n잠시 후 다시 시도해 주세요'}
          </Text>
        </View>

        {/* 버튼 */}
        <Pressable
          onPress={onRetry}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 22,
            paddingVertical: 13,
            borderRadius: 14,
            backgroundColor: '#F2F4F6',
          }}
        >
          <RefreshCcw
            size={15}
            color="#3182F6"
            strokeWidth={2.2}
          />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#3182F6', letterSpacing: -0.02 }}>
            다시 시도하기
          </Text>
        </Pressable>
      </View>
    </Animated.View>
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', letterSpacing: -0.04 }}>
            고래 목록
          </Text>
          {!isPro && (
            <Text style={{ fontSize: 13, color: '#94a3b8', letterSpacing: -0.01 }}>
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
