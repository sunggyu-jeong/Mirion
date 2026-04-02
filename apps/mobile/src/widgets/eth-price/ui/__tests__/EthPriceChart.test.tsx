jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Svg: ({ children }: { children: React.ReactNode }) => <View testID="svg">{children}</View>,
    Path: () => null,
    Defs: () => null,
    LinearGradient: () => null,
    Stop: () => null,
  };
});

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { EthPriceChart } from '../EthPriceChart';

describe('EthPriceChart', () => {
  it('prices가 1개 이하면 null을 반환한다', () => {
    const { toJSON } = render(<EthPriceChart prices={[3000000]} />);
    expect(toJSON()).toBeNull();
  });

  it('prices가 빈 배열이면 null을 반환한다', () => {
    const { toJSON } = render(<EthPriceChart prices={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('width=0일 때 SVG 없이 View를 렌더링한다', () => {
    const { toJSON } = render(<EthPriceChart prices={[3000000, 3100000, 3050000, 3200000]} />);
    expect(toJSON()).not.toBeNull();
    expect(screen.queryByTestId('svg')).toBeNull();
  });

  it('onLayout 핸들러를 오류 없이 호출할 수 있다', () => {
    const { UNSAFE_getByType } = render(
      <EthPriceChart prices={[3000000, 3100000, 3050000, 3200000]} />,
    );
    const view = UNSAFE_getByType(View);
    expect(() => {
      act(() => {
        fireEvent(view, 'layout', { nativeEvent: { layout: { width: 300 } } });
      });
    }).not.toThrow();
  });

  it('모든 값이 같을 때 range=1로 처리하여 오류가 없다', () => {
    const { toJSON } = render(<EthPriceChart prices={[3000000, 3000000, 3000000]} />);
    expect(toJSON()).not.toBeNull();
  });
});
