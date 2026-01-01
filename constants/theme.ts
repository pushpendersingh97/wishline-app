/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Primary Colors - Emerald Green
const primaryLight = '#00a36c';
const primaryHoverLight = '#008f5a';
const primaryDark = '#00d88b';
const primaryHoverDark = '#00c47a';

// Secondary Colors - Deep Teal
const secondaryLight = '#004d40';
const secondaryDark = '#006b5c';

// Accent/Success - Bright Lime
const accent = '#55e68c';

const tintColorLight = primaryLight;
const tintColorDark = primaryDark;

export const Colors = {
  light: {
    text: '#1e1e1e',
    textMuted: '#6a6a6a',
    background: '#f7f7f7',
    backgroundCard: '#ffffff',
    backgroundHover: '#efefef',
    primary: primaryLight,
    primaryHover: primaryHoverLight,
    secondary: secondaryLight,
    accent: accent,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: 'rgba(30, 30, 30, 0.1)',
    error: '#dc2626',
    success: '#16a34a',
  },
  dark: {
    text: '#ffffff',
    textMuted: '#afafaf',
    background: '#121212',
    backgroundCard: '#1e1e1e',
    backgroundHover: '#2a2a2a',
    primary: primaryDark,
    primaryHover: primaryHoverDark,
    secondary: secondaryDark,
    accent: accent,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#ef4444',
    success: '#22c55e',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
