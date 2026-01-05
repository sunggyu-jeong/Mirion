import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SavingsCard, SavingsEmptyState } from '@/src/entities/history';

const HistoryPage = () => {
  const [savingsData] = useState([
    {
      id: 1,
      amount: '0.5 ETH',
      startDate: '2026. 1. 3.',
      endDate: '2026. 1. 8.',
      remainingDays: 5,
      status: '잠금 중',
    },
  ]);

  const hasData = savingsData.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!hasData ? (
          <SavingsEmptyState />
        ) : (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.title}>저금 기록</Text>
              <Text style={styles.count}>{savingsData.length}개의 기록</Text>
            </View>
            {savingsData.map(item => (
              <SavingsCard
                key={item.id}
                {...item}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  listContainer: { marginTop: 20 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  count: { fontSize: 14, color: '#94A3B8' },
});

export default HistoryPage;
