import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton } from '@shared/ui';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type DepositSuccessParams = { unlockDateLabel: string };

export function DepositSuccessScreen() {
  const route = useRoute<RouteProp<{ DepositSuccess: DepositSuccessParams }, 'DepositSuccess'>>();
  const { unlockDateLabel } = route.params;
  const { toMain } = useAppNavigation();

  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);

  iconOpacity.value = withSpring(1, { damping: 20 });
  iconScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 180 }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 266, alignItems: 'center', gap: 28 }}>
          <Animated.View
            style={[
              {
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#f0f9ff',
                alignItems: 'center',
                justifyContent: 'center',
              },
              iconStyle,
            ]}
          >
            <Check
              size={28}
              color="#2b7fff"
            />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={{ alignItems: 'center', gap: 12, width: '100%' }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#0f172b',
                letterSpacing: -0.216,
                lineHeight: 33.6,
                textAlign: 'center',
              }}
            >
              예치가 완료되었습니다!
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                color: '#62748e',
                letterSpacing: -0.028,
                lineHeight: 21,
                textAlign: 'center',
              }}
            >
              만기일 : {unlockDateLabel}
            </Text>
          </Animated.View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <PrimaryButton
          label="홈으로 돌아가기"
          onPress={toMain}
        />
      </View>
    </SafeAreaView>
  );
}
