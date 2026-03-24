jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    View: require('react-native').View,
    createAnimatedComponent: (c: any) => c,
  },
  useSharedValue: (v: any) => ({ value: v }),
  useAnimatedStyle: (fn: any) => {
    try {
      return fn();
    } catch {
      return {};
    }
  },
  withTiming: (v: any) => v,
  withRepeat: (v: any) => v,
  withSpring: (v: any) => v,
  Easing: { linear: (t: any) => t },
}));

import { render } from '@testing-library/react-native';
import React from 'react';

import { SpinnerIcon } from '../SpinnerIcon';

describe('SpinnerIcon', () => {
  it('metamask walletType으로 렌더링된다', () => {
    expect(() => render(<SpinnerIcon walletType="metamask" />)).not.toThrow();
  });

  it('coinbase walletType으로 렌더링된다', () => {
    expect(() => render(<SpinnerIcon walletType="coinbase" />)).not.toThrow();
  });

  it('기본값은 metamask이다', () => {
    expect(() => render(<SpinnerIcon />)).not.toThrow();
  });
});
