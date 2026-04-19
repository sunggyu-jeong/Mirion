import { useSubscriptionStore } from '@entities/subscription';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { useWhaleMovements } from '@features/whale-movements';
import { ChainFilterBar } from '@shared/ui';
import React, { useCallback, useMemo } from 'react';
import { SectionList, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { RadarPulse, WhaleMovementItem } from './WhaleMovementItem';

type MovementRow = { tx: WhaleTx; locked: boolean };
type MovementSection = { title: string; data: MovementRow[] };

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList<MovementRow, MovementSection>,
);
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const FREE_LIMIT = 3;
const TEASER_COUNT = 2;

function ItemSeparator() {
  return <View style={{ height: 10 }} />;
}

type Props = {
  chainFilter: ChainFilter;
  onChainChange: (chain: ChainFilter) => void;
  onUpgrade: () => void;
  headerTitle?: React.ReactNode;
};

export function WhaleMovementList({
  chainFilter = 'ALL',
  onChainChange,
  onUpgrade,
  headerTitle,
}: Props) {
  const isPro = useSubscriptionStore(s => s.isPro);
  const { data: movements, isLoading } = useWhaleMovements(chainFilter);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (scrollY.value - 40) / 30));
    const shadowOpacity = t * 0.07;
    const borderBottomAlpha = t * 0.5;

    return {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity,
      shadowRadius: 6,
      elevation: shadowOpacity > 0 ? 3 : 0,
      borderBottomWidth: 1,
      borderBottomColor: `rgba(226, 232, 240, ${borderBottomAlpha})`,
      zIndex: 1000,
    };
  });

  const sections = useMemo(() => {
    if (!movements) {
      return [];
    }

    let data: MovementRow[] = [];
    if (isPro) {
      data = movements.map(tx => ({ tx, locked: false }));
    } else {
      const free = movements.slice(0, FREE_LIMIT).map(tx => ({ tx, locked: false }));
      const teasers = movements
        .slice(FREE_LIMIT, FREE_LIMIT + TEASER_COUNT)
        .map(tx => ({ tx, locked: true }));
      data = [...free, ...teasers];
    }

    return [{ title: 'Main', data }];
  }, [movements, isPro]);

  const renderItem = useCallback(
    ({ item, index }: { item: MovementRow; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 40, 400))
          .duration(260)
          .easing(EASE_OUT)}
        style={{ paddingHorizontal: 20 }}
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

  if (isLoading) {
    return (
      <View style={{ gap: 10, paddingHorizontal: 20, paddingTop: 20 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={{ backgroundColor: '#F2F4F6', height: 120, borderRadius: 16 }}
          />
        ))}
      </View>
    );
  }

  const isEmpty = !movements || movements.length === 0;

  return (
    <AnimatedSectionList
      sections={sections}
      keyExtractor={item => item.tx.txHash}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      stickySectionHeadersEnabled={true}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'white' }}>
          {headerTitle}
        </View>
      }
      ListEmptyComponent={
        <View
          style={{
            minHeight: 400,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 32 }}>🔍</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>
            최근 7일간 감지된 이동 없음
          </Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 }}>
            고래들이 최근 활동하지 않았습니다.{'\n'}새로운 이동이 감지되면 바로 표시됩니다.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <RadarPulse />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#22c55e' }}>
              실시간 감지 중
            </Text>
          </View>
        </View>
      }
      renderSectionFooter={() => {
        if (isEmpty) {
          return (
            <View
              style={{
                minHeight: 400,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 32 }}>🔍</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172b' }}>
                최근 7일간 감지된 이동 없음
              </Text>
              <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 }}>
                고래들이 최근 활동하지 않았습니다.{'\n'}새로운 이동이 감지되면 바로 표시됩니다.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <RadarPulse />
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#22c55e' }}>
                  실시간 감지 중
                </Text>
              </View>
            </View>
          );
        }
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20 }}>
            <RadarPulse />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#22c55e' }}>
              실시간 감지 중
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8' }}>
              · {movements!.length}건 발견
            </Text>
          </View>
        );
      }}
      renderSectionHeader={() => (
        <Animated.View
          style={[
            { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white' },
            stickyHeaderStyle,
          ]}
        >
          <ChainFilterBar
            value={chainFilter}
            onChange={onChainChange}
          />
        </Animated.View>
      )}
    />
  );
}
