import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WalletHeader } from '@/src/widgets/wallet-header/ui/WalletHeader';

export default function HomePage() {
  return (
    <SafeAreaView style={styles.container}>
      <WalletHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
