import { useWalletStore } from '@entities/wallet';
import { useInterestHistory } from '@features/staking';
import type { InterestSnapshot } from '@features/staking/model/use-interest-history';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Address } from 'viem';

function HistoryRow({ item }: { item: InterestSnapshot }) {
  const date = new Date(item.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const daily = parseFloat(item.daily_interest).toFixed(6);
  const cumulative = parseFloat(item.cumulative_interest).toFixed(6);

  return (
    <View
      style={{
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#cad5e2',
        gap: 4,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: '#62748e',
            lineHeight: 21,
          }}
        >
          {date}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#2b7fff',
            lineHeight: 24,
          }}
        >
          +{daily} ETH
        </Text>
      </View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#62748e',
          lineHeight: 18,
        }}
      >
        누적 이자 {cumulative} ETH
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '400',
          color: '#62748e',
          lineHeight: 24,
          textAlign: 'center',
        }}
      >
        아직 거래 내역이 없습니다
      </Text>
    </View>
  );
}

export function HistoryScreen() {
  const address = useWalletStore(s => s.address);
  const { data } = useInterestHistory(address as Address | null);

  const snapshots = data?.snapshots ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#0f172b',
            letterSpacing: -0.198,
            lineHeight: 30.8,
          }}
        >
          내역
        </Text>
      </View>
      {snapshots.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={snapshots}
          keyExtractor={item => item.date}
          renderItem={({ item }) => <HistoryRow item={item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
