import type { ChainFilter } from '@entities/whale';
import { useAppNavigation } from '@shared/lib/navigation';
import { UnifiedActivityList } from '@widgets/unified-activity';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_TITLE = (
  <View className="flex-row items-center justify-between">
    <Text className="text-[22px] font-extrabold tracking-tight text-[#0f172b]">
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
      className="flex-1 bg-white"
      edges={['top']}
    >
      <UnifiedActivityList
        chainFilter={selectedChain}
        onChainChange={setSelectedChain}
        onUpgrade={handleUpgrade}
        headerTitle={HEADER_TITLE}
      />
    </SafeAreaView>
  );
}
