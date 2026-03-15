import { View, Text, StyleSheet } from 'react-native';

interface InfoBoxProps {
  title: string,
  description: string
}

export const InfoBox = ({ title, description }: InfoBoxProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.desc}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  title: {
    color: '#2563EB',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 14,
  },
  desc: {
    color: '#3B82F6',
    fontSize: 13,
    lineHeight: 18,
  },
});