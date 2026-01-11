import { StyleSheet } from 'react-native';

import { Card, Label, Value } from '@/src/shared';

export const VaultStatusCard = ({ balance }: { balance: string }) => (
  <Card style={styles.card}>
    <Label>현재 금고에 잠긴 자산</Label>
    <Value style={styles.balanceText}>{balance} ETH</Value>
  </Card>
);

const styles = StyleSheet.create({
  card: { marginTop: 12, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 20 },
  balanceText: { fontSize: 24, color: '#0047FF', marginTop: 8 },
});
