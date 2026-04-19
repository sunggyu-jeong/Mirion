import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { AppParamList, TxDetailParams } from './types';

export function useAppNavigation() {
  const navigation = useNavigation<NavigationProp<AppParamList>>();

  return {
    toLegal: () => navigation.reset({ index: 0, routes: [{ name: 'Legal' }] }),
    toOnboarding: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
    toMain: () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }),
    toWhaleDetail: (whaleId: string) => navigation.navigate('WhaleDetail', { whaleId }),
    toTxDetail: (params: TxDetailParams) => navigation.navigate('TxDetail', params),
    toRadarFeed: () => navigation.navigate('RadarFeed'),
    toSettings: () => navigation.navigate('Main', { screen: 'Settings' }),
    toError: (params: AppParamList['Error']) => navigation.navigate('Error', params),
    goBack: () => navigation.goBack(),
  };
}
