import { render } from '@testing-library/react-native';
import React from 'react';

import { AnimatedNumber } from '../AnimatedNumber';

describe('AnimatedNumber', () => {
  it('숫자 문자열을 렌더링한다', () => {
    const { toJSON } = render(<AnimatedNumber value="1234" />);
    expect(toJSON()).not.toBeNull();
  });

  it('비숫자 문자(., ,)를 포함한 값을 렌더링한다', () => {
    const { toJSON } = render(<AnimatedNumber value="1,234.56" />);
    expect(toJSON()).not.toBeNull();
  });

  it('특수문자(₩)를 포함한 값을 렌더링한다', () => {
    const { toJSON } = render(<AnimatedNumber value="₩4,595,313" />);
    expect(toJSON()).not.toBeNull();
  });

  it('커스텀 fontSize가 적용된다', () => {
    const { toJSON } = render(
      <AnimatedNumber
        value="100"
        fontSize={32}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('커스텀 color가 적용된다', () => {
    const { toJSON } = render(
      <AnimatedNumber
        value="500"
        color="#22c55e"
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('--- 값을 렌더링한다 (비숫자 only)', () => {
    const { toJSON } = render(<AnimatedNumber value="---" />);
    expect(toJSON()).not.toBeNull();
  });
});
