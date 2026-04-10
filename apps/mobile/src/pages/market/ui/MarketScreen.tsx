import { useEthMarketData } from '@features/market-chart';
import { useWhaleMovements } from '@features/whale-movements';
import { formatUsd } from '@shared/lib/format';
import { PriceHeader, PriceInfoSkeleton, StatCard } from '@widgets/eth-price';
import { PriceChart } from '@widgets/price-chart';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function MarketScreen() {
  const { data: marketData, isLoading: marketLoading } = useEthMarketData();
  const { data: movements } = useWhaleMovements();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', marginBottom: 24 }}>
          ETH 마켓
        </Text>

        <View style={{ gap: 20 }}>
          {marketLoading || !marketData ? (
            <PriceInfoSkeleton />
          ) : (
            <>
              <Animated.View entering={FadeInDown.duration(260).easing(EASE_OUT)}>
                <PriceHeader data={marketData} />
              </Animated.View>
              <Animated.View
                entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}
                style={{ flexDirection: 'row', gap: 8 }}
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
            style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 12 }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b' }}>가격 차트</Text>
            <PriceChart whaleEvents={movements} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(180).duration(260).easing(EASE_OUT)}
            style={{ backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, gap: 6 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1d4ed8' }}>
              🐋 고래 시그널이란?
            </Text>
            <Text style={{ fontSize: 12, color: '#3b82f6', lineHeight: 18 }}>
              차트 위 점은 고래 지갑의 대규모 이체 시점입니다. 빨간 점은 전송, 초록 점은 수신을
              의미합니다.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
