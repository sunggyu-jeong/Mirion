import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { AppInfoCard, WalletAddressCard } from '../WalletInfoSection';

describe('WalletAddressCard', () => {
  it('address가 있으면 주소를 렌더링한다', () => {
    render(<WalletAddressCard address="0xabc123def456" />);
    expect(screen.getByText('0xabc123def456')).toBeTruthy();
    expect(screen.getByText('연결된 주소')).toBeTruthy();
  });

  it('address가 null이면 "-"를 렌더링한다', () => {
    render(<WalletAddressCard address={null} />);
    expect(screen.getByText('-')).toBeTruthy();
  });
});

describe('AppInfoCard', () => {
  it('버전과 네트워크 정보를 렌더링한다', () => {
    render(<AppInfoCard />);
    expect(screen.getByText('1.0.0')).toBeTruthy();
    expect(screen.getByText('Ethereum Mainnet (Lido)')).toBeTruthy();
  });
});
