import { useSubscriptionStore } from '@entities/subscription';
import type { ChainFilter } from '@entities/whale';
import type { WhaleTx } from '@entities/whale-tx';
import { formatRelativeTime } from '@shared/lib/format';
import { ChainFilterBar } from '@shared/ui';
import { BriefingCard } from '@widgets/briefing-card';
import { ArrowDownLeft, ArrowUpRight, Lock, RefreshCw, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const TX_CONFIG = {
  send: { label: '보냈어요', Icon: ArrowUpRight, color: '#F43F5E', bg: 'rgba(244,63,94,0.12)' },
  receive: { label: '받았어요', Icon: ArrowDownLeft, color: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
  swap: { label: '바꿨어요', Icon: RefreshCw, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
} as const;

const ASSET_NAME: Record<string, string> = {
  BTC: '비트코인',
  ETH: '이더리움',
  SOL: '솔라나',
  USDT: '테더',
};

function formatAmountKo(usd: number): string {
  if (usd >= 1_000_000) return `${(usd / 1_000_000).toFixed(1)}M달러 (약 ${(usd * 1350 / 100_000_000).toFixed(1)}억원)`;
  return `$${usd.toLocaleString()}`;
}

interface LatestMoveCardProps {
  tx: WhaleTx;
}

function LatestMoveCard({ tx }: LatestMoveCardProps) {
  const cfg = TX_CONFIG[tx.type];
  const { Icon } = cfg;
  const assetName = ASSET_NAME[tx.asset] ?? tx.asset;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: cfg.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          size={20}
          color={cfg.color}
          strokeWidth={2.5}
        />
      </View>

      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#06B6D4' }}>
            방금 감지됨
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>·</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {formatRelativeTime(tx.timestampMs)}
          </Text>
        </View>
        <Text
          style={{ fontSize: 16, fontWeight: '700', color: 'white', letterSpacing: -0.4 }}
          numberOfLines={1}
        >
          {assetName} {formatAmountKo(tx.amountUsd)} {cfg.label}
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
    <View style={{ paddingTop: 10, paddingBottom: 20, gap: 20 }}>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', letterSpacing: -0.8 }}>
          안녕하세요! 👋
        </Text>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: '500', letterSpacing: -0.3 }}>
          오늘 고래들의 움직임은 평온한 편이에요.
        </Text>
      </View>

      <BriefingCard movements={movements} />

      {latestTx && <LatestMoveCard tx={latestTx} />}

      <View style={{ gap: 16, marginTop: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
          함께 지켜볼 고래들
        </Text>

        {!isPro && (
          <Pressable
            onPress={onUpgrade}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.06)',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Lock
                size={14}
                color="rgba(255,255,255,0.4)"
                strokeWidth={2.2}
              />
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                PRO로 100개 이상의 고래 감지하기
              </Text>
            </View>
            <Zap
              size={14}
              color="#06B6D4"
              strokeWidth={2.5}
              fill="#06B6D4"
            />
          </Pressable>
        )}

        <ChainFilterBar
          value={selectedChain}
          onChange={onChainChange}
          dark
        />
      </View>
    </View>
  );
}
