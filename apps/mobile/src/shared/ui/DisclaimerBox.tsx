import React from 'react';
import { Text, View } from 'react-native';

type DisclaimerBoxProps = {
  title: string;
  body: string;
  highlightedText: string;
};

export function DisclaimerBox({ title, body, highlightedText }: DisclaimerBoxProps) {
  const [before, after] = body.split(highlightedText);

  return (
    <View
      style={{
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 18,
        paddingVertical: 22,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#ffe2e2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#fb2c36',
              textAlign: 'center',
              lineHeight: 21,
            }}
          >
            !
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#0f172b',
            letterSpacing: 0.48,
            lineHeight: 24,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          color: '#0f172b',
          letterSpacing: -0.028,
          lineHeight: 21,
        }}
      >
        {before}
        <Text style={{ fontWeight: '500', color: '#fb2c36' }}>{highlightedText}</Text>
        {after}
      </Text>
    </View>
  );
}
