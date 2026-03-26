import { useLockStore } from '@entities/lock';
import { useWalletStore } from '@entities/wallet';
import { useWithdraw } from '@features/staking';
import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton, ReceiptRow } from '@shared/ui';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatEther } from 'viem';

const ESTIMATED_GAS_ETH = 0.0005;
const PROTOCOL_FEE_RATE = 0.03;

export function SettlementReceiptModal() {
  const { goBack, toMain } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { balance, pendingReward } = useLockStore();
  const address = useWalletStore(s => s.address);
  const { withdraw, txState } = useWithdraw();
  const keyId = address ?? '';

  const dimOpacity = useSharedValue(0);
  const cardY = useSharedValue(600);

  useEffect(() => {
    dimOpacity.value = withTiming(1, { duration: 250 });
    cardY.value = withDelay(200, withSpring(0, { damping: 22, stiffness: 180 }));
  }, []);

  useEffect(() => {
    if (txState === 'success') {
      toMain();
    }
  }, [txState]);

  const dimStyle = useAnimatedStyle(() => ({ opacity: dimOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
  }));

  const principalEth = parseFloat(formatEther(balance));
  const interestEth = parseFloat(formatEther(pendingReward));
  const gasFee = ESTIMATED_GAS_ETH;
  const protocolFee = parseFloat((interestEth * PROTOCOL_FEE_RATE).toFixed(6));
  const finalAmount = Math.max(0, principalEth + interestEth - gasFee - protocolFee);

  const isProcessing = txState === 'biometric' || txState === 'broadcasting' || txState === 'pending';

  const handleWithdraw = () => {
    if (isProcessing) {
      return;
    }
    withdraw(keyId, true);
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={goBack}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
            dimStyle,
          ]}
        />
      </TouchableWithoutFeedback>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            {
              backgroundColor: '#fcfcfc',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: insets.bottom + 20,
              gap: 36,
            },
            cardStyle,
          ]}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#0f172b',
              letterSpacing: -0.198,
              lineHeight: 30.8,
              textAlign: 'center',
            }}
          >
            정산 영수증
          </Text>

          <View style={{ gap: 20 }}>
            <View
              style={{
                gap: 8,
                paddingBottom: 20,
                borderBottomWidth: 0.4,
                borderBottomColor: '#cad5e2',
              }}
            >
              <ReceiptRow
                label="예치 원금"
                amount={principalEth.toFixed(4)}
              />
              <ReceiptRow
                label="누적 이자"
                amount={`+${interestEth.toFixed(4)}`}
                amountColor="#fb2c36"
              />
            </View>

            <View
              style={{
                gap: 8,
                paddingBottom: 20,
                borderBottomWidth: 0.4,
                borderBottomColor: '#cad5e2',
              }}
            >
              <ReceiptRow
                label="가스비 정산"
                amount={`-${gasFee.toFixed(4)}`}
              />
              <ReceiptRow
                label="수수료 3%"
                amount={`-${protocolFee.toFixed(4)}`}
              />
            </View>

            <View style={{ paddingBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#0f172b',
                    letterSpacing: 0.48,
                    lineHeight: 24,
                  }}
                >
                  최종 수령액
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#0f172b',
                      letterSpacing: 0.48,
                      lineHeight: 24,
                    }}
                  >
                    {finalAmount.toFixed(4)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#0f172b',
                      letterSpacing: 0.48,
                      lineHeight: 24,
                    }}
                  >
                    ETH
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {isProcessing ? (
            <View style={{ alignItems: 'center', height: 52, justifyContent: 'center' }}>
              <ActivityIndicator
                color="#2b7fff"
                size="small"
              />
            </View>
          ) : (
            <PrimaryButton
              label="지갑으로 받기"
              onPress={handleWithdraw}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}
