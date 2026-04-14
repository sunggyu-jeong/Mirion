import type { WhaleTx } from '@entities/whale-tx';
import { formatUsd } from '@shared/lib/format';
import { AnimatedNumber } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatCellProps {
  label: string;
  value: string;
  unit?: string;
  accent: string;
  delay: number;
}

function StatCell({ label, value, unit, accent, delay }: StatCellProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().stiffness(400).damping(30)}
      style={{
        flex: 1,
        backgroundColor: '#eef2f7',
        borderRadius: 16,
        padding: 14,
        gap: 8,
      }}
    >
      <View
        style={{
          width: 28,
          height: 4,
          borderRadius: 2,
          backgroundColor: accent,
          opacity: 0.7,
        }}
      />
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
          <AnimatedNumber
            value={value}
            fontSize={17}
            fontWeight="800"
            color="#0f172b"
            letterSpacing={-0.4}
          />
          {unit ? (
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8' }}>{unit}</Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 11, fontWeight: '500', color: '#94a3b8', letterSpacing: -0.1 }}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

interface MacroStatsCardProps {
  movements?: WhaleTx[];
}

function stripCurrencySymbol(formatted: string): string {
  return formatted.replace(/^\$/, '');
}

export function MacroStatsCard({ movements }: MacroStatsCardProps) {
  const txs = movements ?? [];

  const inflowUsd = txs.filter(t => t.type === 'receive').reduce((s, t) => s + t.amountUsd, 0);

  const outflowUsd = txs.filter(t => t.type === 'send').reduce((s, t) => s + t.amountUsd, 0);

  const totalUsd = txs.reduce((s, t) => s + t.amountUsd, 0);
  const count = txs.length;

  const STATS: StatCellProps[] = [
    {
      label: '거래소 유입',
      value: stripCurrencySymbol(formatUsd(inflowUsd)),
      accent: '#22c55e',
      delay: 0,
    },
    {
      label: '거래소 유출',
      value: stripCurrencySymbol(formatUsd(outflowUsd)),
      accent: '#fb2c36',
      delay: 60,
    },
    {
      label: '총 이동량',
      value: stripCurrencySymbol(formatUsd(totalUsd)),
      accent: '#3182f6',
      delay: 120,
    },
    {
      label: '감지 건수',
      value: String(count),
      unit: '건',
      accent: '#f97316',
      delay: 180,
    },
  ];

  return (
    <View
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}>
          매크로 지표
        </Text>
        <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>온체인 기반</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCell {...STATS[0]!} />
        <StatCell {...STATS[1]!} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCell {...STATS[2]!} />
        <StatCell {...STATS[3]!} />
      </View>
    </View>
  );
}
