import { useLidoStore } from '@entities/lido';
import { useWalletStore } from '@entities/wallet';
import { useEthBalance, useLidoInfo, useLidoWithdraw } from '@features/lido';
import { useEthPrice, useEthPriceChart } from '@features/staking';
import { useAppNavigation } from '@shared/lib/navigation';
import type { BottomSheetRef } from '@shared/ui';
import { AnimatedNumber, BottomSheet, InfoCard, PrimaryButton, Skeleton } from '@shared/ui';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatEther, parseEther } from 'viem';

import { EthPriceChart } from './EthPriceChart';

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
      <Text style={{ fontSize: 12, fontWeight: '400', color: '#0f172b', lineHeight: 18 }}>
        {short}
      </Text>
    </View>
  );
}

function ApyTooltip({ apy, loading }: { apy: number; loading: boolean }) {
  if (loading) {
    return (
      <Skeleton
        width={120}
        height={18}
        borderRadius={6}
      />
    );
  }
  const label = apy > 0 ? `예상 APY ${apy.toFixed(1)}%` : '예상 APY 로딩 중...';
  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: '500',
        color: '#22c55e',
        letterSpacing: -0.028,
        lineHeight: 21,
      }}
    >
      {label}
      <Text style={{ fontSize: 11, color: '#62748e' }}> (예상치)</Text>
    </Text>
  );
}

function ProfitBadge({ stakedBalance, baseline }: { stakedBalance: bigint; baseline: bigint }) {
  if (baseline === 0n || stakedBalance <= baseline) {
    return null;
  }
  const profit = stakedBalance - baseline;
  const profitEth = parseFloat(formatEther(profit)).toFixed(6);
  return (
    <Text style={{ fontSize: 12, color: '#22c55e', fontWeight: '500' }}>
      누적 이자 +{profitEth} ETH
    </Text>
  );
}

const UNSTAKE_SHEET_HEIGHT = 320;

export function HomeScreen() {
  const address = useWalletStore(s => s.address);
  const { stakedBalance, estimatedApy, stakeBaseline } = useLidoStore();
  const { toDepositSetup } = useAppNavigation();
  const unstakeSheetRef = useRef<BottomSheetRef>(null);
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [unstakeError, setUnstakeError] = useState('');

  const { apyQuery } = useLidoInfo(address as `0x${string}` | null);
  const { data: ethBalance } = useEthBalance(address);
  const { data: ethPrice } = useEthPrice();
  const { data: chartPrices } = useEthPriceChart();
  const { requestWithdrawal, isPending: isWithdrawPending } = useLidoWithdraw();

  const hasStaked = stakedBalance > 0n;
  const stakedEthStr = hasStaked ? parseFloat(formatEther(stakedBalance)).toFixed(4) : '0';
  const ethBalanceStr =
    ethBalance !== undefined ? `${parseFloat(formatEther(ethBalance)).toFixed(4)} ETH` : null;

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (!amount || amount <= 0) {
      setUnstakeError('금액을 입력해주세요');
      return;
    }
    const amountWei = parseEther(unstakeAmount as `${number}`);
    if (amountWei > stakedBalance) {
      setUnstakeError('스테이킹 잔고를 초과합니다');
      return;
    }
    setUnstakeError('');
    try {
      await requestWithdrawal(amountWei);
      unstakeSheetRef.current?.close();
      setUnstakeAmount('');
    } catch {
      setUnstakeError('출금 요청에 실패했습니다');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <WalletBadge address={address} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* stETH 잔고 카드 */}
        <Animated.View entering={FadeInDown.delay(0).springify()}>
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
                스테이킹 잔고 (stETH)
              </Text>
              <AnimatedNumber
                value={hasStaked ? `${stakedEthStr} ETH` : '0 ETH'}
                fontSize={24}
                fontWeight="700"
                color="#0f172b"
                letterSpacing={-0.216}
              />
              {hasStaked ? (
                <View style={{ gap: 4 }}>
                  <ApyTooltip
                    apy={estimatedApy}
                    loading={apyQuery.isLoading}
                  />
                  <ProfitBadge
                    stakedBalance={stakedBalance}
                    baseline={stakeBaseline}
                  />
                </View>
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
                  스테이킹된 ETH가 없습니다
                </Text>
              )}
            </View>
          </InfoCard>
        </Animated.View>

        {/* ETH 잔액 카드 */}
        {ethBalanceStr !== null && (
          <Animated.View entering={FadeInDown.delay(40).springify()}>
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
                  지갑 ETH 잔액
                </Text>
                <AnimatedNumber
                  value={ethBalanceStr}
                  fontSize={20}
                  fontWeight="600"
                  color="#0f172b"
                  letterSpacing={-0.216}
                />
              </View>
            </InfoCard>
          </Animated.View>
        )}

        {/* ETH 시세 카드 */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
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
              <AnimatedNumber
                value={ethPrice?.price ?? '---'}
                fontSize={24}
                fontWeight="700"
                color="#0f172b"
                letterSpacing={-0.216}
              />
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
            {chartPrices && chartPrices.length >= 2 && <EthPriceChart prices={chartPrices} />}
          </InfoCard>
        </Animated.View>

        {/* 버튼 영역 */}
        <Animated.View
          entering={FadeInUp.delay(160).springify()}
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

      {/* 출금 BottomSheet */}
      <BottomSheet
        ref={unstakeSheetRef}
        height={UNSTAKE_SHEET_HEIGHT}
        bottomInset={32}
        horizontalInset={8}
      >
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172b', textAlign: 'center' }}>
            stETH 출금
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, color: '#62748e' }}>보유 stETH: {stakedEthStr} ETH</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 8,
              }}
            >
              <TextInput
                style={{ flex: 1, fontSize: 18, color: '#0f172b' }}
                placeholder="0.0"
                placeholderTextColor="#cad5e2"
                keyboardType="decimal-pad"
                value={unstakeAmount}
                onChangeText={v => {
                  setUnstakeAmount(v);
                  setUnstakeError('');
                }}
              />
              <Pressable
                onPress={() => setUnstakeAmount(parseFloat(formatEther(stakedBalance)).toFixed(6))}
              >
                <Text style={{ fontSize: 13, color: '#2b7fff', fontWeight: '700' }}>최대</Text>
              </Pressable>
            </View>
            {unstakeError ? (
              <Text style={{ fontSize: 12, color: '#fb2c36' }}>{unstakeError}</Text>
            ) : null}
          </View>
          <PrimaryButton
            label={isWithdrawPending ? '처리 중...' : '출금 요청'}
            onPress={handleUnstake}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
