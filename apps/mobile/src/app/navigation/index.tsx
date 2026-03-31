import { DepositConfirmScreen } from '@pages/deposit-confirm';
import { DepositSetupScreen } from '@pages/deposit-setup';
import { DepositSuccessScreen } from '@pages/deposit-success';
import { ErrorScreen } from '@pages/error';
import { HistoryScreen } from '@pages/history';
import { HomeScreen } from '@pages/home';
import { LegalScreen } from '@pages/legal';
import { OnboardingScreen } from '@pages/onboarding';
import { SettingsScreen } from '@pages/settings';
import { SimulatorScreen } from '@pages/simulator';
import { SplashScreen } from '@pages/splash';
import { TransactionProgressScreen } from '@pages/transaction-progress';
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
    Simulator: SimulatorScreen,
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
    DepositSetup: {
      screen: DepositSetupScreen,
      options: { animation: 'slide_from_bottom' },
    },
    DepositConfirm: {
      screen: DepositConfirmScreen,
      options: { animation: 'slide_from_right' },
    },
    TransactionProgress: {
      screen: TransactionProgressScreen,
      options: { animation: 'slide_from_right', gestureEnabled: false },
    },
    DepositSuccess: {
      screen: DepositSuccessScreen,
      options: { animation: 'fade', gestureEnabled: false },
    },
    Error: {
      screen: ErrorScreen,
      options: { animation: 'fade' },
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack> & {
  WalletConnecting: { walletType: 'metamask' | 'coinbase' };
  DepositConfirm: { amountEth: string; unlockDate: string };
  TransactionProgress: { amountEth: string; unlockTimestamp: string; unlockDateLabel: string };
  DepositSuccess: { unlockDateLabel: string };
  Error: { errorType: 'network' | 'transaction' | 'balance' };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const Navigation = createStaticNavigation(RootStack);
