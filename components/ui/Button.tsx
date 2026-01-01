import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Button({
  onPress,
  children,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: isDisabled 
          ? Colors[colorScheme].textMuted 
          : Colors[colorScheme].primary,
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: isDisabled 
          ? Colors[colorScheme].textMuted 
          : Colors[colorScheme].secondary,
      };
    }

    if (variant === 'outline') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors[colorScheme].border,
      };
    }

    return baseStyle;
  };

  const getTextColor = (): string => {
    if (variant === 'outline') {
      return Colors[colorScheme].text;
    }
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText
          style={[
            {
              color: getTextColor(),
              fontSize: 16,
              fontWeight: '600',
            },
            textStyle,
          ]}
        >
          {children}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

