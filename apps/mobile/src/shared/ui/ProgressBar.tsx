import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export const ProgressBar = ({ progress, color = '#0052FF' }: ProgressBarProps) => (
  <View style={styles.container}>
    <View style={[styles.filler, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  container: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  filler: { height: '100%', borderRadius: 5 },
});
