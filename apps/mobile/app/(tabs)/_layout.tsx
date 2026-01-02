import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TabBar } from '@/src/widgets/tab-bar/ui/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
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

      <Tabs.Screen
        name="history"
        options={{
          title: '내역',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[styles.iconBase, { backgroundColor: color }, focused && styles.iconScale]}
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
              style={[styles.iconBase, { backgroundColor: color }, focused && styles.iconScale]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

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
