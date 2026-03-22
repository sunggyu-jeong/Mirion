import { useNavigation } from '@react-navigation/native';

export function useAppNavigation() {
  const navigation = useNavigation();

  return {
    toOnboarding: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' as never }] }),
    toWalletConnect: () => navigation.navigate('WalletConnect' as never),
    toWalletConnecting: (walletType: 'metamask' | 'coinbase') =>
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Onboarding' as never },
          { name: 'WalletConnecting' as never, params: { walletType } as never },
        ],
      }),
    toStaking: () => navigation.navigate('Staking' as never),
    goBack: () => navigation.goBack(),
  };
}
