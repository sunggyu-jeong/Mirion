import { HistoryList } from '@/src/widgets/history-list/ui/HistoryList';
import { StyleSheet, View } from 'react-native';

const HistoryPage = () => {
  return (
    <View style={styles.container}>
      <HistoryList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
});

export default HistoryPage;
