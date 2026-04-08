import type { WhaleProfile } from '@entities/whale';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { WhaleCard } from '../WhaleCard';

const baseWhale: WhaleProfile = {
  id: 'vitalik',
  name: 'Vitalik Buterin',
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  tag: 'ETH 창시자',
  chain: 'ETH',
  ethBalance: 345_678_000_000_000_000_000_000n,
  totalValueUsd: 847_000_000,
  recentActivity: '3시간 전 · 100 ETH 전송',
  activityType: 'transfer',
  isLocked: false,
};

describe('WhaleCard', () => {
  it('should render whale name and tag', () => {
    render(
      <WhaleCard
        whale={baseWhale}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('Vitalik Buterin')).toBeTruthy();
    expect(screen.getByText('ETH 창시자')).toBeTruthy();
  });

  it('should render chain badge', () => {
    render(
      <WhaleCard
        whale={baseWhale}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('ETH')).toBeTruthy();
  });

  it('should render chain badge for BTC whale', () => {
    render(
      <WhaleCard
        whale={{ ...baseWhale, chain: 'BTC' }}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('BTC')).toBeTruthy();
  });

  it('should show formatted total value for free unlocked whale', () => {
    render(
      <WhaleCard
        whale={baseWhale}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('$847M')).toBeTruthy();
  });

  it('should hide total value for locked whale when not pro', () => {
    render(
      <WhaleCard
        whale={{ ...baseWhale, isLocked: true }}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('****')).toBeTruthy();
    expect(screen.queryByText('$847M')).toBeNull();
  });

  it('should show total value for locked whale when pro', () => {
    render(
      <WhaleCard
        whale={{ ...baseWhale, isLocked: true }}
        isPro={true}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('$847M')).toBeTruthy();
  });

  it('should call onPress with whale id when unlocked', () => {
    const onPress = jest.fn();
    render(
      <WhaleCard
        whale={baseWhale}
        isPro={false}
        onPress={onPress}
        onUpgrade={() => {}}
      />,
    );
    fireEvent.press(screen.getByText('Vitalik Buterin'));
    expect(onPress).toHaveBeenCalledWith('vitalik');
  });

  it('should call onUpgrade when locked whale is pressed', () => {
    const onUpgrade = jest.fn();
    render(
      <WhaleCard
        whale={{ ...baseWhale, isLocked: true }}
        isPro={false}
        onPress={() => {}}
        onUpgrade={onUpgrade}
      />,
    );
    fireEvent.press(screen.getByText('Vitalik Buterin'));
    expect(onUpgrade).toHaveBeenCalled();
  });

  it('should show PRO badge for locked whale when not pro', () => {
    render(
      <WhaleCard
        whale={{ ...baseWhale, isLocked: true }}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('PRO')).toBeTruthy();
  });

  it('should show recent activity for unlocked whale', () => {
    render(
      <WhaleCard
        whale={baseWhale}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('3시간 전 · 100 ETH 전송')).toBeTruthy();
  });

  it('should show dash when recentActivity is undefined', () => {
    render(
      <WhaleCard
        whale={{ ...baseWhale, recentActivity: undefined }}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('should hide recent activity for locked whale when not pro', () => {
    render(
      <WhaleCard
        whale={{ ...baseWhale, isLocked: true }}
        isPro={false}
        onPress={() => {}}
        onUpgrade={() => {}}
      />,
    );
    expect(screen.getByText('구독 후 최근 활동 확인 가능')).toBeTruthy();
  });
});
