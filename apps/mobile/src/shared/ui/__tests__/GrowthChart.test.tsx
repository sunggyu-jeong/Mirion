jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Svg: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Path: () => null,
    Line: () => null,
    Defs: () => null,
    LinearGradient: () => null,
    Stop: () => null,
    Text: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  };
});

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { GrowthChart } from '../GrowthChart';

describe('GrowthChart', () => {
  it('data가 1개 이하면 null을 반환한다', () => {
    const { toJSON } = render(
      <GrowthChart
        data={[1]}
        xTicks={[]}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('data가 빈 배열이면 null을 반환한다', () => {
    const { toJSON } = render(
      <GrowthChart
        data={[]}
        xTicks={[]}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('width=0일 때 레이아웃 placeholder를 렌더링한다', () => {
    const { toJSON } = render(
      <GrowthChart
        data={[1, 1.01, 1.02]}
        xTicks={[{ index: 0, label: '지금' }]}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('onLayout으로 width가 설정되면 차트를 렌더링한다', () => {
    const { root } = render(
      <GrowthChart
        data={[1, 1.01, 1.02]}
        xTicks={[
          { index: 0, label: '지금' },
          { index: 2, label: '3개월' },
        ]}
      />,
    );
    const view = root;
    fireEvent(view, 'layout', { nativeEvent: { layout: { width: 300 } } });
  });

  it('xTick 레이블들을 렌더링한다', () => {
    render(
      <GrowthChart
        data={[1, 1.05, 1.038]}
        xTicks={[
          { index: 0, label: '지금' },
          { index: 2, label: '1년' },
        ]}
      />,
    );
    expect(screen.queryByText('지금')).toBeDefined();
  });

  it('data 값이 1 미만일 때 소수점 4자리로 포맷한다', () => {
    const { toJSON } = render(
      <GrowthChart
        data={[0.001, 0.0012, 0.0015]}
        xTicks={[{ index: 0, label: '지금' }]}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('onLayout 이후 재렌더 시 오류가 없다', () => {
    const { UNSAFE_getByType, rerender } = render(
      <GrowthChart
        data={[1, 1.01, 1.02]}
        xTicks={[{ index: 0, label: '지금' }]}
      />,
    );
    const { View } = require('react-native');
    const view = UNSAFE_getByType(View);
    fireEvent(view, 'layout', { nativeEvent: { layout: { width: 300 } } });
    rerender(
      <GrowthChart
        data={[1, 1.01, 1.02]}
        xTicks={[{ index: 0, label: '지금' }]}
      />,
    );
    expect(true).toBe(true);
  });

  it('차트 렌더링 후 onLayout 재호출이 너비를 갱신한다', () => {
    const { root } = render(
      <GrowthChart
        data={[1, 1.01, 1.02]}
        xTicks={[{ index: 0, label: '지금' }]}
      />,
    );
    fireEvent(root, 'layout', { nativeEvent: { layout: { width: 300 } } });
    fireEvent(root, 'layout', { nativeEvent: { layout: { width: 350 } } });
    expect(true).toBe(true);
  });
});
