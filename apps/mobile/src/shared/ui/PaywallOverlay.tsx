import { Lock } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TOSS_PRESS = { damping: 15, stiffness: 400 } as const;

type Props = {
  visible: boolean;
  message?: string;
  onUpgrade: () => void;
};

export function PaywallOverlay({ visible, message = '프로 전용 콘텐츠입니다', onUpgrade }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <OverlayContent
      message={message}
      onUpgrade={onUpgrade}
    />
  );
}

function OverlayContent({ message, onUpgrade }: { message: string; onUpgrade: () => void }) {
  const scale = useSharedValue(1);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        ...{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#f1f5f9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Lock
          size={20}
          color="#0f172b"
          strokeWidth={2}
        />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#0f172b',
          textAlign: 'center',
          letterSpacing: -0.02,
        }}
      >
        {message}
      </Text>
      <Animated.View
        style={[
          {
            backgroundColor: '#2b7fff',
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 10,
          },
          btnStyle,
        ]}
      >
        <Text
          onPress={() => {
            scale.value = withSpring(0.95, TOSS_PRESS);
            setTimeout(() => {
              scale.value = withTiming(1, {
                duration: 200,
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              });
              onUpgrade();
            }, 100);
          }}
          style={{ fontSize: 14, fontWeight: '600', color: 'white', letterSpacing: -0.02 }}
        >
          프로 구독하기
        </Text>
      </Animated.View>
    </View>
  );
}
