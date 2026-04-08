import type { DailySummary } from '@entities/daily-summary';
import { computeDailySummary } from '@entities/daily-summary';
import type { WhaleTx } from '@entities/whale-tx';
import { formatEth, formatUsd } from '@shared/lib/format';
import { Activity, ArrowUpRight, RefreshCw, TrendingDown } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

const TYPE_CONFIG = {
  send: { label: '전송 우세', Icon: ArrowUpRight, color: '#fb2c36' },
  receive: { label: '수신 우세', Icon: TrendingDown, color: '#22c55e' },
  swap: { label: '스왑 우세', Icon: RefreshCw, color: '#f97316' },
} as const;

type StatProps = { label: string; value: string };

function Stat({ label, value }: StatProps) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={{ fontSize: 11, fontWeight: '400', color: '#94a3b8', letterSpacing: -0.01 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172b', letterSpacing: -0.02 }}>
        {value}
      </Text>
    </View>
  );
}

type Props = { movements: WhaleTx[] | undefined };

export function DailySummaryCard({ movements }: Props) {
  if (!movements || movements.length === 0) {
    return null;
  }

  const summary: DailySummary = computeDailySummary(movements);
  if (summary.totalCount === 0) {
    return null;
  }

  const typeConfig = TYPE_CONFIG[summary.dominantType];
  const { Icon } = typeConfig;

  return (
    <View
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        marginBottom: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <Activity
          size={14}
          color="#2b7fff"
          strokeWidth={2}
        />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172b', letterSpacing: -0.02 }}>
          오늘의 고래 활동
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            backgroundColor: `${typeConfig.color}18`,
            borderRadius: 5,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginLeft: 'auto',
          }}
        >
          <Icon
            size={10}
            color={typeConfig.color}
            strokeWidth={2.5}
          />
          <Text style={{ fontSize: 10, fontWeight: '600', color: typeConfig.color }}>
            {typeConfig.label}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stat
          label="감지 건수"
          value={`${summary.totalCount}건`}
        />
        <Stat
          label="총 ETH"
          value={formatEth(summary.totalEth)}
        />
        <Stat
          label="총 규모"
          value={formatUsd(summary.totalUsd)}
        />
      </View>
    </View>
  );
}
