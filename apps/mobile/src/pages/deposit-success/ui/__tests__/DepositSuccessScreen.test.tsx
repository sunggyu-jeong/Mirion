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
    expect(screen.getByText('스테이킹이 완료되었습니다!')).toBeTruthy();
  });

  it('안내 문구를 렌더링한다', () => {
    render(<DepositSuccessScreen />);
    expect(
      screen.getByText('stETH가 지갑에 입금되었습니다. Lido를 통해 자동으로 이자가 쌓입니다.'),
    ).toBeTruthy();
  });

  it('"홈으로 돌아가기" 버튼을 렌더링한다', () => {
    render(<DepositSuccessScreen />);
    expect(screen.getByText('홈으로 돌아가기')).toBeTruthy();
  });
});
