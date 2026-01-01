import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableOpacity } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [apiKey, setApiKey] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundCard');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');

  const handleSave = () => {
    // TODO: Implement settings save functionality
    alert(`Saved theme: ${theme} with apiKey: ${apiKey || 'demo'}`);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textMuted }]}>
            Manage theme, tokens, and advanced preferences
          </ThemedText>
        </View>

        {/* Theme Preference */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Theme Preference
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textMuted }]}>
            Pick how the app renders for your workspace.
          </ThemedText>
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as ThemePreference[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setTheme(option)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      theme === option ? primaryColor + '20' : 'transparent',
                    borderColor: theme === option ? primaryColor : borderColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.themeOptionText,
                    {
                      color: theme === option ? primaryColor : textColor,
                      fontWeight: theme === option ? '600' : '400',
                    },
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Access */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            API Access
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textMuted }]}>
            Paste the backend token issued from the Wishline admin portal.
          </ThemedText>
          <View style={styles.apiSection}>
            <ThemedText style={[styles.label, { color: textMuted }]}>
              SERVICE TOKEN
            </ThemedText>
            <Input
              placeholder="sk_live_123"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              style={styles.apiInput}
            />
            <Button onPress={handleSave} style={styles.saveButton}>
              Save Configuration
            </Button>
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            App Information
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: textMuted }]}>
              Version
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: textColor }]}>
              1.0.0
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: textMuted }]}>
              Build
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: textColor }]}>
              Production
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  apiSection: {
    marginTop: 20,
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  apiInput: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
});

