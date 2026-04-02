jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@shared/lib/storage', () => ({
  LEGAL_ACCEPTED_KEY: 'legal-accepted',
  storage: { set: jest.fn() },
}));

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    ScreenTitle: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    PrimaryButton: ({ label, onPress }: { label: string; onPress?: () => void }) => (
      <TouchableOpacity
        onPress={onPress}
        testID={`btn-${label}`}
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    ),
  };
});

import { useAppNavigation } from '@shared/lib/navigation';
import { storage } from '@shared/lib/storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { LegalScreen } from '../LegalScreen';

const mockToOnboarding = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppNavigation).mockReturnValue({ toOnboarding: mockToOnboarding } as never);
});

describe('LegalScreen', () => {
  it('"이용약관 및 위험 고지" 타이틀을 렌더링한다', () => {
    render(<LegalScreen />);
    expect(screen.getByText('이용약관 및 위험 고지')).toBeTruthy();
  });

  it('"동의하고 시작하기" 버튼을 렌더링한다', () => {
    render(<LegalScreen />);
    expect(screen.getByText('동의하고 시작하기')).toBeTruthy();
  });

  it('섹션 제목들을 렌더링한다', () => {
    render(<LegalScreen />);
    expect(screen.getByText('1. 비수탁형 서비스 안내')).toBeTruthy();
    expect(screen.getByText('2. 스마트 컨트랙트 위험')).toBeTruthy();
  });

  it('동의 체크박스 텍스트를 렌더링한다', () => {
    render(<LegalScreen />);
    expect(screen.getByText(/위 내용을 모두 확인했으며/)).toBeTruthy();
  });

  it('체크박스를 누르면 동의 상태가 토글된다', () => {
    render(<LegalScreen />);
    const checkbox = screen.getByText(/위 내용을 모두 확인했으며/);
    fireEvent.press(checkbox.parent!);
    expect(screen.getByText('동의하고 시작하기')).toBeTruthy();
  });

  it('동의 후 버튼 누르면 storage에 저장하고 toOnboarding 호출', () => {
    render(<LegalScreen />);
    fireEvent.press(screen.getByText(/위 내용을 모두 확인했으며/).parent!);
    fireEvent.press(screen.getByTestId('btn-동의하고 시작하기'));
    expect(storage.set).toHaveBeenCalledWith('legal-accepted', '1');
    expect(mockToOnboarding).toHaveBeenCalled();
  });
});
