import React from 'react';
import { Text, type TextProps } from 'react-native';

// ─── Variant ────────────────────────────────────────────────────────────────

type Variant = 'Headline' | 'Title' | 'Subtitle' | 'Body' | 'Callout' | 'Caption';

/**
 * variant → NativeWind className
 * font-pretendard-* 는 tailwind.config.js fontFamily에 등록된 키를 그대로 사용.
 * fontWeight는 fontFamily 이름에 weight가 내장되어 있으므로 별도 지정하지 않음.
 */
const VARIANT_CLASS: Record<Variant, string> = {
  Headline: 'text-2xl leading-[34px] tracking-[-0.5px] font-pretendard-bold',
  Title: 'text-xl  leading-[28px] tracking-[-0.4px] font-pretendard-bold',
  Subtitle: 'text-lg  leading-[26px] tracking-[-0.3px] font-pretendard-semibold',
  Body: 'text-base leading-6    tracking-[-0.2px] font-pretendard-regular',
  Callout: 'text-sm  leading-5    tracking-[-0.1px] font-pretendard-regular',
  Caption: 'text-[13px] leading-[19px]               font-pretendard-regular',
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
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Typography({
  variant = 'Body',
  color = 'primary',
  className = '',
  style,
  children,
  ...rest
}: TypographyProps) {
  const variantClass = VARIANT_CLASS[variant];
  const colorValue = COLOR_VALUE[color];

  return (
    <Text
      className={[variantClass, className].filter(Boolean).join(' ')}
      style={[{ color: colorValue }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
