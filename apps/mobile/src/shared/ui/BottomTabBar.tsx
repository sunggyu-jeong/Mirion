import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BarChart2, Home, Settings, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_CONFIG = [
  { name: 'Home', label: '홈', Icon: Home },
  { name: 'Simulator', label: '시뮬레이터', Icon: TrendingUp },
  { name: 'History', label: '내역', Icon: BarChart2 },
  { name: 'Settings', label: '설정', Icon: Settings },
] as const;

function TabItem({
  isActive,
  onPress,
  config,
}: {
  isActive: boolean;
  onPress: () => void;
  config: (typeof TAB_CONFIG)[number];
}) {
  const scale = useSharedValue(1);
  const color = isActive ? '#2b7fff' : '#62748e';
  const { Icon } = config;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[{ alignItems: 'center' }, animStyle]}>
        <Icon
          size={24}
          color={color}
        />
        <Text
          style={{
            fontSize: 11,
            color,
            letterSpacing: 0.1,
            marginTop: 2,
            fontWeight: isActive ? '500' : '400',
          }}
        >
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: '#cad5e2',
        backgroundColor: 'white',
        paddingBottom: insets.bottom,
      }}
    >
      <View style={{ flexDirection: 'row', height: 51 }}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[index];
          if (!config) {
            return null;
          }
          const isActive = state.index === index;

          return (
            <TabItem
              key={route.key}
              isActive={isActive}
              config={config}
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
