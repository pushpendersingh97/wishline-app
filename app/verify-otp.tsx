import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { appConfig } from '@/lib/config';
import { authService } from '@/lib/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { safeNavigate } from '@/lib/utils/navigation';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const errorColor = Colors[colorScheme].error;
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'backgroundCard');

  useEffect(() => {
    const loadEmail = async () => {
      const signupEmail = await AsyncStorage.getItem('signupEmail');
      const resetPasswordEmail = await AsyncStorage.getItem('resetPasswordEmail');
      const emailParam = params.email ? String(params.email) : null;
      const type = params.type ? String(params.type) : null;
      const userEmail = signupEmail || resetPasswordEmail || emailParam || '';

      if (!userEmail) {
        if (type === 'reset') {
          safeNavigate('/forgot-password');
        } else {
          safeNavigate('/signup');
        }
        return;
      }

      setEmail(userEmail);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    };

    loadEmail();
  }, [router, params]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = otp.join('');
    const type = params.type ? String(params.type) : null;

    if (verificationCode.length !== 6) {
      const errorMsg = 'Please enter the complete 6-digit code';
      setError(errorMsg);
      return;
    }

    if (!email) {
      const errorMsg = 'Email is missing. Please start over.';
      setError(errorMsg);
      if (type === 'reset') {
        safeNavigate('/forgot-password');
      } else {
        safeNavigate('/signup');
      }
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.verifyOTP({
        email,
        verificationCode,
      });
      // Store email for password setup/reset
      await AsyncStorage.setItem('verifiedEmail', email);
      await AsyncStorage.removeItem('signupEmail');
      await AsyncStorage.removeItem('resetPasswordEmail');
      
      // Redirect based on flow type
      if (type === 'reset') {
        safeNavigate('/set-password?type=reset');
      } else {
        safeNavigate('/set-password');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email is missing. Please start over.');
      return;
    }
    const type = params.type ? String(params.type) : null;

    setIsResending(true);
    setError('');

    try {
      if (type === 'reset') {
        // Resend reset password OTP
        await authService.forgotPassword({ email });
      } else {
        // Re-register to get new OTP for signup
        const emailParts = email.split('@');
        const firstName = emailParts[0].split('.')[0] || 'User';
        const lastName = emailParts[0].split('.')[1] || 'Name';

        await authService.register({
          firstName,
          lastName,
          email,
        });
      }
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsResending(false);
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
            {params.type === 'reset' ? 'Verify Reset Code' : 'Verify Your Email'}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textMuted }]}>
            We've sent a 6-digit verification code to
          </ThemedText>
          <ThemedText style={[styles.emailText, { color: textColor }]}>
            {email}
          </ThemedText>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                style={[
                  styles.otpInput,
                  {
                    color: textColor,
                    backgroundColor: cardBackground,
                    borderColor: error ? errorColor : borderColor,
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(index, value)}
                onKeyPress={(e) => handleKeyDown(index, e)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error Message */}
          {error && (
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

          {/* Verify Button */}
          <Button
            onPress={handleVerify}
            disabled={isLoading || otp.some((d) => !d)}
            loading={isLoading}
            style={styles.verifyButton}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <ThemedText style={[styles.resendText, { color: textMuted }]}>
              Didn't receive the code?{' '}
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
              >
                <ThemedText
                  style={[
                    styles.resendLink,
                    { color: primaryColor },
                    isResending && { opacity: 0.5 },
                  ]}
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedText>
          </View>

          {/* Back Link */}
          <TouchableOpacity
            onPress={() => {
              if (params.type === 'reset') {
                safeNavigate('/forgot-password');
              } else {
                safeNavigate('/signup');
              }
            }}
            style={styles.backLink}
          >
            <ThemedText style={[styles.backLinkText, { color: primaryColor }]}>
              ← Back to {params.type === 'reset' ? 'Forgot Password' : 'Sign Up'}
            </ThemedText>
          </TouchableOpacity>
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
    fontSize: 14,
    marginBottom: 4,
  },
  emailText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

