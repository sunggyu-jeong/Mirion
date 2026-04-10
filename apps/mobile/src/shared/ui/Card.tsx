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
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
