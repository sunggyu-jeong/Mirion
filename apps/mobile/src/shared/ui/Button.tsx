import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

import { cn } from '@/src/shared/lib/utils/cn';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  size?: 'lg' | 'md';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  isLoading,
  className,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      className={cn(
        'rounded-2xl flex-row justify-center items-center',
        variant === 'primary' && 'bg-primary',
        variant === 'ghost' && 'bg-transparent',
        size === 'lg' && 'py-4',
        size === 'md' && 'py-3',
        disabled && 'bg-gray-200 opacity-50',
        className,
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#000' : 'white'} />
      ) : (
        <Text
          className={cn(
            'font-bold text-center',
            variant === 'primary' ? 'text-white text-lg' : 'text-text-500 text-base',
          )}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
