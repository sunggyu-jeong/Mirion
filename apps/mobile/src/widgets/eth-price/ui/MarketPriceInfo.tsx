import type { EthMarketData } from '@features/market-chart';
import { Skeleton } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';

export function PriceHeader({ data }: { data: EthMarketData }) {
  const isPos = data.change24h >= 0;
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#627eea',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>Ξ</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172b', letterSpacing: -0.3 }}>
          Ethereum
        </Text>
        <View
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>#2</Text>
        </View>
      </View>

      <Text style={{ fontSize: 40, fontWeight: '800', color: '#0f172b', letterSpacing: -1.5 }}>
        $
        {data.priceUsd.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
            backgroundColor: isPos ? '#dcfce7' : '#fee2e2',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: isPos ? '#16a34a' : '#dc2626',
            }}
          >
            {isPos ? '+' : ''}
            {data.change24h.toFixed(2)}%
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: '#94a3b8' }}>지난 24시간</Text>
      </View>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: '#f1f5f9',
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172b', letterSpacing: -0.5 }}>
        {value}
      </Text>
      {sub ? <Text style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</Text> : null}
    </View>
  );
}

export function PriceInfoSkeleton() {
  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 10 }}>
        <Skeleton
          width={180}
          height={34}
          borderRadius={8}
        />
        <Skeleton
          width={240}
          height={48}
          borderRadius={8}
        />
        <Skeleton
          width={130}
          height={28}
          borderRadius={8}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Skeleton
            width="100%"
            height={80}
            borderRadius={16}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Skeleton
            width="100%"
            height={80}
            borderRadius={16}
          />
        </View>
      </View>
    </View>
  );
}
