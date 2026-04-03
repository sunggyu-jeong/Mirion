import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ReceiptRow } from '../ReceiptRow';

describe('ReceiptRow', () => {
  it('label과 amount를 렌더링한다', () => {
    render(
      <ReceiptRow
        label="스테이킹 금액"
        amount="1.5"
      />,
    );
    expect(screen.getByText('스테이킹 금액')).toBeTruthy();
    expect(screen.getByText('1.5')).toBeTruthy();
  });

  it('unit 기본값 ETH를 렌더링한다', () => {
    render(
      <ReceiptRow
        label="금액"
        amount="0.5"
      />,
    );
    expect(screen.getByText('ETH')).toBeTruthy();
  });

  it('unit이 빈 문자열이면 unit을 렌더링하지 않는다', () => {
    render(
      <ReceiptRow
        label="APY"
        amount="3.5%"
        unit=""
      />,
    );
    expect(screen.queryByText('ETH')).toBeNull();
  });

  it('커스텀 unit을 렌더링한다', () => {
    render(
      <ReceiptRow
        label="보상"
        amount="10"
        unit="stETH"
      />,
    );
    expect(screen.getByText('stETH')).toBeTruthy();
  });

  it('amountColor prop이 적용된다', () => {
    const { toJSON } = render(
      <ReceiptRow
        label="수익"
        amount="0.1"
        amountColor="#22c55e"
      />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
