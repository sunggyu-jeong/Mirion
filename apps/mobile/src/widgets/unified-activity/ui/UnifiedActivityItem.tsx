import type { CexTrade } from '@entities/cex-trade';
import type { ActivityEvent } from '@entities/unified-activity';
import type { WhaleTx } from '@entities/whale-tx';
import { formatRelativeTime } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Lock, RefreshCw } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

const ONCHAIN_TYPE_CONFIG = {
  send: {
    action: '보냈어요',
    Icon: ArrowUpRight,
    color: '#F43F5E',
    bg: 'rgba(244,63,94,0.15)',
  },
  receive: {
    action: '받았어요',
    Icon: ArrowDownLeft,
    color: '#22D3EE',
    bg: 'rgba(34,211,238,0.15)',
  },
  swap: {
    action: '바꿨어요',
    Icon: RefreshCw,
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.15)',
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
    return `약 ${(usd * 0.0014).toFixed(0)}조원`;
  }
  if (usd >= 1_000_000) {
    return `약 ${((usd * 1350) / 100_000_000).toFixed(1)}억원`;
  }
  if (usd >= 1_000) {
    return `약 ${((usd * 1350) / 10_000).toFixed(0)}만원`;
  }
  return `$${usd.toLocaleString()}`;
}

function formatUsdShort(usd: number): string {
  if (usd >= 1_000_000_000) {
    return `$${(usd / 1_000_000_000).toFixed(1)}B`;
  }
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(1)}M`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(0)}K`;
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: config.bg,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            size={20}
            color={config.color}
            strokeWidth={2.5}
          />
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: 'white', letterSpacing: -0.3 }}>
              {assetName}을 {config.action}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(34,211,238,0.15)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, color: '#22D3EE', fontWeight: '700' }}>온체인</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>
            {formatRelativeTime(tx.timestampMs)}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          padding: 14,
          gap: 4,
        }}
      >
        {isLocked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Lock
              size={16}
              color="rgba(255,255,255,0.35)"
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: -0.5,
              }}
            >
              ••••••
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: -0.8 }}>
              {formatAmountKo(tx.amountUsd)}
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>
              {formatUsdShort(tx.amountUsd)} · {tx.amountNative.toLocaleString()} {tx.asset}
            </Text>
          </>
        )}
      </View>

      {isLocked ? (
        <Pressable
          onPress={onUpgrade}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 13,
            borderRadius: 14,
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
            gap: 4,
            paddingVertical: 11,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
            상세 정보 보기
          </Text>
          <ChevronRight
            size={14}
            color="rgba(255,255,255,0.6)"
            strokeWidth={2.5}
          />
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
  const bg = isBuy ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.15)';
  const coinName = COIN_NAME[trade.symbol.split('/')[0]] ?? trade.symbol.split('/')[0];
  const actionText = isBuy ? '대량 매수' : '대량 매도';

  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 20 }}>{isBuy ? '🚀' : '🔥'}</Text>
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: 'white', letterSpacing: -0.3 }}>
              {coinName} {actionText}
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(167,139,250,0.15)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, color: '#A78BFA', fontWeight: '700' }}>거래소</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>
            {formatRelativeTime(trade.timestampMs)}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          padding: 14,
          gap: 4,
        }}
      >
        {isLocked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Lock
              size={16}
              color="rgba(255,255,255,0.35)"
              strokeWidth={2.5}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: -0.5,
              }}
            >
              ••••••
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 24, fontWeight: '800', color, letterSpacing: -0.8 }}>
              {formatAmountKo(trade.valueUsd)}
            </Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>
              {formatUsdShort(trade.valueUsd)} · {trade.symbol}
            </Text>
          </>
        )}
      </View>

      {isLocked && (
        <Pressable
          onPress={onUpgrade}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 13,
            borderRadius: 14,
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
