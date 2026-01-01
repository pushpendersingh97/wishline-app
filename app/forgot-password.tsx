import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const errorColor = Colors[colorScheme].error;
  const successColor = Colors[colorScheme].success;

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      // Store email for OTP verification page
      await AsyncStorage.setItem('resetPasswordEmail', email);
      setSuccess(true);
      // Redirect to verify OTP page after a short delay
      safeNavigate(`/verify-otp?email=${encodeURIComponent(email)}&type=reset`, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Failed to send reset code. Please try again.';
      setError(errorMessage);
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
            Forgot Password?
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textMuted }]}>
            Enter your email address and we'll send you a verification code to reset
            your password
          </ThemedText>

          {/* Success Message */}
          {success && (
            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(22, 163, 74, 0.1)',
                },
              ]}
            >
              <ThemedText style={[styles.messageText, { color: successColor }]}>
                Verification code sent! Redirecting to verification page...
              </ThemedText>
            </View>
          )}

          {/* Error Message */}
          {error && !success && (
            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(220, 38, 38, 0.1)',
                },
              ]}
            >
              <ThemedText style={[styles.messageText, { color: errorColor }]}>
                {error}
              </ThemedText>
            </View>
          )}

          {/* Form */}
          {!success && (
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Email <ThemedText style={{ color: errorColor }}>*</ThemedText>
                </ThemedText>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={!!error}
                />
              </View>

              {/* Submit Button */}
              <Button
                onPress={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                style={styles.submitButton}
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </View>
          )}

          {/* Back to Login */}
          <View style={styles.linksContainer}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.link, { color: primaryColor }]}>
                  ← Back to Login
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
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
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

