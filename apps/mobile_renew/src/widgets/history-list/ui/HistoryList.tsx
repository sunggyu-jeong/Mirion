import { SavingsCard, SavingsEmptyState, useGetUserHistoryQuery, type HistoryItem } from '@/entities/history';
import { differenceInDays, fromUnixTime } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';



export const HistoryList = () => {
  const { address } = useAccount();
  const now = useMemo(() => new Date(), []);

  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = useGetUserHistoryQuery(address ?? '', { skip: !address });
  useEffect(() => {
    console.log('>>>>>>>', history);
  }, [history]);

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const amountEth = `${Number(formatUnits(BigInt(item.amount), 18)).toFixed(4)} ETH`;
    const start = fromUnixTime(item.timestamp);
    const end = item.unlockTime ? fromUnixTime(Number(item.unlockTime)) : null;

    const remainingDays = end ? Math.max(0, differenceInDays(end, now)) : 0;

    const status =
      item.type === 'DEPOSIT' ? (remainingDays > 0 ? '잠금 중' : '해제 가능') : '출금 완료';

    return (
      <SavingsCard
        amount={amountEth}
        startDate={start.toLocaleDateString()}
        endDate={end ? end.toLocaleDateString() : '-'}
        remainingDays={remainingDays}
        status={status}
      />
    );
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        style={styles.loader}
        size="large"
        color="#627EEA"
      />
    );
  }

  if (isError || !history || history.length === 0) {
    return <SavingsEmptyState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>저금 기록</Text>
        <Text style={styles.count}>{history.length}개</Text>
      </View>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 24 },
  loader: { marginTop: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  count: { fontSize: 14, color: '#94A3B8' },
  listContent: { paddingBottom: 40 },
});
