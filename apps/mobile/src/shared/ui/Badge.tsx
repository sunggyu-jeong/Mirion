import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Badge = ({ children, icon }: { children: string; icon?: ReactNode }) => (
  <View style={styles.badge}>
    {icon}
    <Text style={styles.text}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: { fontSize: 12, fontWeight: '600', color: '#1E40AF', marginLeft: 4 },
});
