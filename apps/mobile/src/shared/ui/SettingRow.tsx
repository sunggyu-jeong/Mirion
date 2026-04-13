import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}

export function SettingRow({ icon, label, sub, right, onPress, isLast = false }: SettingRowProps) {
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: '#f1f5f9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172b', letterSpacing: -0.02 }}>
          {label}
        </Text>
        {sub ? (
          <Text style={{ fontSize: 12, fontWeight: '400', color: '#94a3b8', letterSpacing: -0.01 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );

  if (!onPress) {
    return inner;
  }
  return <Pressable onPress={onPress}>{inner}</Pressable>;
}
