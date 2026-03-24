import type { RootStackParamList } from '@app/navigation';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

export function useAppNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return {
    toOnboarding: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
    toWalletConnect: () => navigation.navigate('WalletConnect'),
    toWalletConnecting: (walletType: 'metamask' | 'coinbase') =>
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Onboarding' },
          { name: 'WalletConnecting', params: { walletType } },
        ],
      }),
    toStaking: () => navigation.reset({ index: 0, routes: [{ name: 'Staking' }] }),
    goBack: () => navigation.goBack(),
  };
}
