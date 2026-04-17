import { useCexTrades } from '@features/cex-trades';
import { useEthMarketData } from '@features/market-chart';
import { useWhaleMovements } from '@features/whale-movements';
import { formatUsd } from '@shared/lib/format';
import { CexWhaleFeed } from '@widgets/cex-whale-feed';
import { PriceHeader, PriceInfoSkeleton, StatCard } from '@widgets/eth-price';
import { MacroStatsCard } from '@widgets/macro-stats-card';
import { PriceChart } from '@widgets/price-chart';
import { WhaleVsAntChart } from '@widgets/whale-vs-ant-chart';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function MarketScreen() {
  const { data: marketData, isLoading: marketLoading } = useEthMarketData();
  const { data: movements } = useWhaleMovements();
  const { data: cexTrades } = useCexTrades();

  const recentCexTrades = cexTrades?.slice(0, 10) ?? [];

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#020B18' }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: 'white',
            marginBottom: 28,
            letterSpacing: -0.5,
          }}
        >
          마켓
        </Text>

        {marketLoading || !marketData ? (
          <PriceInfoSkeleton />
        ) : (
          <Animated.View
            entering={FadeInDown.duration(260).easing(EASE_OUT)}
            style={{ gap: 20 }}
          >
            <PriceHeader data={marketData} />

            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20,
                padding: 16,
                gap: 14,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>ETH 가격 차트</Text>
              <PriceChart whaleEvents={movements} />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <StatCard
                label="시가총액"
                value={formatUsd(marketData.marketCapUsd)}
              />
              <StatCard
                label="24시간 거래량"
                value={formatUsd(marketData.volume24hUsd)}
              />
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.06)',
                paddingTop: 24,
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: -0.5,
                }}
              >
                고래 분석
              </Text>

              <WhaleVsAntChart movements={movements} />
              <MacroStatsCard movements={movements} />
              {recentCexTrades.length > 0 && <CexWhaleFeed trades={recentCexTrades} />}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
