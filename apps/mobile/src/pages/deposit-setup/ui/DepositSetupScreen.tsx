import { useLidoStore } from '@entities/lido';
import { useWalletStore } from '@entities/wallet';
import { useEthBalance } from '@features/lido';
import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton, ScreenHeader, ScreenTitle } from '@shared/ui';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatEther } from 'viem';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function DepositSetupScreen() {
  const { goBack, toDepositConfirm } = useAppNavigation();
  const address = useWalletStore(s => s.address);
  const { estimatedApy } = useLidoStore();
  const [amountEth, setAmountEth] = useState('');

  const { data: ethBalanceWei } = useEthBalance(address);
  const balance = ethBalanceWei !== undefined ? formatEther(ethBalanceWei) : null;

  const parsedAmount = parseFloat(amountEth);
  const parsedBalance = balance !== null ? parseFloat(balance) : null;
  const exceedsBalance = parsedBalance !== null && parsedAmount > parsedBalance;
  const isValid = parsedAmount > 0 && !exceedsBalance;

  const handleConfirm = () => {
    if (!isValid) {
      return;
    }
    toDepositConfirm({ amountEth, unlockDate: '' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ flex: 1 }}>
            <ScreenHeader onClose={goBack} />

            <View style={{ paddingHorizontal: 20, flex: 1, gap: 28, marginTop: 8 }}>
              <Animated.View
                entering={FadeInDown.duration(260).easing(EASE_OUT)}
                style={{ gap: 20 }}
              >
                <ScreenTitle>얼마나 스테이킹할까요?</ScreenTitle>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TextInput
                    style={{
                      fontSize: 24,
                      fontWeight: '400',
                      color: '#0f172b',
                      letterSpacing: -0.216,
                      minWidth: 60,
                      flex: 0,
                      padding: 0,
                      includeFontPadding: false,
                    }}
                    placeholder="0.0"
                    placeholderTextColor="#cad5e2"
                    keyboardType="decimal-pad"
                    value={amountEth}
                    onChangeText={setAmountEth}
                    autoFocus
                  />
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '400',
                      color: '#0f172b',
                      letterSpacing: -0.216,
                      lineHeight: 36,
                    }}
                  >
                    ETH
                  </Text>
                </View>

                {balance !== null && (
                  <Animated.View
                    entering={FadeIn.duration(300)}
                    style={{ gap: 6 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 14, color: '#62748e' }}>
                        잔액: {parseFloat(balance).toFixed(4)} ETH
                      </Text>
                      <Pressable
                        onPress={() => setAmountEth(parseFloat(balance).toFixed(6))}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                          backgroundColor: '#2b7fff',
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: '#fff', fontWeight: '700' }}>최대</Text>
                      </Pressable>
                    </View>
                    {exceedsBalance && (
                      <Text style={{ fontSize: 13, color: '#fb2c36' }}>
                        잔액을 초과할 수 없습니다
                      </Text>
                    )}
                  </Animated.View>
                )}
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(100).duration(260).easing(EASE_OUT)}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 16,
                  padding: 16,
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 13, color: '#62748e', fontWeight: '500' }}>
                  Lido stETH 스테이킹 정보
                </Text>
                <Text style={{ fontSize: 15, color: '#0f172b', fontWeight: '600' }}>
                  예상 연수익 (APY){' '}
                  <Text style={{ color: '#22c55e' }}>
                    {estimatedApy > 0 ? `${estimatedApy.toFixed(1)}%` : '로딩 중...'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}> (예상치)</Text>
                </Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', lineHeight: 18 }}>
                  LockFi는 자산을 직접 보관하지 않습니다. 귀하의 ETH는 Lido 스마트 컨트랙트에 직접
                  스테이킹됩니다.
                </Text>
              </Animated.View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <PrimaryButton
                label="확인"
                onPress={handleConfirm}
                variant={isValid ? 'primary' : 'secondary'}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
