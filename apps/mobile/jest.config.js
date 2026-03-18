module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.ts'],
  setupFilesAfterEnv: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@gorhom|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-modal-datetime-picker|react-native-mmkv|react-native-get-random-values|react-native-url-polyfill|react-native-vector-icons|@notifee|@tanstack|wagmi|viem|@wagmi|@reown|@walletconnect|@noble|@scure|abitype|lucide-react-native)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'node',
};
