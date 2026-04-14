import { useSubscriptionStore } from '@entities/subscription';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { SubscriptionSection } from '../SubscriptionSection';

beforeEach(() => {
  useSubscriptionStore.setState({ isPro: false, notificationsEnabled: false });
});

afterEach(() => {
  useSubscriptionStore.setState({ isPro: false, notificationsEnabled: false });
});

describe('SubscriptionSection', () => {
  it('renders upgrade CTA when not pro', () => {
    render(<SubscriptionSection />);

    expect(screen.getByText('프로 시작하기 (데모)')).toBeTruthy();
  });

  it('shows all PRO benefits in free plan view', () => {
    render(<SubscriptionSection />);

    expect(screen.getByText('전체 고래 20+ 추적')).toBeTruthy();
    expect(screen.getByText('실시간 푸시 알림')).toBeTruthy();
    expect(screen.getByText('무제한 거래 내역')).toBeTruthy();
    expect(screen.getByText('정확한 자산 규모 공개')).toBeTruthy();
  });

  it('upgrades to pro when CTA is pressed', () => {
    render(<SubscriptionSection />);

    fireEvent.press(screen.getByText('프로 시작하기 (데모)'));

    expect(useSubscriptionStore.getState().isPro).toBe(true);
  });

  it('renders pro status when isPro is true', () => {
    useSubscriptionStore.setState({ isPro: true });

    render(<SubscriptionSection />);

    expect(screen.getByText('프로 구독 중')).toBeTruthy();
    expect(screen.getByText('구독 해제 (데모)')).toBeTruthy();
  });

  it('downgrades from pro when cancel button is pressed', () => {
    useSubscriptionStore.setState({ isPro: true, notificationsEnabled: true });

    render(<SubscriptionSection />);

    fireEvent.press(screen.getByText('구독 해제 (데모)'));

    const state = useSubscriptionStore.getState();
    expect(state.isPro).toBe(false);
    expect(state.notificationsEnabled).toBe(false);
  });

  it('renders section title', () => {
    render(<SubscriptionSection />);

    expect(screen.getByText('구독 플랜')).toBeTruthy();
  });
});
