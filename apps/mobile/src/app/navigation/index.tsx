import { ErrorScreen } from '@pages/error';
import { HistoryScreen } from '@pages/history';
import { HomeScreen } from '@pages/home';
import { LegalScreen } from '@pages/legal';
import { OnboardingScreen } from '@pages/onboarding';
import { SettingsScreen } from '@pages/settings';
import { SplashScreen } from '@pages/splash';
import { WalletConnectScreen } from '@pages/wallet-connect';
import { WalletConnectingScreen } from '@pages/wallet-connecting';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBar } from '@shared/ui';
import React from 'react';

const MainTab = createBottomTabNavigator({
  tabBar: props => <BottomTabBar {...props} />,
  screenOptions: { headerShown: false },
  screens: {
    Home: HomeScreen,
    History: HistoryScreen,
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
    Splash: {
      screen: SplashScreen,
    },
    Legal: {
      screen: LegalScreen,
      options: { animation: 'fade' },
    },
    Onboarding: {
      screen: OnboardingScreen,
    },
    WalletConnect: {
      screen: WalletConnectScreen,
      options: { presentation: 'transparentModal', animation: 'none' },
    },
    WalletConnecting: {
      screen: WalletConnectingScreen,
      options: { animation: 'slide_from_right' },
    },
    Main: {
      screen: MainTab,
    },
    Error: {
      screen: ErrorScreen,
      options: { animation: 'fade' },
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack> & {
  WalletConnecting: { walletType: 'metamask' | 'coinbase' };
  Error: { errorType: 'network' | 'transaction' | 'balance' };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const Navigation = createStaticNavigation(RootStack);
