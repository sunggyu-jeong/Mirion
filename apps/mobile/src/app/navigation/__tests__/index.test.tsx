jest.mock('react-native-nitro-modules', () => ({
  NitroModules: { createHybridObject: jest.fn().mockReturnValue({}) },
}));

jest.mock('@shared/lib/storage', () => ({
  storage: { getString: jest.fn(), set: jest.fn(), remove: jest.fn() },
}));

jest.mock('@entities/wallet', () => ({
  secureKey: {
    has: jest.fn().mockReturnValue(false),
    retrieveData: jest.fn().mockResolvedValue(null),
  },
  useWalletStore: jest.fn((selector: CallableFunction) =>
    selector({ setSession: jest.fn() }),
  ),
}));

jest.mock('@features/wallet-connect', () => ({
  useWalletConnect: jest.fn(() => ({ connectWallet: jest.fn() })),
  useCoinbaseWallet: jest.fn(() => ({ connectWallet: jest.fn() })),
}));

jest.mock('@react-navigation/native', () => ({
  createStaticNavigation: jest.fn(() => () => null),
  StaticParamList: {},
  useNavigation: jest.fn(() => ({ reset: jest.fn(), navigate: jest.fn(), goBack: jest.fn() })),
  useRoute: jest.fn(() => ({ params: {} })),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({ screens: {} })),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({ screens: {} })),
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: require('react-native').View, createAnimatedComponent: (c: any) => c },
  useSharedValue: (v: any) => ({ value: v }),
  useAnimatedStyle: (fn: any) => fn(),
  withTiming: (v: any) => v,
  withRepeat: (v: any) => v,
  withSpring: (v: any) => v,
  Easing: { linear: (t: any) => t },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
  SafeAreaProvider: ({ children }: any) => children,
}));

import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Navigation } from '../index';

describe('Navigation', () => {
  it('네이티브 스택 네비게이터를 생성한다', () => {
    expect(createNativeStackNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screens: expect.objectContaining({ Main: expect.any(Object) }),
      }),
    );
  });

  it('WalletConnecting 스크린이 등록된다', () => {
    expect(createNativeStackNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screens: expect.objectContaining({ WalletConnecting: expect.any(Object) }),
      }),
    );
  });

  it('스택으로부터 정적 네비게이션을 생성한다', () => {
    expect(createStaticNavigation).toHaveBeenCalled();
  });

  it('Navigation 컴포넌트를 export한다', () => {
    expect(Navigation).toBeDefined();
  });
});
