import { useNavigation } from '@react-navigation/native';

export function useAppNavigation() {
  const navigation = useNavigation();

  return {
    toOnboarding: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' as never }] }),
    toWalletConnect: () => navigation.navigate('WalletConnect' as never),
    toStaking: () => navigation.navigate('Staking' as never),
    goBack: () => navigation.goBack(),
  };
}
