import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton } from '@shared/ui';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function OnboardingScreen() {
  const { toMain } = useAppNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <View className="w-[266px] items-center">
          <Text className="text-[22px] font-bold text-[#0f172b] leading-[1.4] tracking-[-0.198px] text-center">
            {'강제 저축으로 자산관리 챙기는\n가장 스마트한 방법'}
          </Text>
          <View className="h-3" />
          <Text className="text-[14px] text-[#62748e] leading-[1.5] text-center">
            지금 손대는 이더리움,확실하게 잠궈드려요
          </Text>
        </View>
      </View>
      <View className="px-5 pb-8">
        <PrimaryButton
          label="내 지갑 연결하고 시작하기"
          onPress={toMain}
          height={52}
        />
      </View>
    </SafeAreaView>
  );
}
