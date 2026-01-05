import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Card } from '@/src/shared';

interface SavingsCardProps {
  amount: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  status: string;
}

export const SavingsCard = ({
  amount,
  startDate,
  endDate,
  remainingDays,
  status,
}: SavingsCardProps) => (
  <Card style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.amount}>{amount}</Text>
      <Badge
        icon={
          <Clock
            size={14}
            color="#1E40AF"
          />
        }
      >
        {status}
      </Badge>
    </View>

    <View style={styles.body}>
      <Text style={styles.date}>잠금: {startDate}</Text>
      <Text style={styles.date}>해제: {endDate}</Text>
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerLabel}>남은 시간</Text>
      <Text style={styles.remainingText}>{remainingDays}일</Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: '#000' },
  body: { marginBottom: 20 },
  date: { fontSize: 14, color: '#94A3B8', marginBottom: 4 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 12, color: '#94A3B8' },
  remainingText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
});
