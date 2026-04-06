import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ChainFilterBar } from '../ChainFilterBar';

describe('ChainFilterBar', () => {
  it('should render all chain options', () => {
    render(
      <ChainFilterBar
        value="ALL"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('전체')).toBeTruthy();
    expect(screen.getByText('ETH')).toBeTruthy();
    expect(screen.getByText('BTC')).toBeTruthy();
    expect(screen.getByText('SOL')).toBeTruthy();
    expect(screen.getByText('BNB')).toBeTruthy();
  });

  it('should call onChange when a chain pill is pressed', () => {
    const onChange = jest.fn();
    render(
      <ChainFilterBar
        value="ALL"
        onChange={onChange}
      />,
    );
    fireEvent.press(screen.getByText('ETH'));
    expect(onChange).toHaveBeenCalledWith('ETH');
  });

  it('should call onChange with ALL when 전체 is pressed', () => {
    const onChange = jest.fn();
    render(
      <ChainFilterBar
        value="ETH"
        onChange={onChange}
      />,
    );
    fireEvent.press(screen.getByText('전체'));
    expect(onChange).toHaveBeenCalledWith('ALL');
  });

  it('should call onChange with correct chain for each pill', () => {
    const onChange = jest.fn();
    render(
      <ChainFilterBar
        value="ALL"
        onChange={onChange}
      />,
    );
    const chains = ['BTC', 'SOL', 'BNB'] as const;
    chains.forEach(chain => {
      fireEvent.press(screen.getByText(chain));
      expect(onChange).toHaveBeenCalledWith(chain);
    });
  });
});
