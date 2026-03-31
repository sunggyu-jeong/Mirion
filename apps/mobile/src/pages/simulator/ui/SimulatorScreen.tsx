import { useSimulator } from '@features/simulator';
import { GrowthChart, InfoCard } from '@shared/ui';
import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function SimulatorScreen() {
  const {
    apy,
    amountText,
    setAmountText,
    selectedMonths,
    selectAmount,
    selectMonths,
    result,
    durationOptions,
    quickAmounts,
  } = useSimulator();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-4 pb-10 gap-4"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}>
              <Text className="text-[22px] font-bold text-[#0f172b] tracking-tight">
                수익 시뮬레이터
              </Text>
              <Text className="text-sm text-[#62748e] mt-1">
                스테이킹하면 얼마나 벌 수 있는지 확인해보세요
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}>
              <InfoCard>
                <Text className="text-[13px] text-[#62748e] mb-2">스테이킹 금액</Text>
                <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3">
                  <TextInput
                    className="flex-1 text-[22px] font-bold text-[#0f172b]"
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#cad5e2"
                  />
                  <Text className="text-base font-semibold text-[#62748e]">ETH</Text>
                </View>
                <View className="flex-row gap-2 mt-[10px]">
                  {quickAmounts.map(v => (
                    <Pressable
                      key={v}
                      onPress={() => selectAmount(v)}
                      className={`flex-1 py-[6px] rounded-lg items-center ${amountText === v ? 'bg-[#2b7fff]' : 'bg-[#f1f5f9]'}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${amountText === v ? 'text-white' : 'text-[#62748e]'}`}
                      >
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </InfoCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(120).duration(260).easing(EASE_OUT)}>
              <InfoCard>
                <Text className="text-[13px] text-[#62748e] mb-2">스테이킹 기간</Text>
                <View className="flex-row flex-wrap gap-2">
                  {durationOptions.map(opt => (
                    <Pressable
                      key={opt.months}
                      onPress={() => selectMonths(opt.months)}
                      className={`px-4 py-2 rounded-full ${selectedMonths === opt.months ? 'bg-[#2b7fff]' : 'bg-[#f1f5f9]'}`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${selectedMonths === opt.months ? 'text-white' : 'text-[#62748e]'}`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </InfoCard>
            </Animated.View>

            {result && (
              <Animated.View entering={FadeInDown.delay(180).duration(260).easing(EASE_OUT)}>
                <InfoCard>
                  <View className="gap-1 mb-4">
                    <Text className="text-[13px] text-[#62748e]">
                      APY {apy.toFixed(1)}% 기준 예상 수익
                    </Text>
                    <Text className="text-[28px] font-bold text-[#22c55e] tracking-tight">
                      +{result.earned.toFixed(6)} ETH
                    </Text>
                    {result.earnedUsd && (
                      <Text className="text-sm text-[#62748e]">
                        ≈ ${Number(result.earnedUsd).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row justify-between py-3 border-t border-[#e2e8f0] mb-4">
                    <View>
                      <Text className="text-xs text-[#94a3b8]">원금</Text>
                      <Text className="text-[15px] font-semibold text-[#0f172b]">
                        {parseFloat(amountText).toFixed(4)} ETH
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-[#94a3b8]">최종 잔고</Text>
                      <Text className="text-[15px] font-semibold text-[#0f172b]">
                        {result.finalBalance.toFixed(6)} ETH
                      </Text>
                      {result.finalUsd && (
                        <Text className="text-xs text-[#62748e]">
                          ≈ ${Number(result.finalUsd).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  <GrowthChart
                    data={result.growthData}
                    xTicks={result.xTicks}
                  />
                </InfoCard>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(240).duration(260).easing(EASE_OUT)}>
              <Text className="text-[11px] text-[#94a3b8] text-center leading-4">
                {
                  '본 시뮬레이터는 현재 Lido APY 기준 예상치입니다.\n실제 수익은 시장 상황에 따라 달라질 수 있습니다.'
                }
              </Text>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
