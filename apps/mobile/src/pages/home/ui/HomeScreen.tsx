import { useLockStore } from '@entities/lock';
import { useWalletStore } from '@entities/wallet';
import { useEthPrice, useLockInfo } from '@features/staking';
import { useAppNavigation } from '@shared/lib/navigation';
import { InfoCard, PrimaryButton } from '@shared/ui';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Address } from 'viem';
import { formatEther } from 'viem';

const ESTIMATED_GAS_ETH = 0.0005;

function WalletBadge({ address }: { address: string | null }) {
  if (!address) {
    return null;
  }
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <View
      style={{
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-end',
        marginRight: 20,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#0f172b',
          lineHeight: 18,
        }}
      >
        {short}
      </Text>
    </View>
  );
}

type CountdownTime = { days: number; hours: number; minutes: number; seconds: number };

function calculateTimeLeft(unlockTimeSec: bigint): CountdownTime {
  const nowSec = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, Number(unlockTimeSec) - nowSec);
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
}

function CountdownDisplay({ unlockTime }: { unlockTime: bigint }) {
  const [time, setTime] = useState<CountdownTime>(calculateTimeLeft(unlockTime));
  const opacity = useSharedValue(1);
  const prevSeconds = useRef(time.seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calculateTimeLeft(unlockTime);
      if (next.seconds !== prevSeconds.current) {
        opacity.value = withSequence(
          withTiming(0.4, { duration: 80 }),
          withTiming(1, { duration: 120 }),
        );
        prevSeconds.current = next.seconds;
      }
      setTime(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [unlockTime, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={{ marginTop: 8, gap: 4 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#62748e',
          letterSpacing: -0.028,
          lineHeight: 21,
        }}
      >
        만기까지
      </Text>
      <Animated.Text
        style={[
          {
            fontSize: 24,
            fontWeight: '700',
            color: '#0f172b',
            letterSpacing: -0.216,
            lineHeight: 33.6,
          },
          animStyle,
        ]}
      >
        {time.days}일 {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
      </Animated.Text>
    </View>
  );
}

export function HomeScreen() {
  const address = useWalletStore(s => s.address);
  const { balance, unlockTime, pendingReward } = useLockStore();
  const { toDepositSetup, toSettlementReceipt } = useAppNavigation();

  useLockInfo(address as Address | null);
  const { data: ethPrice } = useEthPrice();

  const now = BigInt(Math.floor(Date.now() / 1000));
  const hasBalance = balance > 0n;
  const isUnlocked = unlockTime > 0n && now >= unlockTime;
  const isLocked = hasBalance && !isUnlocked;

  const rewardEth = parseFloat(formatEther(pendingReward));
  const isInterestLow = rewardEth > 0 && rewardEth < ESTIMATED_GAS_ETH;

  const unlockDateLabel =
    unlockTime > 0n
      ? new Date(Number(unlockTime) * 1000).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <WalletBadge address={address} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#62748e',
                letterSpacing: -0.028,
                lineHeight: 21,
              }}
            >
              예치 금액
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#0f172b',
                letterSpacing: -0.216,
                lineHeight: 33.6,
              }}
            >
              {hasBalance ? `${formatEther(balance)} ETH` : '0 ETH'}
            </Text>
            {hasBalance ? (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: isInterestLow ? '#fb2c36' : '#62748e',
                  letterSpacing: -0.028,
                  lineHeight: 21,
                }}
              >
                {isInterestLow
                  ? '이자 수익이 가스비보다 적습니다'
                  : `이자 수익 : ${rewardEth.toFixed(4)}`}
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: '#62748e',
                  letterSpacing: -0.028,
                  lineHeight: 21,
                }}
              >
                예치된 금액이 없습니다
              </Text>
            )}
          </View>
          {isLocked && unlockTime > 0n ? <CountdownDisplay unlockTime={unlockTime} /> : null}
          {unlockDateLabel && isLocked ? (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '400',
                color: '#62748e',
                lineHeight: 18,
                marginTop: 4,
              }}
            >
              만기일: {unlockDateLabel}
            </Text>
          ) : null}
        </InfoCard>

        <InfoCard>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#62748e',
                letterSpacing: -0.028,
                lineHeight: 21,
              }}
            >
              현재 이더리움 시세
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#0f172b',
                letterSpacing: -0.216,
                lineHeight: 33.6,
              }}
            >
              {ethPrice?.price ?? '---'}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: ethPrice ? (ethPrice.isPositive ? '#22c55e' : '#fb2c36') : '#62748e',
                letterSpacing: -0.028,
                lineHeight: 21,
              }}
            >
              {ethPrice?.change ?? '불러오는 중...'}
            </Text>
          </View>
          <View
            style={{
              height: 55,
              marginTop: 16,
              backgroundColor: '#fef2f2',
              borderRadius: 8,
              opacity: 0.5,
            }}
          />
        </InfoCard>

        {isUnlocked && hasBalance ? (
          <PrimaryButton
            label="정산하기"
            onPress={toSettlementReceipt}
          />
        ) : null}

        {!hasBalance ? (
          <PrimaryButton
            label="ETH 예치하기"
            onPress={toDepositSetup}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
