import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton } from '@shared/ui';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpinnerIcon } from './SpinnerIcon';

type WalletType = 'metamask' | 'coinbase';

const WALLET_LABELS: Record<WalletType, string> = {
  metamask: 'MetaMask',
  coinbase: 'Coinbase Wallet',
};

export function WalletConnectingScreen() {
  const { goBack } = useAppNavigation();
  const route = useRoute();
  const walletType = ((route.params as any)?.walletType ?? 'metamask') as WalletType;
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View style={[{ flex: 1 }, fadeStyle]}>
        <View className="flex-1 items-center justify-center gap-y-7">
          <SpinnerIcon walletType={walletType} />
          <View className="w-[266px] gap-y-3 items-center">
            <Text className="text-[22px] font-bold text-[#0f172b] leading-[1.4] tracking-[-0.198px] text-center">
              {WALLET_LABELS[walletType]} 연결 중...
            </Text>
            <Text className="text-[14px] text-[#62748e] leading-[1.5] text-center tracking-[-0.028px]">
              지갑 앱에서 연결 요청을 승인해주세요
            </Text>
          </View>
        </View>
        <View className="px-5 pb-8">
          <PrimaryButton
            label="취소"
            variant="secondary"
            onPress={goBack}
            height={52}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
