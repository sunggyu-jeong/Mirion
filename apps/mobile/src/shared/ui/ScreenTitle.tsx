import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export function ScreenTitle({ children, style }: Props) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172b',
    letterSpacing: -0.198,
    lineHeight: 30.8,
  },
});
