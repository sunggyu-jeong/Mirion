import { ErrorScreen } from '@pages/error';
import { HistoryScreen } from '@pages/history';
import { HomeScreen } from '@pages/home';
import { LegalScreen } from '@pages/legal';
import { MarketScreen } from '@pages/market';
import { OnboardingScreen } from '@pages/onboarding';
import { RadarFeedScreen } from '@pages/radar-feed';
import { SettingsScreen } from '@pages/settings';
import { SplashScreen } from '@pages/splash';
import { TxDetailScreen } from '@pages/tx-detail';
import { WhaleDetailScreen } from '@pages/whale-detail';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppParamList } from '@shared/lib/navigation';
import { BottomTabBar } from '@shared/ui';
import React from 'react';

const MainTab = createBottomTabNavigator({
  tabBar: props => <BottomTabBar {...props} />,
  screenOptions: { headerShown: false },
  screens: {
    Home: HomeScreen,
    History: HistoryScreen,
    Market: MarketScreen,
    Settings: SettingsScreen,
  },
});

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Splash',
  screenOptions: {
    headerShown: false,
    animation: 'fade',
  },
  screens: {
    Splash: { screen: SplashScreen },
    Legal: { screen: LegalScreen, options: { animation: 'fade' } },
    Onboarding: { screen: OnboardingScreen },
    Main: { screen: MainTab },
    WhaleDetail: {
      screen: WhaleDetailScreen,
      options: { animation: 'slide_from_right' },
    },
    TxDetail: {
      screen: TxDetailScreen,
      options: { animation: 'slide_from_right' },
    },
    RadarFeed: {
      screen: RadarFeedScreen,
      options: { animation: 'slide_from_bottom' },
    },
    Error: { screen: ErrorScreen, options: { animation: 'fade' } },
  },
});

export type RootStackParamList = AppParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const Navigation = createStaticNavigation(RootStack);
