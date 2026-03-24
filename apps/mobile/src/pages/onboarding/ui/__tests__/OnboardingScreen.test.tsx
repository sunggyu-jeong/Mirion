jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: jest.fn(),
}));

jest.mock('@shared/ui', () => ({
  PrimaryButton: ({ label, onPress }: { label: string; onPress?: () => void }) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        onPress={onPress}
        testID="primary-button"
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

import { useAppNavigation } from '@shared/lib/navigation';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { OnboardingScreen } from '../OnboardingScreen';

const mockToWalletConnect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAppNavigation).mockReturnValue({
    toWalletConnect: mockToWalletConnect,
  } as never);
});

describe('OnboardingScreen', () => {
  it('메인 타이틀 텍스트를 렌더링한다', () => {
    render(<OnboardingScreen />);
    expect(screen.getByText(/강제 저축으로/)).toBeTruthy();
  });

  it('부제목 텍스트를 렌더링한다', () => {
    render(<OnboardingScreen />);
    expect(screen.getByText(/이더리움/)).toBeTruthy();
  });

  it('CTA 버튼 라벨을 렌더링한다', () => {
    render(<OnboardingScreen />);
    expect(screen.getByText('내 지갑 연결하고 시작하기')).toBeTruthy();
  });

  it('CTA 버튼 클릭 시 toWalletConnect를 호출한다', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByTestId('primary-button'));
    expect(mockToWalletConnect).toHaveBeenCalledTimes(1);
  });
});
