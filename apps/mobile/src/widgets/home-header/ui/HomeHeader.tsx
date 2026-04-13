import { useSubscriptionStore } from '@entities/subscription';
import type { ChainFilter, WhaleProfile } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { ChainFilterBar, StreakBadge } from '@shared/ui';
import { AquariumSection } from '@widgets/aquarium-section';
import { BriefingCard } from '@widgets/briefing-card';
import React from 'react';
import { Text, View } from 'react-native';

interface HomeHeaderProps {
  streakCount: number;
  selectedChain: ChainFilter;
  onChainChange: (chain: ChainFilter) => void;
  movements?: WhaleTx[];
  whales?: WhaleProfile[];
  onWhalePress?: (id: string) => void;
}

export function HomeHeader({
  streakCount,
  selectedChain,
  onChainChange,
  movements,
  whales,
  onWhalePress,
}: HomeHeaderProps) {
  const isPro = useSubscriptionStore(s => s.isPro);

  return (
    <View style={{ paddingTop: 20, paddingBottom: 16, gap: 20 }}>
      <BriefingCard movements={movements} />

      {whales && whales.length > 0 && onWhalePress && (
        <AquariumSection
          whales={whales}
          onWhalePress={onWhalePress}
        />
      )}

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

      <ChainFilterBar
        value={selectedChain}
        onChange={onChainChange}
      />
    </View>
  );
}
