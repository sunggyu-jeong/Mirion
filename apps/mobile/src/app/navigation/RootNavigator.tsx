import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DepositPage } from '@/src/app/deposit';
import SplashScreen from '@/src/app/index';
import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Deposit" component={DepositPage} />
    </Stack.Navigator>
  );
};
