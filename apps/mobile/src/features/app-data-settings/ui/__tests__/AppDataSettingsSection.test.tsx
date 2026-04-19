import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { AppDataSettingsSection } from '../AppDataSettingsSection';

describe('AppDataSettingsSection', () => {
  it('renders data settings section title', () => {
    render(<AppDataSettingsSection />);
    expect(screen.getByText('데이터 설정')).toBeTruthy();
  });

  it('renders refresh interval label', () => {
    render(<AppDataSettingsSection />);
    expect(screen.getByText('갱신 주기')).toBeTruthy();
  });

  it('renders min detection ETH label', () => {
    render(<AppDataSettingsSection />);
    expect(screen.getByText('최소 감지 기준금액')).toBeTruthy();
  });

  it('renders currency label', () => {
    render(<AppDataSettingsSection />);
    expect(screen.getByText('표시 통화')).toBeTruthy();
  });
});
