import 'react-native-gesture-handler/jestSetup';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
    createChannel: jest.fn().mockResolvedValue('default'),
    createTriggerNotification: jest.fn().mockResolvedValue('mock-notification-id'),
    onForegroundEvent: jest.fn(() => jest.fn()),
  },
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
  TriggerType: { TIMESTAMP: 0, INTERVAL: 1 },
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn().mockReturnValue([]),
  })),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const RN = require('react-native');
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(null),
    BottomSheetModal: jest.fn().mockReturnValue(null),
    BottomSheetView: RN.View,
    BottomSheetScrollView: RN.ScrollView,
    useBottomSheetModal: () => ({ present: jest.fn(), dismiss: jest.fn() }),
  };
});

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
