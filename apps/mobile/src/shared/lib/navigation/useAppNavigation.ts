import type { TxDetailParams } from '@pages/tx-detail';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type AppParamList = {
  Splash: undefined;
  Legal: undefined;
  Onboarding: undefined;
  Main: { screen: 'Settings' } | undefined;
  WhaleDetail: { whaleId: string };
  TxDetail: TxDetailParams;
  Error: { errorType: 'network' | 'transaction' | 'balance' };
};

export function useAppNavigation() {
  const navigation = useNavigation<NavigationProp<AppParamList>>();

  return {
    toLegal: () => navigation.reset({ index: 0, routes: [{ name: 'Legal' }] }),
    toOnboarding: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
    toMain: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }),
    toWhaleDetail: (whaleId: string) => navigation.navigate('WhaleDetail', { whaleId }),
    toTxDetail: (params: TxDetailParams) => navigation.navigate('TxDetail', params),
    toSettings: () => navigation.navigate('Main', { screen: 'Settings' }),
    toError: (params: AppParamList['Error']) => navigation.navigate('Error', params),
    goBack: () => navigation.goBack(),
  };
}
