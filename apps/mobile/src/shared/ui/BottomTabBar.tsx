import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Radar, Settings, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#06B6D4';
const INACTIVE_COLOR = 'rgba(255,255,255,0.30)';

const MORPH_SPRING = { damping: 18, stiffness: 220, mass: 0.8 } as const;
const ICON_SPRING = { damping: 12, stiffness: 300, mass: 0.6 } as const;
const PRESS_SPRING = { damping: 15, stiffness: 500 } as const;

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
  const lift = useSharedValue(isActive ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    lift.value = withSpring(isActive ? 1 : 0, ICON_SPRING);
  }, [isActive, lift]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -6 * lift.value },
      { scale: scale.value },
    ],
    opacity: 0.4 + 0.6 * lift.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive ? 1 : 0, { duration: 200 }),
    transform: [{ translateY: 4 * (1 - lift.value) }],
  }));

  const { Icon } = config;

  return (
    <Pressable
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onPressIn={() => {
        scale.value = withSpring(0.85, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      onPress={onPress}
    >
      <Animated.View style={[{ alignItems: 'center' }, iconStyle]}>
        <Icon
          size={22}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth={isActive ? 2.2 : 1.6}
        />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', bottom: 10 }, labelStyle]}>
        <Animated.Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            color: ACTIVE_COLOR,
            letterSpacing: -0.2,
          }}
        >
          {config.label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const tabCount = state.routes.length;
  const slotWidth = layoutWidth / tabCount;

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(24);

  useEffect(() => {
    if (layoutWidth === 0) return;
    const targetX = state.index * slotWidth + (slotWidth - 24) / 2;
    indicatorX.value = withSpring(targetX, MORPH_SPRING);
    
    // Morph effect: momentarily stretch width during move
    indicatorWidth.value = withSpring(32, { ...MORPH_SPRING, damping: 10 });
    setTimeout(() => {
      indicatorWidth.value = withSpring(24, MORPH_SPRING);
    }, 150);
  }, [state.index, layoutWidth, slotWidth, indicatorX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setLayoutWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={{
        backgroundColor: '#020B18',
        borderTopWidth: 1,
        borderTopColor: 'rgba(6,182,212,0.12)',
        paddingBottom: insets.bottom,
      }}
      onLayout={onLayout}
    >
      <View style={{ flexDirection: 'row', height: 62 }}>
        {state.routes.map((route, i) => {
          const cfg = TAB_CONFIG[route.name];
          if (!cfg) return null;
          return (
            <TabItem
              key={route.key}
              config={{ name: route.name, ...cfg }}
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

      {/* Morphing Line Indicator */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            height: 3,
            backgroundColor: ACTIVE_COLOR,
            borderRadius: 2,
            shadowColor: ACTIVE_COLOR,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
          },
          indicatorStyle,
        ]}
      />
    </View>
  );
}
