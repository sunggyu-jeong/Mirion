import { useTxStore } from '@entities/tx';
import { ScreenTitle } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
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

export function HistoryScreen() {
  const { txHash, status, txType } = useTxStore();
  const hasHistory = !!txHash;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <ScreenTitle>내역</ScreenTitle>
      </View>
      {!hasHistory ? (
        <EmptyState />
      ) : (
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            marginHorizontal: 20,
            backgroundColor: '#f8fafc',
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#62748e', fontWeight: '500' }}>
              {txType === 'stake' ? 'stETH 스테이킹' : 'stETH 언스테이킹'}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color:
                  status === 'success' ? '#22c55e' : status === 'error' ? '#fb2c36' : '#2b7fff',
                fontWeight: '500',
              }}
            >
              {status === 'success' ? '완료' : status === 'error' ? '실패' : '진행 중'}
            </Text>
          </View>
          <Text
            style={{ fontSize: 11, color: '#94a3b8', lineHeight: 16 }}
            numberOfLines={1}
          >
            {txHash}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
