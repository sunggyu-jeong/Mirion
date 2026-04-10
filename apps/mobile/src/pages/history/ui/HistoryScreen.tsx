import type { ChainFilter } from '@entities/whale';
import { useWhaleMovements } from '@features/whale-movements';
import { useAppNavigation } from '@shared/lib/navigation';
import { ChainFilterBar, Skeleton } from '@shared/ui';
import { WhaleMovementList } from '@widgets/whale-movements';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HistoryScreen() {
  const { toSettings } = useAppNavigation();
  const [selectedChain, setSelectedChain] = useState<ChainFilter>('ALL');
  const { isLoading } = useWhaleMovements(selectedChain);

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
          gap: 12,
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
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
        <ChainFilterBar
          value={selectedChain}
          onChange={setSelectedChain}
        />
      </View>
      <View style={{ flex: 1 }}>
        <WhaleMovementList
          chainFilter={selectedChain}
          onUpgrade={handleUpgrade}
        />
      </View>
    </SafeAreaView>
  );
}
