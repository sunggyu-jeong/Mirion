import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { EthPriceResult } from '@/src/entities/price-tracker';

interface Props {
  data: EthPriceResult | undefined;
  isStored: boolean;
  onToggle: () => void;
}

export const LivePriceCard = ({ data, isStored, onToggle }: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.coinIcon}>
        <Ionicons
          name="logo-bitcoin"
          size={24}
          color="#627EEA"
        />
      </View>
      <View>
        <Text style={styles.title}>Ethereum</Text>
        <Text style={styles.subTitle}>실시간 시세(coingekco)</Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        style={styles.badge}
      >
        <Text style={styles.badgeText}>{isStored ? '저장됨' : '비어있음'}</Text>
      </TouchableOpacity>
    </View>
    <Text style={styles.price}>{`₩ ${data?.price ?? 0}`}</Text>
    <View style={styles.footer}>
      <Ionicons
        name="time-outline"
        size={14}
        color="#94A3B8"
      />
      <Text style={styles.time}>{` ${data?.updatedAt ?? ''} 기준`}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 24, padding: 24, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  subTitle: { fontSize: 12, color: '#64748B' },
  badge: {
    marginLeft: 'auto',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
  price: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  time: { fontSize: 12, color: '#94A3B8' },
});
