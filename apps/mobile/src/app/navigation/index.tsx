import { OnboardingScreen } from '@pages/onboarding';
import { SplashScreen } from '@pages/splash';
import { StakingScreen } from '@pages/staking';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Splash',
  screens: {
    Splash: {
      screen: SplashScreen,
      options: { headerShown: false },
    },
    Onboarding: {
      screen: OnboardingScreen,
      options: { headerShown: false },
    },
    Staking: {
      screen: StakingScreen,
      options: { headerShown: false },
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack>;

export const Navigation = createStaticNavigation(RootStack);
