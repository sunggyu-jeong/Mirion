import { useLidoStore } from '@entities/lido';
import { useWalletStore } from '@entities/wallet';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { publicClient } from '@shared/lib/web3/client';
import { DisclaimerBox, PrimaryButton, ReceiptRow, ScreenHeader, ScreenTitle } from '@shared/ui';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Address } from 'viem';
import { parseEther } from 'viem';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

type DepositConfirmParams = { amountEth: string; unlockDate: string };

export function DepositConfirmScreen() {
  const route = useRoute<RouteProp<{ DepositConfirm: DepositConfirmParams }, 'DepositConfirm'>>();
  const { amountEth } = route.params;
  const { goBack, toTransactionProgress, toError } = useAppNavigation();
  const address = useWalletStore(s => s.address);
  const { estimatedApy } = useLidoStore();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleStake = async () => {
    if (!isAgreed) {
      return;
    }
    setIsChecking(true);
    try {
      const balance = await publicClient.getBalance({ address: address as Address });
      if (balance < parseEther(amountEth)) {
        toError({ errorType: 'balance' });
        return;
      }
    } catch {
      // 잔액 조회 실패 시 통과
    } finally {
      setIsChecking(false);
    }
    toTransactionProgress({
      amountEth,
      unlockTimestamp: '0',
      unlockDateLabel: '',
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ScreenHeader onClose={goBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle style={{ marginBottom: 12 }}>스테이킹 전 마지막으로 확인해주세요</ScreenTitle>

        <Animated.View
          entering={FadeInDown.delay(50).duration(260).easing(EASE_OUT)}
          style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, gap: 6 }}
        >
          <ReceiptRow
            label="스테이킹 금액"
            amount={amountEth}
            unit="ETH"
          />
          <ReceiptRow
            label="예상 연수익 (APY)"
            amount={estimatedApy > 0 ? `${estimatedApy.toFixed(1)}%` : '-'}
            unit=""
          />
          <ReceiptRow
            label="수령 토큰"
            amount="stETH (Lido)"
            unit=""
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}>
          <DisclaimerBox
            title="비수탁형 서비스 안내"
            body="LockFi는 귀하의 자산을 직접 보관하지 않습니다. ETH는 Lido 스마트 컨트랙트에 직접 예치되며, 예상 수익률은 과거 데이터 기반의 예상치로 실제 수익을 보장하지 않습니다."
            highlightedText="실제 수익을 보장하지 않습니다"
          />
        </Animated.View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          onPress={() => setIsAgreed(prev => !prev)}
        >
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: isAgreed ? '#2b7fff' : '#cad5e2',
              backgroundColor: isAgreed ? '#2b7fff' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAgreed && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }} />
            )}
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '400',
              color: '#62748e',
              letterSpacing: -0.028,
              lineHeight: 21,
            }}
          >
            위 내용을 확인했으며, 동의합니다.
          </Text>
        </Pressable>

        <PrimaryButton
          label={isChecking ? '확인 중...' : 'ETH 스테이킹하기'}
          onPress={handleStake}
          variant={isAgreed && !isChecking ? 'primary' : 'secondary'}
        />
      </View>
    </SafeAreaView>
  );
}
