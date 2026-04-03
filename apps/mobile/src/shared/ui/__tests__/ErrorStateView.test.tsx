import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { ErrorStateView } from '../ErrorStateView';

describe('ErrorStateView', () => {
  it('title을 렌더링한다', () => {
    render(
      <ErrorStateView
        icon={<Text>!</Text>}
        title="오류 발생"
        description={['잠시 후 다시 시도해주세요']}
      />,
    );
    expect(screen.getByText('오류 발생')).toBeTruthy();
  });

  it('description 배열을 렌더링한다', () => {
    render(
      <ErrorStateView
        icon={<Text>!</Text>}
        title="오류"
        description={['첫 번째 줄', '두 번째 줄']}
      />,
    );
    expect(screen.getByText('첫 번째 줄')).toBeTruthy();
    expect(screen.getByText('두 번째 줄')).toBeTruthy();
  });

  it('iconBg 기본값으로 렌더링된다', () => {
    const { toJSON } = render(
      <ErrorStateView
        icon={<Text>?</Text>}
        title="테스트"
        description={['설명']}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('iconBg 커스텀 값으로 렌더링된다', () => {
    const { toJSON } = render(
      <ErrorStateView
        icon={<Text>!</Text>}
        iconBg="#ff0000"
        title="오류"
        description={['설명']}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
