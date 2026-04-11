import type { ChainFilter } from '@entities/whale';
import { useAppNavigation } from '@shared/lib/navigation';
import { WhaleMovementList } from '@widgets/whale-movements';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_TITLE = (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172b', letterSpacing: -0.4 }}>
      고래 이동 레이더
    </Text>
  </View>
);

export function HistoryScreen() {
  const { toSettings } = useAppNavigation();
  const [selectedChain, setSelectedChain] = useState<ChainFilter>('ALL');

  const handleUpgrade = useCallback(() => toSettings(), [toSettings]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['top']}
    >
      <WhaleMovementList
        chainFilter={selectedChain}
        onChainChange={setSelectedChain}
        onUpgrade={handleUpgrade}
        headerTitle={HEADER_TITLE}
      />
    </SafeAreaView>
  );
}
