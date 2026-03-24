import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { WalletOption } from '../WalletOption';

const mockIcon = { uri: 'test-icon' };

describe('WalletOption', () => {
  it('label을 렌더링한다', () => {
    render(
      <WalletOption
        label="MetaMask"
        icon={mockIcon}
        selected={false}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('MetaMask')).toBeTruthy();
  });

  it('선택된 상태에서 체크마크를 렌더링한다', () => {
    render(
      <WalletOption
        label="MetaMask"
        icon={mockIcon}
        selected={true}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('✓')).toBeTruthy();
  });

  it('선택되지 않은 상태에서 체크마크가 없다', () => {
    render(
      <WalletOption
        label="MetaMask"
        icon={mockIcon}
        selected={false}
        onPress={jest.fn()}
      />,
    );
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('onPress 핸들러를 호출한다', () => {
    const onPress = jest.fn();
    render(
      <WalletOption
        label="MetaMask"
        icon={mockIcon}
        selected={false}
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByText('MetaMask'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
