import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/lib/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

type ThemePreference = 'light' | 'dark' | 'system';

export default function ProfileScreen() {
  const router = useRouter();
  const { themePreference, setThemePreference, colorScheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundCard');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = Colors[colorScheme].error;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          setUser(currentUser);
          setFormData({
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
          });
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const response = await authService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Update AsyncStorage with API response data
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    // Use setTimeout to ensure navigation happens after state updates
    setTimeout(() => {
      router.replace('/login');
    }, 0);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textMuted }]}>
            Loading profile...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: textMuted }]}>
            No user data available
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={[styles.name, { color: textColor }]}>
                {user.firstName} {user.lastName}
              </ThemedText>
              <ThemedText style={[styles.email, { color: textMuted }]}>
                {user.email}
              </ThemedText>
            </View>
            {!isEditing && (
              <Button onPress={() => setIsEditing(true)} style={styles.editButton}>
                Edit Profile
              </Button>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Personal Information
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textMuted }]}>
            Update your personal information and contact details.
          </ThemedText>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textMuted }]}>
                FIRST NAME
              </ThemedText>
              <Input
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
                editable={isEditing}
                style={!isEditing && styles.disabledInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textMuted }]}>
                LAST NAME
              </ThemedText>
              <Input
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastName: text })
                }
                editable={isEditing}
                style={!isEditing && styles.disabledInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textMuted }]}>
                EMAIL ADDRESS
              </ThemedText>
              <Input
                placeholder="Enter your email"
                value={formData.email}
                editable={false}
                style={styles.disabledInput}
              />
            </View>
          </View>

          {isEditing && (
            <View style={styles.buttonRow}>
              <Button
                onPress={handleSave}
                disabled={isSaving}
                loading={isSaving}
                style={styles.saveButton}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          )}

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: errorColor + '20' }]}>
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {error}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Theme Preference */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Theme Preference
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textMuted }]}>
            Choose how the app appears to you.
          </ThemedText>
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as ThemePreference[]).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setThemePreference(option)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      themePreference === option ? primaryColor + '20' : 'transparent',
                    borderColor: themePreference === option ? primaryColor : borderColor,
                  },
                ]}
              >
                <Ionicons
                  name={
                    option === 'light'
                      ? 'sunny'
                      : option === 'dark'
                        ? 'moon'
                        : 'phone-portrait'
                  }
                  size={20}
                  color={themePreference === option ? primaryColor : textMuted}
                />
                <ThemedText
                  style={[
                    styles.themeOptionText,
                    {
                      color: themePreference === option ? primaryColor : textColor,
                      fontWeight: themePreference === option ? '600' : '400',
                    },
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Information */}
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Account Information
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textMuted }]}>
            View your account details and status.
          </ThemedText>

          <View style={styles.accountInfo}>
            <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.infoLabel, { color: textMuted }]}>
                User ID
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>
                {user.id}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: textMuted }]}>
                Account Status
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>
                Active
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          onPress={handleLogout}
          variant="outline"
          style={[styles.logoutButton, { borderColor: errorColor }]}
        >
          <ThemedText style={[styles.logoutText, { color: errorColor }]}>
            Logout
          </ThemedText>
        </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  disabledInput: {
    opacity: 0.6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
  },
  accountInfo: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
  },
  themeOptionText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
});

