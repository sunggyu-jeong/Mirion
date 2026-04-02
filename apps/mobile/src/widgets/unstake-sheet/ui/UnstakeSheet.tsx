import { useLidoStore } from '@entities/lido';
import { useUnstake } from '@features/lido';
import type { BottomSheetRef } from '@shared/ui';
import { BottomSheet, PrimaryButton } from '@shared/ui';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { formatEther } from 'viem';

type Props = {
  sheetRef: React.RefObject<BottomSheetRef>;
};

export function UnstakeSheet({ sheetRef }: Props) {
  const { stakedBalance } = useLidoStore();
  const { amount, error, setAmount, setMax, submit, isPending } = useUnstake();

  const stakedEthStr = stakedBalance > 0n ? parseFloat(formatEther(stakedBalance)).toFixed(4) : '0';

  const handleUnstake = async () => {
    const success = await submit();
    if (success) {
      sheetRef.current?.close();
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      height={320}
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
              value={amount}
              onChangeText={setAmount}
            />
            <Pressable onPress={setMax}>
              <Text style={{ fontSize: 13, color: '#2b7fff', fontWeight: '700' }}>최대</Text>
            </Pressable>
          </View>
          {error ? <Text style={{ fontSize: 12, color: '#fb2c36' }}>{error}</Text> : null}
        </View>
        <PrimaryButton
          label={isPending ? '처리 중...' : '출금 요청'}
          onPress={handleUnstake}
        />
      </View>
    </BottomSheet>
  );
}
