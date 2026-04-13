import { Bell } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MirionHeaderProps {
  scrollY: SharedValue<number>;
  onNotificationPress?: () => void;
}

export function MirionHeader({ scrollY, onNotificationPress }: MirionHeaderProps) {
  const insets = useSafeAreaInsets();

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollY.value,
      [0, 60],
      ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)'],
    ),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 80], [0, 1], 'clamp'),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: insets.top,
        },
        backdropStyle,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: '#0f172b',
            letterSpacing: -0.5,
          }}
        >
          미리온
        </Text>

        <Pressable
          onPress={onNotificationPress}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: pressed ? '#f1f5f9' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Bell
            size={22}
            color="#0f172b"
            strokeWidth={1.8}
          />
        </Pressable>
      </View>

      <Animated.View
        style={[
          {
            height: 0.5,
            backgroundColor: '#e8edf2',
            marginHorizontal: 0,
          },
          borderStyle,
        ]}
      />
    </Animated.View>
  );
}
