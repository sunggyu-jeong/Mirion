import { useLidoStore } from '@entities/lido';
import { useAppNavigation } from '@shared/lib/navigation';
import type { BottomSheetRef } from '@shared/ui';
import { PrimaryButton } from '@shared/ui';
import { EthBalanceCard } from '@widgets/eth-balance';
import { EthPriceCard } from '@widgets/eth-price';
import { StakingBalanceCard } from '@widgets/staking-balance';
import { UnstakeSheet } from '@widgets/unstake-sheet';
import React, { useRef } from 'react';
import { ScrollView } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function HomeScreen() {
  const { stakedBalance } = useLidoStore();
  const { toDepositSetup } = useAppNavigation();
  const unstakeSheetRef = useRef<BottomSheetRef>(null);

  const hasStaked = stakedBalance > 0n;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}>
          <StakingBalanceCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}>
          <EthBalanceCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}>
          <EthPriceCard />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(180).duration(260).easing(EASE_OUT)}
          style={{ gap: 12 }}
        >
          <PrimaryButton
            label="ETH 스테이킹하기"
            onPress={toDepositSetup}
          />
          {hasStaked && (
            <PrimaryButton
              label="stETH 출금하기"
              variant="secondary"
              onPress={() => unstakeSheetRef.current?.open()}
            />
          )}
        </Animated.View>
      </ScrollView>

      <UnstakeSheet sheetRef={unstakeSheetRef} />
    </SafeAreaView>
  );
}
