import { useAppNavigation } from '@shared/lib/navigation';
import { LEGAL_ACCEPTED_KEY, ONBOARDING_SEEN_KEY, storage } from '@shared/lib/storage';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function SplashScreen() {
  const { toOnboarding, toMain, toLegal } = useAppNavigation();

  const scale = useSharedValue(0.72);
  const opacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 420 });
    subtitleOpacity.value = withDelay(260, withTiming(1, { duration: 380 }));

    let timer: ReturnType<typeof setTimeout>;

    const init = () => {
      const onboardingSeen = storage.getString(ONBOARDING_SEEN_KEY);
      if (onboardingSeen) {
        timer = setTimeout(toMain, 1500);
        return;
      }

      const legalAccepted = storage.getString(LEGAL_ACCEPTED_KEY);
      if (!legalAccepted) {
        timer = setTimeout(toLegal, 2200);
        return;
      }

      timer = setTimeout(toOnboarding, 2200);
    };

    init();

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#2b7fff',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Animated.View style={[{ alignItems: 'center', gap: 10 }, logoStyle]}>
        <Text style={{ fontSize: 56 }}>🐋</Text>
        <Text
          style={{
            fontSize: 36,
            fontWeight: '900',
            color: 'white',
            letterSpacing: -1.2,
          }}
        >
          WhaleTracker
        </Text>
      </Animated.View>
      <Animated.Text
        style={[
          {
            fontSize: 14,
            color: 'rgba(255,255,255,0.72)',
            letterSpacing: -0.02,
            marginTop: 4,
          },
          subStyle,
        ]}
      >
        고래를 따라가세요
      </Animated.Text>
    </View>
  );
}
