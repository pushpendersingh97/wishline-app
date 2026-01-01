import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  colorScheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const initialColorScheme = (systemColorScheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(initialColorScheme);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('themePreference');
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemePreferenceState(saved as ThemePreference);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  // Update color scheme based on preference
  useEffect(() => {
    if (themePreference === 'system') {
      setColorScheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setColorScheme(themePreference);
    }
  }, [themePreference, systemColorScheme]);

  const setThemePreference = useCallback(async (theme: ThemePreference) => {
    try {
      await AsyncStorage.setItem('themePreference', theme);
      setThemePreferenceState(theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  // Provide stable context value
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      themePreference,
      setThemePreference,
      colorScheme,
    }),
    [themePreference, setThemePreference, colorScheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

