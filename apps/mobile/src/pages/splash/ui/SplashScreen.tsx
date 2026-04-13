import { useAppNavigation } from '@shared/lib/navigation';
import { LEGAL_ACCEPTED_KEY, ONBOARDING_SEEN_KEY, storage } from '@shared/lib/storage';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function SplashScreen() {
  const { toMain, toOnboarding, toLegal } = useAppNavigation();
  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);

    const timer = setTimeout(() => {
      const hasAcceptedLegal = storage.getString(LEGAL_ACCEPTED_KEY);
      const hasSeenOnboarding = storage.getString(ONBOARDING_SEEN_KEY);

      if (!hasAcceptedLegal) {
        toLegal();
      } else if (!hasSeenOnboarding) {
        toOnboarding();
      } else {
        toMain();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [logoScale, toLegal, toMain, toOnboarding]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#2b7fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        entering={FadeIn.duration(600)}
        style={[animatedStyle, { alignItems: 'center', gap: 16 }]}
      >
        <Text style={{ fontSize: 80 }}>🐋</Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: 'white', letterSpacing: -0.5 }}>
          WhaleTracker
        </Text>
      </Animated.View>
    </View>
  );
}
