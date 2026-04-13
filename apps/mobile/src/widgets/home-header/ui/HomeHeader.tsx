import { useSubscriptionStore } from '@entities/subscription';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { ChainFilterBar } from '@shared/ui';
import { BriefingCard } from '@widgets/briefing-card';
import { StreakCard } from '@widgets/streak-card';
import { Lock, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface HomeHeaderProps {
  streakCount: number;
  selectedChain: ChainFilter;
  onChainChange: (chain: ChainFilter) => void;
  movements?: WhaleTx[];
  onUpgrade?: () => void;
}

export function HomeHeader({
  streakCount,
  selectedChain,
  onChainChange,
  movements,
  onUpgrade,
}: HomeHeaderProps) {
  const isPro = useSubscriptionStore(s => s.isPro);

  return (
    <View style={{ paddingTop: 20, paddingBottom: 16, gap: 24 }}>
      <BriefingCard movements={movements} />

      <StreakCard count={streakCount} />

      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172b', letterSpacing: -0.5 }}>
          고래 목록
        </Text>

        {!isPro && (
          <Pressable
            onPress={onUpgrade}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: pressed ? '#eff6ff' : '#f8fafc',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 11,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Lock
                size={13}
                color="#94a3b8"
                strokeWidth={2.2}
              />
              <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '500' }}>
                무료 플랜 · 3개 고래 제공 중
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap
                size={12}
                color="#2b7fff"
                strokeWidth={2.5}
                fill="#2b7fff"
              />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2b7fff' }}>
                PRO 업그레이드
              </Text>
            </View>
          </Pressable>
        )}

        <ChainFilterBar
          value={selectedChain}
          onChange={onChainChange}
        />
      </View>
    </View>
  );
}
