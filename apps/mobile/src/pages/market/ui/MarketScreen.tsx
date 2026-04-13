import type { WhaleTx } from '@entities/whale-tx';
import { useCexTrades } from '@features/cex-trades';
import { useEthMarketData } from '@features/market-chart';
import { useWhaleMovements } from '@features/whale-movements';
import { formatRelativeTime, formatUsd } from '@shared/lib/format';
import { CexWhaleFeed } from '@widgets/cex-whale-feed';
import { PriceHeader, PriceInfoSkeleton, StatCard } from '@widgets/eth-price';
import { PriceChart } from '@widgets/price-chart';
import { WhaleVsAntChart } from '@widgets/whale-vs-ant-chart';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const TX_TYPE_CONFIG = {
  send: { label: '전송', Icon: ArrowUpRight, color: '#ef4444', bg: '#fff1f2' },
  receive: { label: '수신', Icon: ArrowDownLeft, color: '#22c55e', bg: '#f0fdf4' },
  swap: { label: '스왑', Icon: RefreshCw, color: '#f97316', bg: '#fff7ed' },
} as const;

const CHAIN_COLOR: Record<string, string> = {
  ETH: '#627eea',
  BTC: '#f7931a',
  SOL: '#9945ff',
  BNB: '#f0b90b',
  XRP: '#346aa9',
  TRX: '#e50914',
};

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function WhaleActivityRow({ item, isLast }: { item: WhaleTx; isLast: boolean }) {
  const config = TX_TYPE_CONFIG[item.type];
  const { Icon } = config;
  const chainColor = CHAIN_COLOR[item.chain] ?? '#94a3b8';
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
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
            strokeWidth={2.2}
          />
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}
              >
                {item.amountNative.toFixed(2)} {item.asset}
              </Text>
              <View
                style={{
                  backgroundColor: chainColor + '18',
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: chainColor }}>
                  {item.chain}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: config.color }}>
              {formatUsd(item.amountUsd)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
              {shortenAddress(item.fromAddress)}
            </Text>
            <Text style={{ fontSize: 11, color: '#cbd5e1' }}>→</Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
              {shortenAddress(item.toAddress)}
            </Text>
            <Text style={{ fontSize: 11, color: '#cbd5e1', marginLeft: 'auto' }}>
              {formatRelativeTime(item.timestampMs)}
            </Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />}
    </View>
  );
}

export function MarketScreen() {
  const { data: marketData, isLoading: marketLoading } = useEthMarketData();
  const { data: movements } = useWhaleMovements();
  const { data: cexTrades } = useCexTrades();

  const recentMovements = movements?.slice(0, 10) ?? [];
  const recentCexTrades = cexTrades?.slice(0, 10) ?? [];

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', marginBottom: 24 }}>
          마켓
        </Text>

        <View style={{ gap: 16 }}>
          {marketLoading || !marketData ? (
            <PriceInfoSkeleton />
          ) : (
            <>
              <Animated.View entering={FadeInDown.duration(260).easing(EASE_OUT)}>
                <PriceHeader data={marketData} />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}
                style={{ flexDirection: 'row', gap: 10 }}
              >
                <StatCard
                  label="시가총액"
                  value={formatUsd(marketData.marketCapUsd)}
                />
                <StatCard
                  label="24시간 거래량"
                  value={formatUsd(marketData.volume24hUsd)}
                />
              </Animated.View>
            </>
          )}

          <Animated.View
            entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 18,
              padding: 16,
              gap: 14,
              borderWidth: 1,
              borderColor: '#f1f5f9',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b' }}>가격 차트</Text>
            <PriceChart whaleEvents={movements} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(260).easing(EASE_OUT)}>
            <WhaleVsAntChart movements={movements} />
          </Animated.View>

          {recentCexTrades.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200).duration(260).easing(EASE_OUT)}>
              <CexWhaleFeed trades={recentCexTrades} />
            </Animated.View>
          )}

          {recentMovements.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(240).duration(260).easing(EASE_OUT)}
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: '#f1f5f9',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b' }}>
                  고래 이체 현황
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View
                    style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22c55e' }}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '500', color: '#22c55e' }}>실시간</Text>
                </View>
              </View>

              {recentMovements.map((item, index) => (
                <WhaleActivityRow
                  key={item.txHash}
                  item={item}
                  isLast={index === recentMovements.length - 1}
                />
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
