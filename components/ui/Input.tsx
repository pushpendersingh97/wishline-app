import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type InputProps = TextInputProps & {
  error?: boolean;
};

export function Input({ style, error, ...props }: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'backgroundCard');
  const borderColor = error 
    ? Colors[colorScheme].error 
    : useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'textMuted');

  return (
    <View style={[styles.container, { borderColor }]}>
      <TextInput
        style={[
          styles.input,
          { 
            color: textColor,
            backgroundColor,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

