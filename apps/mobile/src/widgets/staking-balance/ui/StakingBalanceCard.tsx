import { useLidoStore } from '@entities/lido';
import { useWalletStore } from '@entities/wallet';
import { useLidoInfo } from '@features/lido';
import { AnimatedNumber, InfoCard, Skeleton } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';
import { formatEther } from 'viem';

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

export function StakingBalanceCard() {
  const address = useWalletStore(s => s.address);
  const { stakedBalance, estimatedApy, stakeBaseline } = useLidoStore();
  const { apyQuery } = useLidoInfo(address as `0x${string}` | null);

  const hasStaked = stakedBalance > 0n;
  const stakedEthStr = hasStaked ? parseFloat(formatEther(stakedBalance)).toFixed(4) : '0';

  return (
    <>
      <WalletBadge address={address} />
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
    </>
  );
}
