import { ScreenTitle } from '@shared/ui';
import { TxHistoryWidget } from '@widgets/tx-history';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScreenTitle>내역</ScreenTitle>
      </View>
      <TxHistoryWidget />
    </SafeAreaView>
  );
}
