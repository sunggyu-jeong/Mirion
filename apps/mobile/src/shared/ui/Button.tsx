import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  size?: 'lg' | 'md';
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  isLoading,
  style,
}: ButtonProps) => {
  const containerStyles = [
    styles.base,
    variant === 'primary' && styles.primaryBtn,
    variant === 'ghost' && styles.ghostBtn,
    size === 'lg' && styles.lgBtn,
    size === 'md' && styles.mdBtn,
    disabled && styles.disabledBtn,
    style,
  ];

  const textStyles = [
    styles.textBase,
    variant === 'primary' ? styles.primaryText : styles.ghostText,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={containerStyles}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#000' : 'white'} />
      ) : (
        <Text style={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  lgBtn: {
    paddingVertical: 16,
  },
  mdBtn: {
    paddingVertical: 12,
  },
  disabledBtn: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  ghostText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
