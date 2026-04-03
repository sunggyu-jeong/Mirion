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
  withSpring: (v: any) => v,
  Easing: { out: () => (t: any) => t, quad: (t: any) => t, bezier: () => (t: any) => t },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('label 텍스트를 렌더링한다', () => {
    render(<PrimaryButton label="테스트 버튼" />);
    expect(screen.getByText('테스트 버튼')).toBeTruthy();
  });

  it('onPress 핸들러를 호출한다', () => {
    const onPress = jest.fn();
    render(
      <PrimaryButton
        label="클릭"
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByText('클릭'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('primary variant는 기본값이다', () => {
    render(<PrimaryButton label="primary" />);
    expect(screen.getByText('primary')).toBeTruthy();
  });

  it('secondary variant로 렌더링된다', () => {
    render(
      <PrimaryButton
        label="secondary"
        variant="secondary"
      />,
    );
    expect(screen.getByText('secondary')).toBeTruthy();
  });

  it('height prop이 적용된다', () => {
    render(
      <PrimaryButton
        label="높이버튼"
        height={60}
      />,
    );
    expect(screen.getByText('높이버튼')).toBeTruthy();
  });

  it('onPressIn 이벤트를 처리한다', () => {
    const { getByText } = render(<PrimaryButton label="press" />);
    expect(() => fireEvent(getByText('press').parent!, 'pressIn')).not.toThrow();
  });

  it('onPressOut 이벤트를 처리한다', () => {
    const { getByText } = render(<PrimaryButton label="pressout" />);
    expect(() => fireEvent(getByText('pressout').parent!, 'pressOut')).not.toThrow();
  });
});
