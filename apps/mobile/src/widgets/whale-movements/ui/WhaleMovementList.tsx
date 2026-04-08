import { useSubscriptionStore } from '@entities/subscription';
import type { WhaleTx } from '@entities/whale-tx';
import { useWhaleMovements } from '@features/whale-movements';
import { Skeleton } from '@shared/ui';
import React, { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { RadarPulse, WhaleMovementItem } from './WhaleMovementItem';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const FREE_LIMIT = 3;
const TEASER_COUNT = 2;

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

type ListItem = { tx: WhaleTx; locked: boolean };

export function WhaleMovementList({ onUpgrade }: Props) {
  const isPro = useSubscriptionStore(s => s.isPro);
  const { data: movements, isLoading } = useWhaleMovements();

  const listItems: ListItem[] = (() => {
    if (!movements) {
      return [];
    }
    if (isPro) {
      return movements.map(tx => ({ tx, locked: false }));
    }
    const free = movements.slice(0, FREE_LIMIT).map(tx => ({ tx, locked: false }));
    const teasers = movements
      .slice(FREE_LIMIT, FREE_LIMIT + TEASER_COUNT)
      .map(tx => ({ tx, locked: true }));
    return [...free, ...teasers];
  })();

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 60)
          .duration(260)
          .easing(EASE_OUT)}
      >
        <WhaleMovementItem
          item={item.tx}
          isLocked={item.locked}
          onUpgrade={onUpgrade}
        />
      </Animated.View>
    ),
    [onUpgrade],
  );

  const keyExtractor = useCallback((item: ListItem) => item.tx.txHash, []);

  if (isLoading) {
    return <SkeletonList />;
  }

  if (!listItems.length) {
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
      data={listItems}
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
    />
  );
}
