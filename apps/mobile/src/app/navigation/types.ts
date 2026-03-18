import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  home: undefined;
  history: undefined;
  settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  Deposit: undefined;
};
