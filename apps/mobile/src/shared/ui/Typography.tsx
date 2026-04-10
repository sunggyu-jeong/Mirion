import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

// ─── Variant ────────────────────────────────────────────────────────────────

type Variant = 'Headline' | 'Title' | 'Subtitle' | 'Body' | 'Callout' | 'Caption';

const VARIANT_STYLE: Record<Variant, TextStyle> = {
  Headline: {
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontFamily: 'Pretendard-Bold',
  },
  Title: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.4,
    fontFamily: 'Pretendard-Bold',
  },
  Subtitle: {
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.3,
    fontFamily: 'Pretendard-SemiBold',
  },
  Body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
    fontFamily: 'Pretendard-Regular',
  },
  Callout: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.1,
    fontFamily: 'Pretendard-Regular',
  },
  Caption: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Pretendard-Regular',
  },
} as const;

// ─── Color tokens ────────────────────────────────────────────────────────────

type ColorToken = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'accent';

const COLOR_VALUE: Record<ColorToken, string> = {
  primary: '#191F28',
  secondary: '#8B95A1',
  tertiary: '#B0B8C1',
  disabled: '#C9CDD2',
  inverse: '#FFFFFF',
  accent: '#3182F6',
} as const;

// ─── Props ───────────────────────────────────────────────────────────────────

export interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: ColorToken;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Typography({
  variant = 'Body',
  color = 'primary',
  style,
  children,
  ...rest
}: TypographyProps) {
  const variantStyle = VARIANT_STYLE[variant];
  const colorValue = COLOR_VALUE[color];

  return (
    <Text
      style={[variantStyle, { color: colorValue }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
