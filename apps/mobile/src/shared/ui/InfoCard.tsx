import React from 'react';
import { View } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export function InfoCard({ children }: Props) {
  return (
    <View
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 20,
        width: '100%',
      }}
    >
      {children}
    </View>
  );
}
