import type { CexTrade } from '@entities/cex-trade';
import type { ActivityEvent } from '@entities/unified-activity';
import type { WhaleTx } from '@entities/whale-tx';
import { getMagnitudeInfo } from '@entities/whale-tx';
import { formatRelativeTime, formatUsd } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Lock,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

const ONCHAIN_TYPE_CONFIG = {
  send: { label: '대규모 전송', Icon: ArrowUpRight, color: '#fb2c36', bg: '#fff1f2' },
  receive: { label: '대규모 수신', Icon: ArrowDownLeft, color: '#22c55e', bg: '#f0fdf4' },
  swap: { label: '대규모 스왑', Icon: RefreshCw, color: '#f97316', bg: '#fff7ed' },
} as const;

const COIN_LABEL: Record<string, string> = {
  'BTC/USDT': 'BTC',
  'ETH/USDT': 'ETH',
  'SOL/USDT': 'SOL',
  'BNB/USDT': 'BNB',
  'XRP/USDT': 'XRP',
  'PEPE/USDT': 'PEPE',
  'WIF/USDT': 'WIF',
};

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
  const magnitude = getMagnitudeInfo(tx.amountNative);
  const { toTxDetail } = useAppNavigation();

  const handleViewDetail = useCallback(() => {
    toTxDetail({ ...tx, blockNumber: tx.blockNumber.toString() });
  }, [tx, toTxDetail]);

  return (
    <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: config.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            size={18}
            color={config.color}
            strokeWidth={2}
          />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172b' }}>
                {config.label}
              </Text>
              <View
                style={{
                  backgroundColor: magnitude.bg,
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: magnitude.color }}>
                  {magnitude.label}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>
              {formatRelativeTime(tx.timestampMs)}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: config.color }}>
            {isLocked ? `••••• ${tx.asset}` : `${tx.amountNative.toFixed(2)} ${tx.asset}`}
          </Text>
          <Text style={{ fontSize: 12, color: '#62748e' }}>
            {isLocked ? '•••••' : formatUsd(tx.amountUsd)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#f1f5f9',
          borderRadius: 8,
          padding: 10,
        }}
      >
        <Text
          style={{ fontSize: 11, color: '#62748e', fontFamily: 'monospace' }}
          numberOfLines={1}
        >
          {isLocked ? '0x••••••...••••' : shortenAddress(tx.fromAddress)}
        </Text>
        <ArrowRight
          size={12}
          color="#94a3b8"
          strokeWidth={2}
        />
        <Text
          style={{ fontSize: 11, color: '#62748e', fontFamily: 'monospace' }}
          numberOfLines={1}
        >
          {isLocked ? '0x••••••...••••' : shortenAddress(tx.toAddress)}
        </Text>
      </View>

      {isLocked ? (
        <Pressable
          onPress={onUpgrade}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: '#0f172b',
          }}
        >
          <Lock
            size={12}
            color="white"
            strokeWidth={2}
          />
          <Text style={{ fontSize: 13, fontWeight: '600', color: 'white' }}>PRO로 잠금 해제</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleViewDetail}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            backgroundColor: 'white',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#2b7fff' }}>거래 상세 보기</Text>
          <ArrowUpRight
            size={14}
            color="#2b7fff"
            strokeWidth={2}
          />
        </Pressable>
      )}
    </View>
  );
}

function CexItem({ trade }: { trade: CexTrade }) {
  const isBuy = trade.side === 'buy';
  const Icon = isBuy ? TrendingUp : TrendingDown;
  const color = isBuy ? '#22c55e' : '#ef4444';
  const bg = isBuy ? '#f0fdf4' : '#fff1f2';

  return (
    <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            size={18}
            color={color}
            strokeWidth={2}
          />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172b' }}>
                {COIN_LABEL[trade.symbol] ?? trade.symbol}
              </Text>
              <View
                style={{
                  backgroundColor: `${color}18`,
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color }}>
                  {isBuy ? '매수' : '매도'}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#e0f2fe',
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#0284c7' }}>CEX</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>
              {formatRelativeTime(trade.timestampMs)}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '500', color }}>
            {formatUsd(trade.valueUsd)}
          </Text>
          <Text style={{ fontSize: 12, color: '#62748e' }}>
            {trade.amount.toFixed(4)} @ {formatUsd(trade.price)}
          </Text>
        </View>
      </View>
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
    return <CexItem trade={event.data} />;
  }
  return (
    <OnChainItem
      tx={event.data}
      isLocked={isLocked}
      onUpgrade={onUpgrade}
    />
  );
}
