import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: { unlockDateLabel: '2026년 2월 28일' },
  }),
}));

jest.mock('@shared/lib/navigation', () => ({
  useAppNavigation: () => ({ toMain: jest.fn() }),
}));

import { DepositSuccessScreen } from '../DepositSuccessScreen';

describe('DepositSuccessScreen', () => {
  it('성공 메시지를 렌더링한다', () => {
    render(<DepositSuccessScreen />);
    expect(screen.getByText('예치가 완료되었습니다!')).toBeTruthy();
  });

  it('만기일을 올바르게 렌더링한다', () => {
    render(<DepositSuccessScreen />);
    expect(screen.getByText('만기일 : 2026년 2월 28일')).toBeTruthy();
  });

  it('"홈으로 돌아가기" 버튼을 렌더링한다', () => {
    render(<DepositSuccessScreen />);
    expect(screen.getByText('홈으로 돌아가기')).toBeTruthy();
  });
});
