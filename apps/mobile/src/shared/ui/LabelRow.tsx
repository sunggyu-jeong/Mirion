import React from 'react';
import { Text, View } from 'react-native';

interface LabelRowProps {
  label: string;
  children: React.ReactNode;
}

export function LabelRow({ label, children }: LabelRowProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: '#62748e', letterSpacing: -0.01 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
