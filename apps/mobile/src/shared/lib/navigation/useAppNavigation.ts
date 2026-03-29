import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type AppParamList = {
  Splash: undefined;
  Legal: undefined;
  Onboarding: undefined;
  WalletConnect: undefined;
  WalletConnecting: { walletType: 'metamask' | 'coinbase' };
  Main: undefined;
  DepositSetup: undefined;
  DepositConfirm: { amountEth: string; unlockDate: string };
  TransactionProgress: { amountEth: string; unlockTimestamp: string; unlockDateLabel: string };
  DepositSuccess: { unlockDateLabel: string };
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
    toDepositSetup: () => navigation.navigate('DepositSetup'),
    toDepositConfirm: (params: AppParamList['DepositConfirm']) =>
      navigation.navigate('DepositConfirm', params),
    toTransactionProgress: (params: AppParamList['TransactionProgress']) =>
      navigation.navigate('TransactionProgress', params),
    toDepositSuccess: (params: AppParamList['DepositSuccess']) =>
      navigation.navigate('DepositSuccess', params),
    toError: (params: AppParamList['Error']) => navigation.navigate('Error', params),
    goBack: () => navigation.goBack(),
  };
}
