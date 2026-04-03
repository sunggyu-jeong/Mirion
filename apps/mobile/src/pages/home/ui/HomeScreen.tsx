import { EthBalanceCard } from '@widgets/eth-balance';
import { EthPriceCard } from '@widgets/eth-price';
import React from 'react';
import { ScrollView } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(260).easing(EASE_OUT)}>
          <EthBalanceCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(260).easing(EASE_OUT)}>
          <EthPriceCard />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
