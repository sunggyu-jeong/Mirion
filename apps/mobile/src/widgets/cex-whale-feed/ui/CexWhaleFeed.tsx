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
      <View className="flex-row items-center gap-3 py-3">
        <View
          className={`h-10 w-10 items-center justify-center rounded-xl ${isBuy ? 'bg-green-50' : 'bg-red-50'}`}
        >
          {isBuy ? (
            <TrendingUp
              size={18}
              color="#22c55e"
              strokeWidth={2.2}
            />
          ) : (
            <TrendingDown
              size={18}
              color="#ef4444"
              strokeWidth={2.2}
            />
          )}
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-bold tracking-tight text-[#0f172b]">
                {COIN_LABEL[item.symbol] ?? item.symbol}
              </Text>
              <View className={`rounded px-1.5 py-0.5 ${isBuy ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text
                  className={`text-[10px] font-bold ${isBuy ? 'text-green-600' : 'text-red-500'}`}
                >
                  {isBuy ? '매수' : '매도'}
                </Text>
              </View>
            </View>
            <Text
              className={`text-[13px] font-semibold ${isBuy ? 'text-green-600' : 'text-red-500'}`}
            >
              {formatUsd(item.valueUsd)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Text className="text-[11px] text-slate-400">
              {item.amount.toFixed(4)} @ {formatUsd(item.price)}
            </Text>
            <Text className="ml-auto text-[11px] text-slate-300">
              {formatRelativeTime(item.timestampMs)}
            </Text>
          </View>
        </View>
      </View>
      {!isLast && <View className="h-px bg-slate-100" />}
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
    <View className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-[15px] font-bold text-[#0f172b]">CEX 대량 체결</Text>
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <Text className="text-[11px] font-medium text-green-500">실시간</Text>
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
