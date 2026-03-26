import { useWalletStore } from '@entities/wallet';
import { useGaslessDeposit } from '@features/staking';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

type TransactionProgressParams = { amountEth: string; unlockTimestamp: string; unlockDateLabel: string };
import { useAppNavigation } from '@shared/lib/navigation';
import { StepIndicator } from '@shared/ui';
import type { Step } from '@shared/ui/StepIndicator';
import { X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseEther } from 'viem';

const STEPS: Step[] = [
  { label: '트랜잭션 승인', subtitle: '지갑에서 트랜잭션을 승인해주세요' },
  { label: '예치 진행 중', subtitle: '블록체인에 기록 중입니다' },
  { label: '확인 대기', subtitle: '트랜잭션이 확인되고 있습니다' },
];

function txStateToStep(txState: string): number {
  if (txState === 'biometric') {
    return 0;
  }
  if (txState === 'broadcasting' || txState === 'pending') {
    return 1;
  }
  if (txState === 'success') {
    return 2;
  }
  return 0;
}

export function TransactionProgressScreen() {
  const route = useRoute<RouteProp<{ TransactionProgress: TransactionProgressParams }, 'TransactionProgress'>>();
  const { amountEth, unlockTimestamp, unlockDateLabel } = route.params;
  const { toDepositSuccess, toError, goBack } = useAppNavigation();
  const address = useWalletStore(s => s.address);
  const { gaslessDeposit, txState } = useGaslessDeposit();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !address) {
      return;
    }
    started.current = true;

    const amountWei = parseEther(amountEth as `${number}`);
    const unlockTs = BigInt(unlockTimestamp);
    gaslessDeposit(amountWei, unlockTs, address);
  }, [address]);

  useEffect(() => {
    if (txState === 'success') {
      toDepositSuccess({ unlockDateLabel });
    } else if (txState === 'error') {
      toError({ errorType: 'transaction' });
    }
  }, [txState]);

  const activeStep = txStateToStep(txState);

  const stepsWithActiveSub: Step[] = STEPS.map((step, index) => ({
    ...step,
    subtitle: index === activeStep ? step.subtitle : undefined,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View
        style={{
          paddingHorizontal: 20,
          height: 56,
          justifyContent: 'center',
        }}
      >
        {txState === 'error' ? (
          <Pressable hitSlop={12} onPress={goBack}>
            <X
              size={24}
              color="#0f172b"
            />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <Animated.View
        entering={FadeInDown.delay(50).springify()}
        style={{ paddingHorizontal: 20, gap: 8, marginBottom: 40 }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#0f172b',
            letterSpacing: -0.198,
            lineHeight: 30.8,
            textAlign: 'center',
          }}
        >
          금고를 잠그는 중...
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: '#62748e',
            letterSpacing: -0.028,
            lineHeight: 21,
            textAlign: 'center',
          }}
        >
          잠시만 기다려 주세요
        </Text>
      </Animated.View>

      <View style={{ paddingHorizontal: 21 }}>
        <StepIndicator
          steps={stepsWithActiveSub}
          activeStep={activeStep}
        />
      </View>
    </SafeAreaView>
  );
}
