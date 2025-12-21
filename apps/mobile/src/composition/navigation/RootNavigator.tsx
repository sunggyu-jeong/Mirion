import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { History, Home, Settings } from 'lucide-react-native';
import React from 'react';

import HistoryPage from '@/app/(tabs)/history';
import HomePage from '@/app/(tabs)/home';
import SettingPage from '@/app/(tabs)/settings';
import { TabBar } from '@/src/widgets/tab-bar/ui/TabBar';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="index"
        component={HomePage}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <Home
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="history"
        component={HistoryPage}
        options={{
          tabBarLabel: '저금기록',
          tabBarIcon: ({ color, size }) => (
            <History
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingPage}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, size }) => (
            <Settings
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
