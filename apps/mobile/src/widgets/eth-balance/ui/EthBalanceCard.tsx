import { useWalletStore } from '@entities/wallet';
import { useEthBalance } from '@features/eth-balance';
import { AnimatedNumber, InfoCard } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';
import { formatEther } from 'viem';

export function EthBalanceCard() {
  const address = useWalletStore(s => s.address);
  const { data: ethBalance } = useEthBalance(address);

  if (ethBalance === undefined) {
    return null;
  }

  const ethBalanceStr = `${parseFloat(formatEther(ethBalance)).toFixed(4)} ETH`;

  return (
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
  );
}
