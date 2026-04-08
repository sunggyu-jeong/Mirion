import { useSubscriptionStore } from '@entities/subscription';
import type { WhaleTx } from '@entities/whale-tx';
import { useWhaleMovements } from '@features/whale-movements';
import { PaywallOverlay, Skeleton } from '@shared/ui';
import React, { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { RadarPulse, WhaleMovementItem } from './WhaleMovementItem';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const FREE_LIMIT = 3;

function ItemSeparator() {
  return <View style={{ height: 10 }} />;
}

type SkeletonCardProps = { offset?: number };

function SkeletonCard({ offset = 0 }: SkeletonCardProps) {
  const d = (n: number) => offset + n;
  return (
    <View style={{ backgroundColor: '#F2F4F6', borderRadius: 16, padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <Skeleton
          width={40}
          height={40}
          borderRadius={12}
          delay={d(0)}
        />
        <View style={{ flex: 1, gap: 7 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Skeleton
              width="36%"
              height={10}
              borderRadius={5}
              delay={d(40)}
            />
            <Skeleton
              width="18%"
              height={9}
              borderRadius={4}
              delay={d(50)}
            />
          </View>
          <Skeleton
            width="44%"
            height={11}
            borderRadius={5}
            delay={d(70)}
          />
          <Skeleton
            width="34%"
            height={9}
            borderRadius={4}
            delay={d(90)}
          />
        </View>
      </View>
      <Skeleton
        width="100%"
        height={30}
        borderRadius={8}
        delay={d(110)}
      />
      <Skeleton
        width="100%"
        height={34}
        borderRadius={10}
        delay={d(130)}
      />
    </View>
  );
}

function SkeletonList() {
  return (
    <View style={{ gap: 10, paddingHorizontal: 20 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard
          key={i}
          offset={i * 60}
        />
      ))}
    </View>
  );
}

type Props = {
  onUpgrade: () => void;
};

export function WhaleMovementList({ onUpgrade }: Props) {
  const isPro = useSubscriptionStore(s => s.isPro);
  const { data: movements, isLoading } = useWhaleMovements();

  const visibleMovements = isPro ? movements : movements?.slice(0, FREE_LIMIT);
  const lockedCount = movements ? movements.length - FREE_LIMIT : 0;

  const renderItem = useCallback(
    ({ item, index }: { item: WhaleTx; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 60)
          .duration(260)
          .easing(EASE_OUT)}
      >
        <WhaleMovementItem item={item} />
      </Animated.View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: WhaleTx) => item.txHash, []);

  if (isLoading) {
    return <SkeletonList />;
  }

  if (!visibleMovements || visibleMovements.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#62748e', textAlign: 'center' }}>
          감지된 이동이 없습니다
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visibleMovements}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }}>
          <RadarPulse />
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#22c55e' }}>실시간 감지 중</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8' }}>
            · {movements?.length ?? 0}건 발견
          </Text>
        </View>
      }
      ListFooterComponent={
        !isPro && lockedCount > 0 ? (
          <View style={{ position: 'relative', height: 140, marginTop: 12 }}>
            <View style={{ opacity: 0.12, gap: 12 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: '#f8fafc', borderRadius: 16, height: 56 }}
                />
              ))}
            </View>
            <PaywallOverlay
              visible
              message={`${lockedCount}건의 이체 내역이 더 있습니다`}
              onUpgrade={onUpgrade}
            />
          </View>
        ) : null
      }
    />
  );
}
