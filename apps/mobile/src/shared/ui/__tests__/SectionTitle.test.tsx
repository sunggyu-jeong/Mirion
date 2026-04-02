import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { SectionTitle } from '../SectionTitle';

describe('SectionTitle', () => {
  it('title prop을 렌더링한다', () => {
    render(<SectionTitle title="지갑 정보" />);
    expect(screen.getByText('지갑 정보')).toBeTruthy();
  });

  it('다른 title도 렌더링한다', () => {
    render(<SectionTitle title="정보" />);
    expect(screen.getByText('정보')).toBeTruthy();
  });
});
