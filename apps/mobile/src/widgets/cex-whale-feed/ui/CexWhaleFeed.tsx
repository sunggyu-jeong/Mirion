import type { CexTrade } from '@entities/cex-trade';
import { formatRelativeTime, formatUsd } from '@shared/lib/format';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

const COIN_LABEL: Record<string, string> = {
  'BTC/USDT': 'BTC',
  'ETH/USDT': 'ETH',
  'SOL/USDT': 'SOL',
  'BNB/USDT': 'BNB',
  'XRP/USDT': 'XRP',
  'PEPE/USDT': 'PEPE',
  'WIF/USDT': 'WIF',
};

function CexTradeRow({ item, isLast }: { item: CexTrade; isLast: boolean }) {
  const isBuy = item.side === 'buy';

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
        <View
          style={{
            height: 40,
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: isBuy ? 'rgba(74,222,128,0.12)' : 'rgba(244,63,94,0.12)',
          }}
        >
          {isBuy ? (
            <TrendingUp
              size={18}
              color="#4ADE80"
              strokeWidth={2.2}
            />
          ) : (
            <TrendingDown
              size={18}
              color="#F43F5E"
              strokeWidth={2.2}
            />
          )}
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: '700', letterSpacing: -0.3, color: 'white' }}
              >
                {COIN_LABEL[item.symbol] ?? item.symbol}
              </Text>
              <View
                style={{
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: isBuy ? 'rgba(74,222,128,0.15)' : 'rgba(244,63,94,0.15)',
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: '700', color: isBuy ? '#4ADE80' : '#F43F5E' }}
                >
                  {isBuy ? '매수' : '매도'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: isBuy ? '#4ADE80' : '#F43F5E' }}>
              {formatUsd(item.valueUsd)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              {item.amount.toFixed(4)} @ {formatUsd(item.price)}
            </Text>
            <Text style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              {formatRelativeTime(item.timestampMs)}
            </Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />}
    </View>
  );
}

interface CexWhaleFeedProps {
  trades: CexTrade[];
}

export function CexWhaleFeed({ trades }: CexWhaleFeedProps) {
  if (trades.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.04)',
        padding: 16,
      }}
    >
      <View
        style={{
          marginBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>거래소 대량 체결</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: '#4ADE80' }} />
          <Text style={{ fontSize: 11, fontWeight: '500', color: '#4ADE80' }}>실시간</Text>
        </View>
      </View>

      {trades.map((item, index) => (
        <CexTradeRow
          key={`${item.symbol}-${item.timestampMs}`}
          item={item}
          isLast={index === trades.length - 1}
        />
      ))}
    </View>
  );
}
