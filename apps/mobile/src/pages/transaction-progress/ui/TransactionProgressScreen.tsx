import { useTxStore } from '@entities/tx';
import { useLidoSubmit } from '@features/lido';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { ScreenHeader, ScreenTitle, StepIndicator } from '@shared/ui';
import type { Step } from '@shared/ui/StepIndicator';
import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseEther } from 'viem';

type TransactionProgressParams = {
  amountEth: string;
  unlockTimestamp: string;
  unlockDateLabel: string;
};

const STEPS: Step[] = [
  { label: '트랜잭션 승인', subtitle: '지갑에서 트랜잭션을 승인해주세요' },
  { label: '스테이킹 진행 중', subtitle: '블록체인에 기록 중입니다' },
  { label: '확인 대기', subtitle: '트랜잭션이 확인되고 있습니다' },
];

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

function SpinnerRing() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: '#f1f5f9',
          borderTopColor: '#2b7fff',
        },
        animatedStyle,
      ]}
    />
  );
}

export function TransactionProgressScreen() {
  const route =
    useRoute<
      RouteProp<{ TransactionProgress: TransactionProgressParams }, 'TransactionProgress'>
    >();
  const { amountEth } = route.params;
  const { toDepositSuccess, toError, goBack } = useAppNavigation();
  const { submit } = useLidoSubmit();
  const txStatus = useTxStore(s => s.status);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    submit(parseEther(amountEth as `${number}`)).catch(() => {});
  }, []);

  useEffect(() => {
    if (txStatus === 'success') {
      toDepositSuccess({ unlockDateLabel: '' });
    } else if (txStatus === 'error') {
      toError({ errorType: 'transaction' });
    }
  }, [txStatus]);

  const activeStep =
    txStatus === 'idle' ? 0 : txStatus === 'pending' ? 1 : txStatus === 'success' ? 2 : 0;

  const stepsWithActiveSub: Step[] = STEPS.map((step, index) => ({
    ...step,
    subtitle: index === activeStep ? step.subtitle : undefined,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      {txStatus === 'error' ? <ScreenHeader onClose={goBack} /> : <View style={{ height: 56 }} />}

      <Animated.View
        entering={FadeInDown.delay(50).duration(260).easing(EASE_OUT)}
        style={{ paddingHorizontal: 20, gap: 8, marginBottom: 40 }}
      >
        <ScreenTitle style={{ textAlign: 'center' }}>스테이킹 진행 중...</ScreenTitle>
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

      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        {txStatus === 'success' ? (
          <Animated.Text
            entering={FadeInDown.duration(240).easing(EASE_OUT)}
            style={{ fontSize: 32 }}
          >
            ✓
          </Animated.Text>
        ) : (
          <SpinnerRing />
        )}
      </View>

      <View style={{ paddingHorizontal: 21 }}>
        <StepIndicator
          steps={stepsWithActiveSub}
          activeStep={activeStep}
        />
      </View>
    </SafeAreaView>
  );
}
