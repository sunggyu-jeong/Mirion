import type { TokenHolding, WhaleDetailData } from '@features/whale-detail';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, RefreshCw } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { FlatList, Linking, Pressable, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { PaywallOverlay } from '../../../shared/ui/PaywallOverlay';
import { SectionTitle } from '../../../shared/ui/SectionTitle';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const TOSS_PRESS = { damping: 15, stiffness: 400 } as const;
const FREE_TX_LIMIT = 3;

const PIE_SIZE = 110;
const PIE_CENTER = PIE_SIZE / 2;
const PIE_RADIUS = 44;

const TX_CONFIG = {
  send: { label: '매도/전송', Icon: ArrowUpRight, color: '#fb2c36', bg: '#fff1f2' },
  receive: { label: '매수/수신', Icon: ArrowDownLeft, color: '#22c55e', bg: '#f0fdf4' },
  swap: { label: '스왑', Icon: RefreshCw, color: '#f97316', bg: '#fff7ed' },
  transfer: { label: '전송', Icon: ArrowRight, color: '#f97316', bg: '#fff7ed' },
} as const;

function buildSlices(tokens: TokenHolding[]) {
  let cumulative = 0;
  return tokens.map(t => {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += t.percentage;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = (PIE_CENTER + PIE_RADIUS * Math.cos(start)).toFixed(2);
    const y1 = (PIE_CENTER + PIE_RADIUS * Math.sin(start)).toFixed(2);
    const x2 = (PIE_CENTER + PIE_RADIUS * Math.cos(end)).toFixed(2);
    const y2 = (PIE_CENTER + PIE_RADIUS * Math.sin(end)).toFixed(2);
    const large = t.percentage > 50 ? 1 : 0;
    return {
      d: `M ${PIE_CENTER} ${PIE_CENTER} L ${x1} ${y1} A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${large} 1 ${x2} ${y2} Z`,
      color: t.color,
    };
  });
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type TxItemProps = {
  item: WhaleDetailData['transactions'][number];
  index: number;
};

function TxItem({ item, index }: TxItemProps) {
  const scale = useSharedValue(1);
  const cfg = TX_CONFIG[item.type] ?? TX_CONFIG.transfer;
  const { Icon } = cfg;

  const handlePress = useCallback(() => {
    Linking.openURL(`https://etherscan.io/tx/${item.txHash}`);
  }, [item.txHash]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .duration(220)
        .easing(EASE_OUT)}
    >
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, TOSS_PRESS);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, TOSS_PRESS);
        }}
        onPress={handlePress}
      >
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
            },
          ]}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: cfg.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              size={16}
              color={cfg.color}
              strokeWidth={2}
            />
          </View>

          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: '#0f172b', letterSpacing: -0.02 }}
              >
                {cfg.label}
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: cfg.color, letterSpacing: -0.02 }}
              >
                {item.amountUsd}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                {shortenAddress(item.fromAddress)}
              </Text>
              <ArrowRight
                size={10}
                color="#cbd5e1"
                strokeWidth={2}
              />
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                {shortenAddress(item.toAddress)}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#cbd5e1', letterSpacing: -0.01 }}>
              {item.timestamp}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

type Props = {
  data: WhaleDetailData;
  isPro: boolean;
  onUpgrade: () => void;
};

export function WhaleDetailView({ data, isPro, onUpgrade }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const slices = buildSlices(data.tokens);
  const visibleTxs = isPro ? data.transactions : data.transactions.slice(0, FREE_TX_LIMIT);
  const hasLocked = !isPro && data.transactions.length > FREE_TX_LIMIT;

  return (
    <FlatList
      data={visibleTxs}
      keyExtractor={item => item.txHash}
      renderItem={({ item, index }) => (
        <TxItem
          item={item}
          index={index}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <Animated.View
            entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 20,
              padding: 20,
              marginBottom: 24,
              gap: 16,
            }}
          >
            <View style={{ gap: 2 }}>
              <Text
                style={{ fontSize: 13, fontWeight: '500', color: '#62748e', letterSpacing: -0.02 }}
              >
                총 자산
              </Text>
              <Text
                style={{ fontSize: 26, fontWeight: '800', color: '#0f172b', letterSpacing: -0.04 }}
              >
                {data.totalValueUsd}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Svg
                width={PIE_SIZE}
                height={PIE_SIZE}
              >
                <G>
                  {slices.map((s, i) => (
                    <Path
                      key={i}
                      d={s.d}
                      fill={s.color}
                      opacity={activeIdx === null || activeIdx === i ? 1 : 0.35}
                      onPress={() => setActiveIdx(p => (p === i ? null : i))}
                    />
                  ))}
                </G>
              </Svg>

              <View style={{ flex: 1, gap: 7 }}>
                {data.tokens.map((t, i) => (
                  <View
                    key={t.symbol}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: t.color,
                        opacity: activeIdx === null || activeIdx === i ? 1 : 0.3,
                      }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: '500',
                        color: activeIdx === null || activeIdx === i ? '#0f172b' : '#94a3b8',
                      }}
                    >
                      {t.symbol}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: activeIdx === null || activeIdx === i ? '#62748e' : '#cbd5e1',
                      }}
                    >
                      {t.percentage.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}
            style={{ marginBottom: 12 }}
          >
            <SectionTitle title="매수 / 매도 내역" />
          </Animated.View>
        </>
      }
      ListFooterComponent={
        hasLocked ? (
          <View style={{ position: 'relative', height: 120, marginTop: 4 }}>
            <View style={{ opacity: 0.15 }}>
              {data.transactions.slice(FREE_TX_LIMIT, FREE_TX_LIMIT + 2).map(item => (
                <View
                  key={item.txHash}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                  }}
                >
                  <View
                    style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#f1f5f9' }}
                  />
                  <View style={{ flex: 1, gap: 5 }}>
                    <View
                      style={{ height: 12, width: 80, backgroundColor: '#e2e8f0', borderRadius: 4 }}
                    />
                    <View
                      style={{
                        height: 10,
                        width: 140,
                        backgroundColor: '#f1f5f9',
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
            <PaywallOverlay
              visible
              message={`${data.transactions.length - FREE_TX_LIMIT}건의 거래 내역이 더 있습니다`}
              onUpgrade={onUpgrade}
            />
          </View>
        ) : null
      }
    />
  );
}
