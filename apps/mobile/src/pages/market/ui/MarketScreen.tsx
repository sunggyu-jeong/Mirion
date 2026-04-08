import type { EthMarketData } from '@features/market-chart';
import { useEthMarketData } from '@features/market-chart';
import { useWhaleMovements } from '@features/whale-movements';
import { formatUsd } from '@shared/lib/format';
import { Skeleton } from '@shared/ui';
import { PriceChart } from '@widgets/price-chart';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function PriceHeader({ data }: { data: EthMarketData }) {
  const isPos = data.change24h >= 0;
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 38, fontWeight: '800', color: '#0f172b', letterSpacing: -1.5 }}>
        $
        {data.priceUsd.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 7,
            backgroundColor: isPos ? '#dcfce7' : '#fee2e2',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: isPos ? '#15803d' : '#dc2626',
              letterSpacing: -0.02,
            }}
          >
            {isPos ? '+' : ''}
            {data.change24h.toFixed(2)}%
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: '#94a3b8' }}>24시간</Text>
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 14,
        gap: 5,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: '#94a3b8', letterSpacing: 0.1 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b', letterSpacing: -0.02 }}>
        {value}
      </Text>
    </View>
  );
}

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
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: '#0f172b',
            letterSpacing: -0.4,
            marginBottom: 24,
          }}
        >
          ETH 마켓
        </Text>

        <View style={{ gap: 20 }}>
          <Animated.View entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}>
            {marketLoading || !marketData ? (
              <View style={{ gap: 8 }}>
                <Skeleton
                  width={220}
                  height={46}
                  borderRadius={8}
                />
                <Skeleton
                  width={130}
                  height={26}
                  borderRadius={7}
                />
              </View>
            ) : (
              <PriceHeader data={marketData} />
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}
            style={{ flexDirection: 'row', gap: 8 }}
          >
            {marketLoading || !marketData ? (
              <>
                <View style={{ flex: 1 }}>
                  <Skeleton
                    width="100%"
                    height={68}
                    borderRadius={12}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Skeleton
                    width="100%"
                    height={68}
                    borderRadius={12}
                  />
                </View>
              </>
            ) : (
              <>
                <StatCard
                  label="시가총액"
                  value={formatUsd(marketData.marketCapUsd)}
                />
                <StatCard
                  label="24시간 거래량"
                  value={formatUsd(marketData.volume24hUsd)}
                />
              </>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}
            style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 12 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#0f172b',
                letterSpacing: -0.02,
              }}
            >
              가격 차트
            </Text>
            <PriceChart whaleEvents={movements} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(180).duration(260).easing(EASE_OUT)}
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: 12,
              padding: 14,
              gap: 6,
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: '700', color: '#1d4ed8', letterSpacing: -0.01 }}
            >
              🐋 고래 시그널이란?
            </Text>
            <Text style={{ fontSize: 12, color: '#3b82f6', lineHeight: 18, letterSpacing: -0.01 }}>
              차트 위 점은 고래 지갑의 대규모 이체 시점입니다. 빨간 점은 전송, 초록 점은 수신을
              의미합니다. 고래의 움직임은 시장 방향의 선행 신호일 수 있습니다.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
