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
  it('renders the correct greeting text', () => {
    render(<Greeting name="LockFi" />);
    expect(screen.getByText('Hello, LockFi!')).toBeTruthy();
  });
});
