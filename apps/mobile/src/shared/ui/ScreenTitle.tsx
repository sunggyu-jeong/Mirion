import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native';

import { typography } from './typography';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export function ScreenTitle({ children, style }: Props) {
  return <Text style={[typography.title2, style]}>{children}</Text>;
}
