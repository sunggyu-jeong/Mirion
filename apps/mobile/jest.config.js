module.exports = {
  preset: 'react-native',
  collectCoverage: false,
  coverageDirectory: 'coverage/js',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    // Business logic only — UI components require E2E / snapshot tests
    'src/entities/**/*.{ts,tsx}',
    'src/features/**/*.{ts,tsx}',
    'src/shared/api/**/*.{ts,tsx}',
    'src/shared/lib/**/*.{ts,tsx}',
    // Exclude trivial wrappers with no testable logic
    '!src/**/*.d.ts',
    '!src/**/*.types.ts',
    '!src/**/index.ts',
    '!src/**/model/whale-tx.ts',
    '!src/entities/subscription/**',
    '!src/features/eth-price/**',
    '!src/shared/lib/navigation/**',
    '!src/shared/lib/storage/mmkv.ts',
    '!src/shared/lib/storage/zustand-storage.ts',
    '!src/shared/lib/toast/index.ts',
    '!src/shared/lib/loading/**',
  ],
  moduleNameMapper: {
    '^react-native-reanimated$': '<rootDir>/src/__mocks__/react-native-reanimated.ts',
    '^react-native-config$': '<rootDir>/src/__mocks__/react-native-config.ts',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
  },
  forceExit: true,
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-safe-area-context|react-native-nitro-modules|react-native-biometrics|react-native-config|react-native-reanimated|react-native-mmkv|@react-navigation|wagmi|viem|@wagmi|@tanstack|@coinbase|@metamask|uuid)/)',
  ],
};
