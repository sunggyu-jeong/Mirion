import { useAppNavigation } from '@shared/lib/navigation';
import { ScreenTitle } from '@shared/ui';
import { WhaleMovementList } from '@widgets/whale-movements';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HistoryScreen() {
  const { toSettings } = useAppNavigation();

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        <ScreenTitle>고래 이동 레이더</ScreenTitle>
      </View>
      <View style={{ flex: 1 }}>
        <WhaleMovementList onUpgrade={handleUpgrade} />
      </View>
    </SafeAreaView>
  );
}
