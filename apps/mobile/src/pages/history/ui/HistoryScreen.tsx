import { useWhaleMovements } from '@features/whale-movements';
import { useAppNavigation } from '@shared/lib/navigation';
import { Skeleton } from '@shared/ui';
import { WhaleMovementList } from '@widgets/whale-movements';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HistoryScreen() {
  const { toSettings } = useAppNavigation();
  const { isLoading } = useWhaleMovements();

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', letterSpacing: -0.4 }}>
          고래 이동 레이더
        </Text>
        {isLoading ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Skeleton
              width={32}
              height={32}
              borderRadius={10}
              delay={0}
            />
            <Skeleton
              width={32}
              height={32}
              borderRadius={10}
              delay={60}
            />
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <WhaleMovementList onUpgrade={handleUpgrade} />
      </View>
    </SafeAreaView>
  );
}
