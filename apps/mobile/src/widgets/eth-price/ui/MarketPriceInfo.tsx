import type { EthMarketData } from '@features/market-chart';
import { Skeleton } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';

export function PriceHeader({ data }: { data: EthMarketData }) {
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

export function StatCard({ label, value }: { label: string; value: string }) {
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

export function PriceInfoSkeleton() {
  return (
    <View style={{ gap: 20 }}>
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
      <View style={{ flexDirection: 'row', gap: 8 }}>
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
      </View>
    </View>
  );
}
