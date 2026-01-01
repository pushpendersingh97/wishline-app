import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { appConfig } from '@/lib/config';
import { authService } from '@/lib/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { safeNavigate } from '@/lib/utils/navigation';

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const isResetFlow = params.type === 'reset';

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const errorColor = Colors[colorScheme].error;

  useEffect(() => {
    const loadEmail = async () => {
      const verifiedEmail = await AsyncStorage.getItem('verifiedEmail');
      if (!verifiedEmail) {
        if (isResetFlow) {
          safeNavigate('/forgot-password');
        } else {
          safeNavigate('/signup');
        }
        return;
      }
      setEmail(verifiedEmail);
    };

    loadEmail();
  }, [router, isResetFlow]);

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length > 15) {
      newErrors.password = 'Password must be less than 15 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
      if (!validateForm() || !email) {
        if (!email) {
          if (isResetFlow) {
            safeNavigate('/forgot-password');
          } else {
            safeNavigate('/signup');
          }
        }
        return;
      }

    setIsLoading(true);
    try {
      await authService.updatePassword({
        email,
        password,
      });
      // Clear session storage
      await AsyncStorage.removeItem('verifiedEmail');
      await AsyncStorage.removeItem('signupEmail');
      await AsyncStorage.removeItem('resetPasswordEmail');
      // Redirect to login
      safeNavigate('/login?message=' + encodeURIComponent(
        isResetFlow
          ? 'Password reset successfully! Please login.'
          : 'Password set successfully! Please login.'
      ));
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to set password. Please try again.';
      if (errorMessage.includes('not verified')) {
        setErrors({ password: 'Please verify your email first' });
      } else {
        setErrors({ password: errorMessage });
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
            {isResetFlow ? 'Reset Your Password' : 'Set Your Password'}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textMuted }]}>
            {isResetFlow
              ? 'Enter your new password below'
              : 'Create a secure password for your account'}
          </ThemedText>

          {/* Form */}
          <View style={styles.form}>
            {/* Password */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Password <ThemedText style={{ color: errorColor }}>*</ThemedText>
              </ThemedText>
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Enter password (6-15 characters)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={!!errors.password}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {errors.password}
                </ThemedText>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Confirm Password <ThemedText style={{ color: errorColor }}>*</ThemedText>
              </ThemedText>
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  error={!!errors.confirmPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <ThemedText style={[styles.errorText, { color: errorColor }]}>
                  {errors.confirmPassword}
                </ThemedText>
              )}
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </Button>
          </View>

          {/* Back Link */}
          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.link, { color: primaryColor }]}>
                  {isResetFlow
                    ? 'Remember your password? Login'
                    : 'Already have a password? Login'}
                </ThemedText>
              </TouchableOpacity>
            </Link>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 15,
    zIndex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
  },
  linksContainer: {
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
});

