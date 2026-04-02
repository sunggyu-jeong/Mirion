jest.mock('@widgets/tx-history', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    TxHistoryWidget: () => <Text testID="tx-history-widget">TxHistoryWidget</Text>,
  };
});

jest.mock('@shared/ui', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ScreenTitle: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  };
});

import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { HistoryScreen } from '../HistoryScreen';

describe('HistoryScreen', () => {
  it('"내역" 타이틀을 렌더링한다', () => {
    render(<HistoryScreen />);
    expect(screen.getByText('내역')).toBeTruthy();
  });

  it('TxHistoryWidget을 렌더링한다', () => {
    render(<HistoryScreen />);
    expect(screen.getByTestId('tx-history-widget')).toBeTruthy();
  });
});
