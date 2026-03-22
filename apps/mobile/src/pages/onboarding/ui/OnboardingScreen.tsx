import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OnboardingScreenProps = {
  onConnectWallet?: () => void;
};

export function OnboardingScreen({ onConnectWallet }: OnboardingScreenProps) {
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
        <TouchableOpacity
          className="h-[52px] bg-[#2b7fff] rounded-lg w-full items-center justify-center"
          onPress={onConnectWallet}
          activeOpacity={0.8}
        >
          <Text className="text-[16px] text-[#f8fafc]">내 지갑 연결하고 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
