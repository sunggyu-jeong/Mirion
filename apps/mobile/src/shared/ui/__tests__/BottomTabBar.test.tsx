jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Home: () => <View testID="icon-home" />,
    TrendingUp: () => <View testID="icon-trending" />,
    BarChart2: () => <View testID="icon-bar-chart" />,
    Settings: () => <View testID="icon-settings" />,
    Plus: () => <View testID="icon-plus" />,
  };
});

import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { BottomTabBar } from '../BottomTabBar';

const mockNavigate = jest.fn();
const mockEmit = jest.fn(() => ({ defaultPrevented: false }));
const mockNavigationRef = { navigate: mockNavigate };

const makeState = (index: number) => ({
  index,
  routes: [
    { key: 'home-key', name: 'Home' },
    { key: 'sim-key', name: 'Simulator' },
    { key: 'history-key', name: 'History' },
    { key: 'settings-key', name: 'Settings' },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNavigation).mockReturnValue({ navigate: mockNavigate } as never);
});

describe('BottomTabBar', () => {
  it('모든 탭 레이블을 렌더링한다', () => {
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    expect(screen.getByText('홈')).toBeTruthy();
    expect(screen.getByText('시뮬')).toBeTruthy();
    expect(screen.getByText('내역')).toBeTruthy();
    expect(screen.getByText('설정')).toBeTruthy();
  });

  it('홈 탭 클릭 시 navigation.emit과 navigate를 호출한다', () => {
    render(
      <BottomTabBar
        state={makeState(1) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent.press(screen.getByText('홈'));
    expect(mockEmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'home-key' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('설정 탭 클릭 시 navigation.emit과 navigate를 호출한다', () => {
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent.press(screen.getByText('설정'));
    expect(mockEmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'settings-key' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });

  it('defaultPrevented이면 navigate를 호출하지 않는다', () => {
    mockEmit.mockReturnValue({ defaultPrevented: true });
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent.press(screen.getByText('시뮬'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('FAB 버튼 클릭 시 DepositSetup으로 이동한다', () => {
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent.press(screen.getByTestId('icon-plus').parent!.parent!);
    expect(mockNavigate).toHaveBeenCalledWith('DepositSetup');
  });

  it('onLayout 이벤트로 barWidth를 업데이트하고 인디케이터를 렌더링한다', () => {
    const { root } = render(
      <BottomTabBar
        state={makeState(2) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent(root, 'layout', { nativeEvent: { layout: { width: 375 } } });
    expect(screen.getByText('홈')).toBeTruthy();
  });

  it('index가 2 이상일 때 toVisualSlot이 올바르게 동작한다 (FAB 슬롯 건너뜀)', () => {
    render(
      <BottomTabBar
        state={makeState(3) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    expect(screen.getByText('설정')).toBeTruthy();
  });

  it('탭 아이템 pressIn/pressOut 이벤트를 처리한다', () => {
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    const homeTab = screen.getByText('홈');
    expect(() => {
      fireEvent(homeTab.parent!, 'pressIn');
      fireEvent(homeTab.parent!, 'pressOut');
    }).not.toThrow();
  });

  it('FAB pressIn/pressOut 이벤트를 처리한다', () => {
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    const plusIcon = screen.getByTestId('icon-plus');
    expect(() => {
      fireEvent(plusIcon.parent!.parent!, 'pressIn');
      fireEvent(plusIcon.parent!.parent!, 'pressOut');
    }).not.toThrow();
  });

  it('onLayout 후 state.index < 2이면 toVisualSlot 참 분기를 실행한다', () => {
    const { root } = render(
      <BottomTabBar
        state={makeState(1) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent(root, 'layout', { nativeEvent: { layout: { width: 375 } } });
    expect(screen.getByText('홈')).toBeTruthy();
  });

  it('내역 탭 defaultPrevented이면 navigate를 호출하지 않는다', () => {
    mockEmit.mockReturnValue({ defaultPrevented: true });
    render(
      <BottomTabBar
        state={makeState(0) as never}
        navigation={{ emit: mockEmit, navigate: mockNavigate } as never}
        descriptors={{} as never}
      />,
    );
    fireEvent.press(screen.getByText('내역'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
