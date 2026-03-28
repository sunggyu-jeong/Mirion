import React from 'react';
import { Text, View } from 'react-native';

type ReceiptRowProps = {
  label: string;
  amount: string;
  unit?: string;
  amountColor?: string;
};

export function ReceiptRow({
  label,
  amount,
  unit = 'ETH',
  amountColor = '#0f172b',
}: ReceiptRowProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '400',
          color: '#62748e',
          letterSpacing: -0.16,
          lineHeight: 24,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            color: amountColor,
            letterSpacing: -0.16,
            lineHeight: 24,
          }}
        >
          {amount}
        </Text>
        {unit ? (
          <Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              color: amountColor,
              letterSpacing: -0.16,
              lineHeight: 24,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
