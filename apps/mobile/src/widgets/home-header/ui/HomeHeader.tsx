import { useSubscriptionStore } from '@entities/subscription';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { formatRelativeTime, formatUsd } from '@shared/lib/format';
import { ChainFilterBar } from '@shared/ui';
import { BriefingCard } from '@widgets/briefing-card';
import { ArrowDownLeft, ArrowUpRight, Lock, RefreshCw, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const TX_CONFIG = {
  send: { label: '이동', Icon: ArrowUpRight, color: '#fb2c36', bg: '#fff1f2' },
  receive: { label: '유입', Icon: ArrowDownLeft, color: '#22c55e', bg: '#f0fdf4' },
  swap: { label: '스왑', Icon: RefreshCw, color: '#f97316', bg: '#fff7ed' },
} as const;

interface LatestMoveCardProps {
  tx: WhaleTx;
}

function LatestMoveCard({ tx }: LatestMoveCardProps) {
  const cfg = TX_CONFIG[tx.type];
  const { Icon } = cfg;

  return (
    <View
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: cfg.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          size={18}
          color={cfg.color}
          strokeWidth={2.2}
        />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#2b7fff', letterSpacing: 0.2 }}>
            방금 감지됨
          </Text>
          <Text style={{ fontSize: 11, color: '#cbd5e1' }}>·</Text>
          <Text style={{ fontSize: 11, color: '#94a3b8' }}>
            {formatRelativeTime(tx.timestampMs)}
          </Text>
        </View>
        <Text
          style={{ fontSize: 15, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}
          numberOfLines={1}
        >
          {tx.asset} {cfg.label} {formatUsd(tx.amountUsd)}
        </Text>
      </View>
    </View>
  );
}

interface HomeHeaderProps {
  selectedChain: ChainFilter;
  onChainChange: (chain: ChainFilter) => void;
  movements?: WhaleTx[];
  onUpgrade?: () => void;
}

export function HomeHeader({
  selectedChain,
  onChainChange,
  movements,
  onUpgrade,
}: HomeHeaderProps) {
  const isPro = useSubscriptionStore(s => s.isPro);
  const latestTx = movements?.[0];

  return (
    <View style={{ paddingTop: 20, paddingBottom: 16, gap: 16 }}>
      <BriefingCard movements={movements} />

      {latestTx && <LatestMoveCard tx={latestTx} />}

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
