import type { CexTrade } from '@entities/cex-trade';
import type { ActivityEvent } from '@entities/unified-activity';
import type { WhaleTx } from '@entities/whale-tx';
import { formatRelativeTime } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Lock, RefreshCw } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

const ONCHAIN_TYPE_CONFIG = {
  send: {
    action: '보냈어요',
    Icon: ArrowUpRight,
    color: '#F43F5E',
    bg: 'rgba(244,63,94,0.12)',
    glow: 'rgba(244,63,94,0.3)',
  },
  receive: {
    action: '받았어요',
    Icon: ArrowDownLeft,
    color: '#22D3EE',
    bg: 'rgba(34,211,238,0.12)',
    glow: 'rgba(34,211,238,0.3)',
  },
  swap: {
    action: '바꿨어요',
    Icon: RefreshCw,
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.12)',
    glow: 'rgba(167,139,250,0.3)',
  },
} as const;

const COIN_NAME: Record<string, string> = {
  'BTC/USDT': '비트코인',
  'ETH/USDT': '이더리움',
  'SOL/USDT': '솔라나',
  'BNB/USDT': 'BNB',
  'XRP/USDT': '리플',
  'PEPE/USDT': '페페',
  'WIF/USDT': 'WIF',
  BTC: '비트코인',
  ETH: '이더리움',
  SOL: '솔라나',
  USDT: '테더',
  USDC: 'USDC',
};

function formatAmountKo(usd: number): string {
  if (usd >= 1_000_000_000) {
    return `${(usd / 1_000_000_000).toFixed(1)}B달러 (약 ${(usd * 0.0014).toFixed(0)}조원)`;
  }
  if (usd >= 1_000_000) {
    return `${(usd / 1_000_000).toFixed(1)}M달러 (약 ${((usd * 1350) / 100_000_000).toFixed(1)}억원)`;
  }
  if (usd >= 1_000) {
    return `${(usd / 1_000).toFixed(0)}K달러 (약 ${((usd * 1350) / 10_000).toFixed(0)}만원)`;
  }
  return `$${usd.toLocaleString()}`;
}

function OnChainItem({
  tx,
  isLocked,
  onUpgrade,
}: {
  tx: WhaleTx;
  isLocked: boolean;
  onUpgrade?: () => void;
}) {
  const config = ONCHAIN_TYPE_CONFIG[tx.type];
  const { Icon } = config;
  const { toTxDetail } = useAppNavigation();

  const handleViewDetail = useCallback(() => {
    toTxDetail({ ...tx, blockNumber: tx.blockNumber.toString() });
  }, [tx, toTxDetail]);

  const assetName = COIN_NAME[tx.asset] ?? tx.asset;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: config.bg,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <Icon
            size={22}
            color={config.color}
            strokeWidth={2.5}
          />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
              {formatRelativeTime(tx.timestampMs)}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(34,211,238,0.1)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: '#22D3EE', fontWeight: '700' }}>온체인</Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: 'white', letterSpacing: -0.4 }}>
            {assetName} {tx.amountNative.toLocaleString()}개를 {config.action}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: config.color }}>
            {isLocked ? '금액 잠금됨' : formatAmountKo(tx.amountUsd)}
          </Text>
        </View>
      </View>

      {!isLocked && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
            이동 경로
          </Text>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{ fontSize: 12, color: 'white', fontWeight: '600' }}
              numberOfLines={1}
            >
              지갑
            </Text>
            <ArrowRight
              size={10}
              color="rgba(255,255,255,0.2)"
            />
            <Text
              style={{ fontSize: 12, color: 'white', fontWeight: '600' }}
              numberOfLines={1}
            >
              거래소
            </Text>
          </View>
        </View>
      )}

      {isLocked ? (
        <Pressable
          onPress={onUpgrade}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: '#06B6D4',
          }}
        >
          <Lock
            size={14}
            color="white"
            strokeWidth={2.5}
          />
          <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>금액 확인하기</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleViewDetail}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
            상세 정보
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function CexItem({
  trade,
  isLocked,
  onUpgrade,
}: {
  trade: CexTrade;
  isLocked: boolean;
  onUpgrade?: () => void;
}) {
  const isBuy = trade.side === 'buy';
  const color = isBuy ? '#4ADE80' : '#FB923C';
  const bg = isBuy ? 'rgba(74,222,128,0.12)' : 'rgba(251,146,60,0.12)';
  const coinName = COIN_NAME[trade.symbol.split('/')[0]] ?? trade.symbol.split('/')[0];

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 24,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>{isBuy ? '🚀' : '🔥'}</Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
              {formatRelativeTime(trade.timestampMs)}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(167,139,250,0.1)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: '#A78BFA', fontWeight: '700' }}>거래소</Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: 'white', letterSpacing: -0.4 }}>
            {coinName} 대량 {isBuy ? '매수 발생' : '매도 발생'}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: color }}>
            {isLocked ? '금액 잠금됨' : formatAmountKo(trade.valueUsd)}
          </Text>
        </View>
      </View>

      {isLocked && (
        <Pressable
          onPress={onUpgrade}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: '#06B6D4',
          }}
        >
          <Lock
            size={14}
            color="white"
            strokeWidth={2.5}
          />
          <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>얼마인지 확인하기</Text>
        </Pressable>
      )}
    </View>
  );
}

interface Props {
  event: ActivityEvent;
  isLocked?: boolean;
  onUpgrade?: () => void;
}

export function UnifiedActivityItem({ event, isLocked = false, onUpgrade }: Props) {
  if (event.source === 'cex') {
    return (
      <CexItem
        trade={event.data}
        isLocked={isLocked}
        onUpgrade={onUpgrade}
      />
    );
  }
  return (
    <OnChainItem
      tx={event.data}
      isLocked={isLocked}
      onUpgrade={onUpgrade}
    />
  );
}
