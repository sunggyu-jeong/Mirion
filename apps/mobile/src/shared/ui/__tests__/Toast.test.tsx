jest.mock('@shared/lib/toast', () => ({
  useToastStore: jest.fn(),
}));

import { useToastStore } from '@shared/lib/toast';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ToastView } from '../Toast';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ToastView', () => {
  it('visible=false이고 opacity=0이면 null을 반환한다', () => {
    jest.mocked(useToastStore).mockReturnValue({
      visible: false,
      message: '',
      type: 'info',
      hide: jest.fn(),
    } as never);
    const { toJSON } = render(<ToastView />);
    expect(toJSON()).toBeNull();
  });

  it('visible=true이면 메시지를 렌더링한다', () => {
    jest.mocked(useToastStore).mockReturnValue({
      visible: true,
      message: '트랜잭션이 완료되었습니다',
      type: 'success',
      hide: jest.fn(),
    } as never);
    render(<ToastView />);
    expect(screen.getByText('트랜잭션이 완료되었습니다')).toBeTruthy();
  });

  it('error 타입 toast를 렌더링한다', () => {
    jest.mocked(useToastStore).mockReturnValue({
      visible: true,
      message: '오류가 발생했습니다',
      type: 'error',
      hide: jest.fn(),
    } as never);
    render(<ToastView />);
    expect(screen.getByText('오류가 발생했습니다')).toBeTruthy();
  });

  it('info 타입 toast를 렌더링한다', () => {
    jest.mocked(useToastStore).mockReturnValue({
      visible: true,
      message: '안내 메시지',
      type: 'info',
      hide: jest.fn(),
    } as never);
    render(<ToastView />);
    expect(screen.getByText('안내 메시지')).toBeTruthy();
  });

  it('visible=true일 때 3초 후 hide가 호출된다', () => {
    jest.useFakeTimers();
    const mockHide = jest.fn();
    jest.mocked(useToastStore).mockReturnValue({
      visible: true,
      message: '타이머 테스트',
      type: 'success',
      hide: mockHide,
    } as never);
    render(<ToastView />);
    jest.advanceTimersByTime(3000);
    jest.useRealTimers();
  });
});
