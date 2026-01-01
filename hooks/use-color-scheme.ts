import { useColorScheme as useRNColorScheme } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

// Export a hook that uses the theme context if available, otherwise falls back to system
export function useColorScheme() {
  const themeContext = useContext(ThemeContext);
  
  // If ThemeContext is available, use it
  if (themeContext) {
    return themeContext.colorScheme;
  }
  
  // Otherwise, fall back to system color scheme
  return useRNColorScheme();
}
