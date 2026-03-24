import { OnboardingScreen } from '@pages/onboarding';
import { SplashScreen } from '@pages/splash';
import { StakingScreen } from '@pages/staking';
import { WalletConnectScreen } from '@pages/wallet-connect';
import { WalletConnectingScreen } from '@pages/wallet-connecting';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
    Staking: {
      screen: StakingScreen,
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack> & {
  WalletConnecting: { walletType: 'metamask' | 'coinbase' };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const Navigation = createStaticNavigation(RootStack);
