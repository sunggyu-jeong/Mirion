import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type ErrorStateViewProps = {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: readonly string[];
};

export function ErrorStateView({
  icon,
  iconBg = '#f1f5f9',
  title,
  description,
}: ErrorStateViewProps) {
  const iconScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 266, alignItems: 'center', gap: 28 }}>
        <Animated.View
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: iconBg,
              alignItems: 'center',
              justifyContent: 'center',
            },
            iconStyle,
          ]}
        >
          {icon}
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
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
            {title}
          </Text>
          <View style={{ alignItems: 'center' }}>
            {description.map((line, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: '#62748e',
                  letterSpacing: -0.028,
                  lineHeight: 21,
                  textAlign: 'center',
                }}
              >
                {line}
              </Text>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
