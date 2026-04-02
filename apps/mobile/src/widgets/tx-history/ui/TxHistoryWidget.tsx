import { useTxStore } from '@entities/tx';
import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: '진행 중', color: '#2b7fff' },
  success: { label: '완료', color: '#22c55e' },
  error: { label: '실패', color: '#fb2c36' },
};

function TxEmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>📭</Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '400',
          color: '#62748e',
          lineHeight: 24,
          textAlign: 'center',
        }}
      >
        아직 트랜잭션 내역이 없습니다
      </Text>
    </View>
  );
}

function TxHistoryCard() {
  const { txHash, status, txType, amountEth, errorMessage } = useTxStore();
  const statusInfo = STATUS_LABEL[status] ?? STATUS_LABEL.pending;

  const openEtherscan = () => {
    if (!txHash) {
      return;
    }
    Linking.openURL(`https://etherscan.io/tx/${txHash}`);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(260).easing(EASE_OUT)}
      style={{ paddingHorizontal: 20, gap: 12 }}
    >
      <View
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          padding: 20,
          gap: 14,
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 15, color: '#0f172b', fontWeight: '700' }}>
            {txType === 'stake' ? 'ETH 스테이킹' : 'stETH 언스테이킹'}
          </Text>
          <View
            style={{
              backgroundColor: statusInfo.color + '18',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 12, color: statusInfo.color, fontWeight: '600' }}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {amountEth && (
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172b' }}>{amountEth} ETH</Text>
        )}

        {status === 'error' && errorMessage && (
          <Text style={{ fontSize: 13, color: '#fb2c36' }}>{errorMessage}</Text>
        )}

        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>트랜잭션 해시</Text>
          <Pressable onPress={openEtherscan}>
            <Text
              style={{ fontSize: 11, color: '#2b7fff', lineHeight: 16 }}
              numberOfLines={2}
            >
              {txHash}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={openEtherscan}
          style={{
            borderWidth: 1,
            borderColor: '#2b7fff',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 13, color: '#2b7fff', fontWeight: '600' }}>
            이더스캔에서 보기 →
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function TxHistoryWidget() {
  const { txHash } = useTxStore();
  if (!txHash) {
    return <TxEmptyState />;
  }
  return <TxHistoryCard />;
}
