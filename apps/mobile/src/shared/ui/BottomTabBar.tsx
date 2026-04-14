import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Radar, Settings, TrendingUp } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#06B6D4';
const INACTIVE_COLOR = 'rgba(255,255,255,0.30)';

const PILL_SPRING = { damping: 22, stiffness: 260, mass: 0.9 } as const;
const PRESS_SPRING = { damping: 15, stiffness: 400 } as const;
const TEXT_TIMING = { duration: 160, easing: Easing.bezier(0.22, 1, 0.36, 1) } as const;

const LABEL_MAX_WIDTH: Record<string, number> = {
  Home: 18,
  History: 46,
  Market: 28,
  Settings: 28,
};

type TabConfig = {
  name: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
};

const TAB_CONFIG: Record<string, Omit<TabConfig, 'name'>> = {
  Home: { label: '홈', Icon: Home },
  History: { label: '레이더', Icon: Radar },
  Market: { label: '마켓', Icon: TrendingUp },
  Settings: { label: '설정', Icon: Settings },
};

function TabItem({
  config,
  isActive,
  onPress,
}: {
  config: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, PILL_SPRING);
  }, [isActive, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(progress.value, [0, 1], [10, 14]),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(6,182,212,0)', 'rgba(6,182,212,0.15)'],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(6,182,212,0)', 'rgba(6,182,212,0.40)'],
    ),
    transform: [{ scale: scale.value }],
  }));

  const textContainerStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, LABEL_MAX_WIDTH[config.name] ?? 32]),
    opacity: withTiming(isActive ? 1 : 0, TEXT_TIMING),
  }));

  const { Icon } = config;

  return (
    <Pressable
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onPressIn={() => {
        scale.value = withSpring(0.88, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingVertical: 8,
            borderRadius: 22,
            borderWidth: 1,
          },
          pillStyle,
        ]}
      >
        <Icon
          size={20}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <Animated.View style={[{ overflow: 'hidden' }, textContainerStyle]}>
          <Animated.Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: ACTIVE_COLOR,
              letterSpacing: -0.2,
            }}
          >
            {config.label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: '#020B18',
        borderTopWidth: 1,
        borderTopColor: 'rgba(6,182,212,0.18)',
        paddingBottom: insets.bottom,
      }}
    >
      <View style={{ flexDirection: 'row', height: 54 }}>
        {state.routes.map((route, i) => {
          const cfg = TAB_CONFIG[route.name];
          if (!cfg) {
            return null;
          }
          const config: TabConfig = { name: route.name, ...cfg };
          return (
            <TabItem
              key={route.key}
              config={config}
              isActive={state.index === i}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
