import type { WhaleTx } from '@entities/whale-tx';
import { useCexTrades } from '@features/cex-trades';
import { useEthMarketData } from '@features/market-chart';
import { useWhaleMovements } from '@features/whale-movements';
import { formatRelativeTime, formatUsd } from '@shared/lib/format';
import { CexWhaleFeed } from '@widgets/cex-whale-feed';
import { PriceHeader, PriceInfoSkeleton, StatCard } from '@widgets/eth-price';
import { MacroStatsCard } from '@widgets/macro-stats-card';
import { PriceChart } from '@widgets/price-chart';
import { WhaleVsAntChart } from '@widgets/whale-vs-ant-chart';
import { ArrowDownLeft, ArrowUpRight, BarChart2, RefreshCw } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const TX_TYPE_CONFIG = {
  send: { label: '전송', Icon: ArrowUpRight, color: '#F43F5E', bg: 'rgba(244,63,94,0.15)' },
  receive: { label: '수신', Icon: ArrowDownLeft, color: '#22D3EE', bg: 'rgba(34,211,238,0.15)' },
  swap: { label: '스왑', Icon: RefreshCw, color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
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
                style={{ fontSize: 14, fontWeight: '700', color: 'white', letterSpacing: -0.3 }}
              >
                {item.amountNative.toFixed(2)} {item.asset}
              </Text>
              <View
                style={{
                  backgroundColor: chainColor + '28',
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
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {shortenAddress(item.fromAddress)}
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>→</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {shortenAddress(item.toAddress)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                marginLeft: 'auto' as any,
              }}
            >
              {formatRelativeTime(item.timestampMs)}
            </Text>
          </View>
        </View>
      </View>
      {!isLast && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />}
    </View>
  );
}

interface ChartModalProps {
  visible: boolean;
  onClose: () => void;
  marketData: { marketCapUsd: number; volume24hUsd: number } | undefined;
  movements: WhaleTx[] | undefined;
}

function ChartModal({ visible, onClose, marketData, movements }: ChartModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#020B18', paddingTop: insets.top + 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: 'white', letterSpacing: -0.5 }}>
            ETH 가격 차트
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
              닫기
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>가격 차트</Text>
            <PriceChart whaleEvents={movements} />
          </View>

          {marketData && (
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
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function MarketScreen() {
  const [chartVisible, setChartVisible] = useState(false);

  const { data: marketData, isLoading: marketLoading } = useEthMarketData();
  const { data: movements } = useWhaleMovements();
  const { data: cexTrades } = useCexTrades();

  const recentMovements = movements?.slice(0, 10) ?? [];
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
            style={{ gap: 28 }}
          >
            <PriceHeader data={marketData} />

            <Pressable
              onPress={() => setChartVisible(true)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: pressed ? 'rgba(43,127,255,0.15)' : 'rgba(43,127,255,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(43,127,255,0.3)',
              })}
            >
              <BarChart2
                size={17}
                color="#2b7fff"
                strokeWidth={2}
              />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#2b7fff' }}>차트 보기</Text>
            </Pressable>

            <View
              style={{
                gap: 4,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.06)',
                paddingTop: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: -0.5,
                  marginBottom: 16,
                }}
              >
                고래 분석
              </Text>

              <WhaleVsAntChart movements={movements} />

              <View style={{ height: 12 }} />

              <MacroStatsCard movements={movements} />

              {recentCexTrades.length > 0 && (
                <>
                  <View style={{ height: 12 }} />
                  <CexWhaleFeed trades={recentCexTrades} />
                </>
              )}

              {recentMovements.length > 0 && (
                <>
                  <View style={{ height: 12 }} />
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderRadius: 20,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.08)',
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
                      <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>
                        고래 이체 현황
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 3.5,
                            backgroundColor: '#22D3EE',
                          }}
                        />
                        <Text style={{ fontSize: 11, fontWeight: '500', color: '#22D3EE' }}>
                          실시간
                        </Text>
                      </View>
                    </View>
                    {recentMovements.map((item, index) => (
                      <WhaleActivityRow
                        key={item.txHash}
                        item={item}
                        isLast={index === recentMovements.length - 1}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <ChartModal
        visible={chartVisible}
        onClose={() => setChartVisible(false)}
        marketData={marketData}
        movements={movements}
      />
    </SafeAreaView>
  );
}
