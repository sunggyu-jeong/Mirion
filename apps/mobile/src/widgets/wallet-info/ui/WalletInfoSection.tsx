import React from 'react';
import { Text, View } from 'react-native';

type WalletAddressCardProps = {
  address: string | null;
};

export function WalletAddressCard({ address }: WalletAddressCardProps) {
  return (
    <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, gap: 12 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#62748e',
          letterSpacing: -0.028,
          lineHeight: 21,
        }}
      >
        추적 중인 고래 주소
      </Text>
      <Text
        style={{ fontSize: 12, fontWeight: '400', color: '#0f172b', lineHeight: 18 }}
        numberOfLines={2}
      >
        {address ?? '-'}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#62748e',
          letterSpacing: -0.028,
          lineHeight: 21,
          width: 79,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: '400', color: '#0f172b', lineHeight: 18 }}>
        {value}
      </Text>
    </View>
  );
}

export function AppInfoCard() {
  return (
    <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, gap: 16 }}>
      <InfoRow
        label="버전"
        value="1.0.0"
      />
      <InfoRow
        label="네트워크"
        value="Ethereum Mainnet"
      />
    </View>
  );
}
