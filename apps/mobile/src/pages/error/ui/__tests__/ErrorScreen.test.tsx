import { render, screen } from '@testing-library/react-native';
import React from 'react';

const mockGoBack = jest.fn();
const mockToMain = jest.fn();
const mockUseRoute = jest.fn();

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({
    goBack: mockGoBack,
    toMain: mockToMain,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockUseRoute(),
}));

import { ErrorScreen } from '../ErrorScreen';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ErrorScreen', () => {
  it('network 타입: 네트워크 오류 타이틀을 렌더링한다', () => {
    mockUseRoute.mockReturnValue({ params: { errorType: 'network' } });
    render(<ErrorScreen />);
    expect(screen.getByText('네트워크 연결 오류')).toBeTruthy();
  });

  it('transaction 타입: 트랜잭션 실패 타이틀을 렌더링한다', () => {
    mockUseRoute.mockReturnValue({ params: { errorType: 'transaction' } });
    render(<ErrorScreen />);
    expect(screen.getByText('트랜잭션 실패')).toBeTruthy();
  });

  it('balance 타입: 잔액 부족 타이틀을 렌더링한다', () => {
    mockUseRoute.mockReturnValue({ params: { errorType: 'balance' } });
    render(<ErrorScreen />);
    expect(screen.getByText('잔액이 부족합니다')).toBeTruthy();
  });

  it('"다시 시도"와 "돌아가기" 버튼을 렌더링한다', () => {
    mockUseRoute.mockReturnValue({ params: { errorType: 'network' } });
    render(<ErrorScreen />);
    expect(screen.getByText('다시 시도')).toBeTruthy();
    expect(screen.getByText('돌아가기')).toBeTruthy();
  });
});
