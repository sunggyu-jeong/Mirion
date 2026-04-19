import { useAppSettingsStore } from '@entities/app-settings';
import { useSubscriptionStore } from '@entities/subscription';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { NotificationSettingsSection } from '../NotificationSettingsSection';

beforeEach(() => {
  useSubscriptionStore.setState({ isPro: false, notificationsEnabled: false });
  useAppSettingsStore.setState({ quietHoursEnabled: false, alertMinEth: 100 });
});

afterEach(() => {
  useSubscriptionStore.setState({ isPro: false, notificationsEnabled: false });
});

describe('NotificationSettingsSection', () => {
  it('renders section title', () => {
    render(<NotificationSettingsSection />);

    expect(screen.getByText('알림 설정')).toBeTruthy();
  });

  it('renders notification toggle row', () => {
    render(<NotificationSettingsSection />);

    expect(screen.getByText('대규모 이체 알림')).toBeTruthy();
  });

  it('renders quiet hours row', () => {
    render(<NotificationSettingsSection />);

    expect(screen.getByText('방해 금지 모드')).toBeTruthy();
  });

  it('shows pro-only label when not pro', () => {
    render(<NotificationSettingsSection />);

    expect(screen.getByText('프로 전용 기능')).toBeTruthy();
  });

  it('does not show pro-only label when isPro is true', () => {
    useSubscriptionStore.setState({ isPro: true });

    render(<NotificationSettingsSection />);

    expect(screen.queryByText('프로 전용 기능')).toBeNull();
  });

  it('does not show threshold section when notifications are disabled', () => {
    useSubscriptionStore.setState({ isPro: true, notificationsEnabled: false });

    render(<NotificationSettingsSection />);

    expect(screen.queryByText('최소 알림 기준금액')).toBeNull();
  });

  it('shows threshold section when isPro and notificationsEnabled', () => {
    useSubscriptionStore.setState({ isPro: true, notificationsEnabled: true });

    render(<NotificationSettingsSection />);

    expect(screen.getByText('최소 알림 기준금액')).toBeTruthy();
  });

  it('renders quiet hours time range label', () => {
    render(<NotificationSettingsSection />);

    expect(screen.getByText('밤 12시 ~ 오전 7시')).toBeTruthy();
  });

  it('renders with quiet hours enabled', () => {
    useAppSettingsStore.setState({ quietHoursEnabled: true });

    render(<NotificationSettingsSection />);

    expect(screen.getByText('방해 금지 모드')).toBeTruthy();
  });
});
