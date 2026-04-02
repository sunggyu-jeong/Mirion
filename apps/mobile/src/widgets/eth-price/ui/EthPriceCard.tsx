import { useEthPrice, useEthPriceChart } from '@features/staking';
import { AnimatedNumber, InfoCard } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';

import { EthPriceChart } from './EthPriceChart';

export function EthPriceCard() {
  const { data: ethPrice } = useEthPrice();
  const { data: chartPrices } = useEthPriceChart();

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
  );
}
