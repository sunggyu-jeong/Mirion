import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

function Greeting({ name }: { name: string }) {
  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  );
}

describe('Greeting', () => {
  it('올바른 인사 텍스트를 렌더링한다', () => {
    render(<Greeting name="LockFi" />);
    expect(screen.getByText('Hello, LockFi!')).toBeTruthy();
  });
});
