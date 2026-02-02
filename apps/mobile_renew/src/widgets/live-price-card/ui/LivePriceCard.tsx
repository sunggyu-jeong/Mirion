import { useGetEthPriceQuery } from '@/entities/price-tracker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

export const LivePriceCard = () => {
  const { data, isLoading, error } = useGetEthPriceQuery();

  if (isLoading)
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator
          size="small"
          color="#627EEA"
        />
        <Text style={styles.loadingText}>시세 불러오는 중...</Text>
      </View>
    );

  if (error) return null;

  const isPositive = data ? data.change > 0 : true;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.coinTitle}>
          <View style={styles.iconBg}>
            <MaterialCommunityIcons
              name="ethereum"
              size={20}
              color="#627EEA"
            />
          </View>
          <Text style={styles.coinName}>Ethereum</Text>
          <Text style={styles.coinSymbol}>ETH/KRW</Text>
        </View>
        <View style={[styles.changeBadge, isPositive ? styles.bgUp : styles.bgDown]}>
          <Text style={[styles.changeText, isPositive ? styles.textUp : styles.textDown]}>
            {isPositive ? '▲' : '▼'} {Math.abs(data?.change || 0).toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceValue}>
          {data?.price.toLocaleString()}
          <Text style={styles.currency}> 원</Text>
        </Text>
        <Text style={styles.updateTime}>실시간 시세 (CoinGecko)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  loadingCenter: { height: 120, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinTitle: { flexDirection: 'row', alignItems: 'center' },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  coinName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  coinSymbol: { fontSize: 12, color: '#94A3B8', marginLeft: 6 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  bgUp: { backgroundColor: '#FEF2F2' },
  bgDown: { backgroundColor: '#F0FDF4' },
  changeText: { fontSize: 12, fontWeight: '700' },
  textUp: { color: '#EF4444' },
  textDown: { color: '#10B981' },
  priceSection: { marginTop: 4 },
  priceValue: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  currency: { fontSize: 18, fontWeight: '600', color: '#64748B' },
  updateTime: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});
