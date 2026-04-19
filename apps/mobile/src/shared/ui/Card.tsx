import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
