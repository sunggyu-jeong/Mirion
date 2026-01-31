import { History } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export const SavingsEmptyState = () => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <History
        color="#94A3B8"
        size={40}
      />
    </View>
    <Text style={styles.title}>아직 저금 기록이 없어요</Text>
    <Text style={styles.description}>
      소중한 자산을 안전하게 잠그고{'\n'}첫 번째 저금을 시작해볼까요?
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
});
