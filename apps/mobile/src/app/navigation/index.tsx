import { OnboardingScreen } from '@pages/onboarding';
import { SplashScreen } from '@pages/splash';
import { StakingScreen } from '@pages/staking';
import { WalletConnectScreen } from '@pages/wallet-connect';
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
    Staking: {
      screen: StakingScreen,
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack>;

export const Navigation = createStaticNavigation(RootStack);
