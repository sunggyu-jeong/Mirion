import { useWalletStore } from '@entities/wallet';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { formatDate, formatFullDate } from '@shared/lib/date';
import { useAppNavigation } from '@shared/lib/navigation';
import { publicClient } from '@shared/lib/web3/client';
import { DisclaimerBox, PrimaryButton, ReceiptRow, ScreenHeader, ScreenTitle } from '@shared/ui';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Address } from 'viem';
import { parseEther } from 'viem';

type DepositConfirmParams = { amountEth: string; unlockDate: string };

export function DepositConfirmScreen() {
  const route = useRoute<RouteProp<{ DepositConfirm: DepositConfirmParams }, 'DepositConfirm'>>();
  const { amountEth, unlockDate } = route.params;
  const { goBack, toTransactionProgress, toError } = useAppNavigation();
  const address = useWalletStore(s => s.address);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleLock = async () => {
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
      // 잔액 조회 실패 시 통과 — 트랜잭션 단계에서 처리
    } finally {
      setIsChecking(false);
    }
    const unlockTimestamp = BigInt(Math.floor(new Date(unlockDate).getTime() / 1000));
    toTransactionProgress({
      amountEth,
      unlockTimestamp: unlockTimestamp.toString(),
      unlockDateLabel: formatFullDate(new Date(unlockDate)),
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
        <ScreenTitle style={{ marginBottom: 12 }}>잠그기 전 마지막으로 확인해주세요</ScreenTitle>

        <View
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: 12,
            padding: 16,
            gap: 6,
          }}
        >
          <ReceiptRow
            label="잠금 금액"
            amount={amountEth}
            unit="ETH"
          />
          <ReceiptRow
            label="잠긴 일시"
            amount={formatDate(new Date(unlockDate))}
            unit=""
          />
        </View>

        <DisclaimerBox
          title="원금 차감 가능성 안내"
          body="가스비 대납 혜택을 드리고 있으나,발생한 이자보다 대납 가스비가 많으면 부족한 만큼 원금에서 정산됩니다."
          highlightedText="부족한 만큼 원금에서 정산"
        />
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
            {isAgreed ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'white',
                }}
              />
            ) : null}
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
            위 위험 요소를 확인했으며, 동의 합니다.
          </Text>
        </Pressable>

        <PrimaryButton
          label={isChecking ? '확인 중...' : '지갑 잠그기'}
          onPress={handleLock}
          variant={isAgreed && !isChecking ? 'primary' : 'secondary'}
        />
      </View>
    </SafeAreaView>
  );
}
