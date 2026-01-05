import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LockupCard } from '@/src/widgets/lockup-card/ui/LockupCard';

export const HomePage = () => {
  //fixme: 데이터 연동 필요
  const hasLockup = true;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.cardWrapper}>
          {hasLockup ? (
            <LockupCard
              amount="0.5"
              unlockTime={1740000000}
              onWithdrawPress={() => console.log('TODO:: Trigger Withdraw Feature')}
            />
          ) : (
            <View style={styles.emptyContainer}></View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cardWrapper: {
    marginTop: 32,
  },
  emptyContainer: {
    marginHorizontal: 20,
  },
});
