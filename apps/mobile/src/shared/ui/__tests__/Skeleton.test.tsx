import { render } from '@testing-library/react-native';
import React from 'react';

import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('기본 props로 렌더링된다', () => {
    const { toJSON } = render(
      <Skeleton
        width={120}
        height={20}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('borderRadius 기본값(8)으로 렌더링된다', () => {
    const { toJSON } = render(
      <Skeleton
        width={100}
        height={16}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('커스텀 borderRadius로 렌더링된다', () => {
    const { toJSON } = render(
      <Skeleton
        width={80}
        height={12}
        borderRadius={4}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('string width로 렌더링된다', () => {
    const { toJSON } = render(
      <Skeleton
        width="100%"
        height={24}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
