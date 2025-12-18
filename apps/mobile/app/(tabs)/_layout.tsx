import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { cn } from '@/src/shared/lib/utils/cn';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f2f4f6',
          height: 90,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3182F6',
        tabBarInactiveTintColor: '#B0B8C1',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn('w-6 h-6 rounded-md', focused ? 'opacity-100 shadow-sm' : 'opacity-80')}
              style={{ backgroundColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: '내역',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn('w-6 h-6 rounded-md', focused && 'scale-110')}
              style={{ backgroundColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={cn('w-6 h-6 rounded-md', focused && 'scale-110')}
              style={{ backgroundColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
