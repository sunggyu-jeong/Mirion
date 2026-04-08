import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, List, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#2b7fff';
const INACTIVE_COLOR = '#94a3b8';

const TOSS_SPRING = { damping: 20, stiffness: 300, mass: 0.8 } as const;
const TOSS_PRESS_SPRING = { damping: 15, stiffness: 400 } as const;

type TabConfig = {
  name: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
};

const TABS: TabConfig[] = [
  { name: 'Home', label: '홈', Icon: Home },
  { name: 'History', label: '레이더', Icon: List },
  { name: 'Settings', label: '설정', Icon: Settings },
];

function TabItem({
  config,
  isActive,
  onPress,
}: {
  config: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: 180,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [isActive, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [INACTIVE_COLOR, ACTIVE_COLOR]),
  }));

  const { Icon } = config;

  return (
    <Pressable
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 8 }}
      onPressIn={() => {
        scale.value = withSpring(0.88, TOSS_PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, TOSS_PRESS_SPRING);
      }}
      onPress={onPress}
    >
      <Animated.View style={[{ alignItems: 'center', gap: 3 }, containerStyle]}>
        <Icon
          size={22}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
        <Animated.Text
          style={[
            { fontSize: 10, letterSpacing: 0.1, fontWeight: isActive ? '600' : '400' },
            textStyle,
          ]}
        >
          {config.label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const slotWidth = barWidth > 0 ? barWidth / TABS.length : 0;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (barWidth === 0) {
      return;
    }
    indicatorX.value = withSpring(state.index * slotWidth + slotWidth / 2 - 16, TOSS_SPRING);
  }, [state.index, barWidth, slotWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: '#e8edf2',
        paddingBottom: insets.bottom,
      }}
      onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
    >
      {barWidth > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: 32,
              height: 2.5,
              borderRadius: 2,
              backgroundColor: ACTIVE_COLOR,
            },
            indicatorStyle,
          ]}
        />
      )}

      <View style={{ flexDirection: 'row', height: 56 }}>
        {TABS.map((config, i) => (
          <TabItem
            key={config.name}
            config={config}
            isActive={state.index === i}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[i].key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(state.routes[i].name);
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}
