import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { appConfig } from '@/lib/config';
import { authService, type RegisterUserRequest } from '@/lib/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { safePush } from '@/lib/utils/navigation';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [formData, setFormData] = useState<RegisterUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterUserRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundCard');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const errorColor = Colors[colorScheme].error;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterUserRequest, string>> = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 3) {
      newErrors.firstName = 'First name must be at least 3 characters';
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 3) {
      newErrors.lastName = 'Last name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(formData);
      // Store email for OTP page
      await AsyncStorage.setItem('signupEmail', formData.email);
      safePush('/verify-otp');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to register. Please try again.';
      if (errorMessage.includes('already present')) {
        setErrors({ email: 'Email already registered. Please login instead.' });
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: primaryColor }]}>
              <Ionicons name="star" size={24} color="#ffffff" />
            </View>
            <ThemedText style={[styles.logoText, { color: primaryColor }]}>
              {appConfig.name}
            </ThemedText>
          </View>

          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            Create Account
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textMuted }]}>
            Sign up to start managing your wishlist
          </ThemedText>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                First Name <ThemedText style={{ color: errorColor }}>*</ThemedText>
              </ThemedText>
              <Input
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({ ...formData, firstName: text });
                  if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                }}
                error={!!errors.firstName}
              />
              {errors.firstName && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {errors.firstName}
                </ThemedText>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Last Name <ThemedText style={{ color: errorColor }}>*</ThemedText>
              </ThemedText>
              <Input
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({ ...formData, lastName: text });
                  if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                }}
                error={!!errors.lastName}
              />
              {errors.lastName && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {errors.lastName}
                </ThemedText>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Email <ThemedText style={{ color: errorColor }}>*</ThemedText>
              </ThemedText>
              <Input
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
              />
              {errors.email && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {errors.email}
                </ThemedText>
              )}
            </View>

            {/* Signup Button */}
            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme].border }]} />
            <ThemedText style={[styles.dividerText, { color: textMuted }]}>or</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme].border }]} />
          </View>

          {/* Login Link */}
          <View style={styles.linksContainer}>
            <ThemedText style={[styles.linkText, { color: textMuted }]}>
              Already have an account?{' '}
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.link, { color: primaryColor }]}>
                    Login
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  linksContainer: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
});

