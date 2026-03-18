import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

import { TabBar } from '@/src/widgets/tab-bar/ui/TabBar';
import { WalletHeader } from '@/src/widgets/wallet-header/ui/WalletHeader';
import HistoryPage from '@/src/app/(tabs)/history';
import SettingPage from '@/src/app/(tabs)/settings';
import HomePage from '@/src/app/(tabs)/home';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <WalletHeader />,
      }}
    >
      <Tab.Screen
        name="home"
        component={HomePage}
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconBase,
                { backgroundColor: color },
                focused ? styles.iconHomeActive : styles.iconHomeInactive,
              ]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="history"
        component={HistoryPage}
        options={{
          title: '내역',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconBase, { backgroundColor: color }, focused && styles.iconScale]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingPage}
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconBase, { backgroundColor: color }, focused && styles.iconScale]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconBase: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  iconHomeActive: {
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  iconHomeInactive: {
    opacity: 0.8,
  },
  iconScale: {
    transform: [{ scale: 1.1 }],
  },
});
