import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';

function PlaceholderScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-base text-gray-800">LockFi</Text>
    </View>
  );
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: PlaceholderScreen,
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack>;

export const Navigation = createStaticNavigation(RootStack);
