jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: require('react-native').View,
}));

jest.mock('../../navigation', () => {
  const { View } = require('react-native');
  return { Navigation: () => <View testID="navigation" /> };
});

import { render } from '@testing-library/react-native';
import React from 'react';

import { AppProviders } from '../index';

describe('AppProviders', () => {
  it('에러 없이 렌더링된다', () => {
    expect(() => render(<AppProviders />)).not.toThrow();
  });

  it('Navigation 컴포넌트를 렌더링한다', () => {
    const { getByTestId } = render(<AppProviders />);
    expect(getByTestId('navigation')).toBeTruthy();
  });
});
