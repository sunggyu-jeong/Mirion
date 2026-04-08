import { useCountUp } from '@shared/lib/use-count-up';
import React from 'react';
import { Text, type TextStyle } from 'react-native';

type Props = {
  value: number;
  formatter?: (v: number) => string;
  style?: TextStyle;
};

export function RollupText({ value, formatter = String, style }: Props) {
  const displayed = useCountUp(value);
  return <Text style={style}>{formatter(displayed)}</Text>;
}
