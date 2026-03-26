import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { DisclaimerBox, PrimaryButton } from '@shared/ui';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DepositConfirmParams = { amountEth: string; unlockDate: string };

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function formatFullDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SummaryCard({ amountEth, unlockDate }: { amountEth: string; unlockDate: string }) {
  return (
    <View
      style={{
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 16,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#62748e',
            letterSpacing: 0.48,
            lineHeight: 24,
          }}
        >
          잠금 금액
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#0f172b',
            letterSpacing: 0.48,
            lineHeight: 24,
          }}
        >
          {amountEth} ETH
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#62748e',
            letterSpacing: 0.48,
            lineHeight: 24,
          }}
        >
          잠긴 일시
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#0f172b',
            letterSpacing: 0.48,
            lineHeight: 24,
          }}
        >
          {formatDateLabel(unlockDate)}
        </Text>
      </View>
    </View>
  );
}

export function DepositConfirmScreen() {
  const route = useRoute<RouteProp<{ DepositConfirm: DepositConfirmParams }, 'DepositConfirm'>>();
  const { amountEth, unlockDate } = route.params;
  const { goBack, toTransactionProgress } = useAppNavigation();
  const [isAgreed, setIsAgreed] = useState(false);

  const handleLock = () => {
    if (!isAgreed) {
      return;
    }
    const unlockTimestamp = BigInt(Math.floor(new Date(unlockDate).getTime() / 1000));
    toTransactionProgress({
      amountEth,
      unlockTimestamp: unlockTimestamp.toString(),
      unlockDateLabel: formatFullDateLabel(unlockDate),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View
        style={{
          paddingHorizontal: 20,
          height: 56,
          justifyContent: 'center',
        }}
      >
        <Pressable
          onPress={goBack}
          hitSlop={12}
        >
          <X
            size={24}
            color="#0f172b"
          />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#0f172b',
            letterSpacing: -0.198,
            lineHeight: 30.8,
            marginBottom: 12,
          }}
        >
          잠그기 전 마지막으로 확인해주세요
        </Text>

        <SummaryCard
          amountEth={amountEth}
          unlockDate={unlockDate}
        />

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
          label="지갑 잠그기"
          onPress={handleLock}
          variant={isAgreed ? 'primary' : 'secondary'}
        />
      </View>
    </SafeAreaView>
  );
}
