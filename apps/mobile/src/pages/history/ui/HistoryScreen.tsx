import { ScreenTitle, typography } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScreenTitle>내역</ScreenTitle>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>📭</Text>
        <Text style={[typography.heading1, { color: '#62748e', textAlign: 'center' }]}>
          아직 내역이 없습니다
        </Text>
      </View>
    </SafeAreaView>
  );
}
