import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { DisclaimerBox } from '../DisclaimerBox';

describe('DisclaimerBox', () => {
  const defaultProps = {
    title: '원금 차감 가능성 안내',
    body: '가스비 대납 혜택을 드리고 있으나 부족한 만큼 원금에서 정산됩니다.',
    highlightedText: '부족한 만큼 원금에서 정산',
  };

  it('제목을 렌더링한다', () => {
    render(<DisclaimerBox {...defaultProps} />);
    expect(screen.getByText('원금 차감 가능성 안내')).toBeTruthy();
  });

  it('! 배지를 렌더링한다', () => {
    render(<DisclaimerBox {...defaultProps} />);
    expect(screen.getByText('!')).toBeTruthy();
  });

  it('하이라이트 텍스트를 포함한 본문을 렌더링한다', () => {
    render(<DisclaimerBox {...defaultProps} />);
    expect(screen.getByText('부족한 만큼 원금에서 정산')).toBeTruthy();
  });

  it('본문 앞부분 텍스트를 렌더링한다', () => {
    render(<DisclaimerBox {...defaultProps} />);
    expect(screen.getByText(/가스비 대납 혜택을 드리고 있으나/)).toBeTruthy();
  });
});
