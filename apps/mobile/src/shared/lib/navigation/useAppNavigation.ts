import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type AppParamList = {
  Splash: undefined;
  Legal: undefined;
  Onboarding: undefined;
  WalletConnect: undefined;
  WalletConnecting: { walletType: 'metamask' | 'coinbase' };
  Main: undefined;
  Error: { errorType: 'network' | 'transaction' | 'balance' };
};

export function useAppNavigation() {
  const navigation = useNavigation<NavigationProp<AppParamList>>();

  return {
    toLegal: () => navigation.reset({ index: 0, routes: [{ name: 'Legal' }] }),
    toOnboarding: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
    toWalletConnect: () => navigation.navigate('WalletConnect'),
    toWalletConnecting: (walletType: 'metamask' | 'coinbase') =>
      navigation.reset({
        index: 1,
        routes: [{ name: 'Onboarding' }, { name: 'WalletConnecting', params: { walletType } }],
      }),
    toMain: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }),
    toError: (params: AppParamList['Error']) => navigation.navigate('Error', params),
    goBack: () => navigation.goBack(),
  };
}
