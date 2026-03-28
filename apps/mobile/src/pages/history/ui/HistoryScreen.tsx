import { useWalletStore } from '@entities/wallet';
import { useInterestHistory } from '@features/staking';
import type { InterestSnapshot } from '@features/staking/model/use-interest-history';
import { ScreenTitle } from '@shared/ui';
import React from 'react';
import { SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Address } from 'viem';

type Section = { title: string; data: InterestSnapshot[] };

function groupByMonth(snapshots: InterestSnapshot[]): Section[] {
  const map = new Map<string, InterestSnapshot[]>();
  for (const s of snapshots) {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(s);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ paddingVertical: 8, backgroundColor: '#fcfcfc' }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#62748e', lineHeight: 18 }}>
        {title}
      </Text>
    </View>
  );
}

function HistoryRow({ item }: { item: InterestSnapshot }) {
  const day = new Date(item.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  const daily = parseFloat(item.daily_interest).toFixed(6);
  const cumulative = parseFloat(item.cumulative_interest).toFixed(6);

  return (
    <View
      style={{
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e2e8f0',
        gap: 4,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '400', color: '#62748e', lineHeight: 21 }}>
          {day}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#2b7fff', lineHeight: 24 }}>
          +{daily} ETH
        </Text>
      </View>
      <Text style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8', lineHeight: 18 }}>
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
        아직 이자 내역이 없습니다
      </Text>
    </View>
  );
}

export function HistoryScreen() {
  const address = useWalletStore(s => s.address);
  const { data } = useInterestHistory(address as Address | null);

  const sections = groupByMonth(data?.snapshots ?? []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScreenTitle>내역</ScreenTitle>
      </View>
      {sections.length === 0 ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.date}
          renderItem={({ item }) => <HistoryRow item={item} />}
          renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}
