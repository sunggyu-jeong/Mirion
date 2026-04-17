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
        borderBottomColor: 'rgba(255,255,255,0.06)',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: 'rgba(255,255,255,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: 'white', letterSpacing: -0.02 }}>
          {label}
        </Text>
        {sub ? (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '400',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: -0.01,
            }}
          >
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
