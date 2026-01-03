import { StyleSheet, Text, TextStyle } from 'react-native';

export const Label = ({ children, style }: { children: string; style?: TextStyle }) => (
  <Text style={[styles.label, style]}>{children}</Text>
);

export const Value = ({ children, style }: { children: string; style?: TextStyle }) => (
  <Text style={[styles.value, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  label: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  value: { fontSize: 14, fontWeight: '500', color: '#111827' },
});
