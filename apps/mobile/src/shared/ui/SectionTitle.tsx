import React from 'react';
import { Text } from 'react-native';

export function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white', lineHeight: 25.2 }}>
      {title}
    </Text>
  );
}
