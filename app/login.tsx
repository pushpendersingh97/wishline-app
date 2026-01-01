import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { appConfig } from "@/lib/config";
import { authService } from "@/lib/services/authService";
import { safeNavigate } from "@/lib/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    params.message ? String(params.message) : ""
  );

  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "backgroundCard");
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const errorColor = Colors[colorScheme].error;
  const successColor = Colors[colorScheme].success;

  const handleLogin = async () => {
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      // Store token and user info
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      // Navigate to dashboard or redirect URL
      const redirectUrl = params.redirect ? String(params.redirect) : "/(tabs)";
      safeNavigate(redirectUrl);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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

          {/* Welcome Message */}
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome Back
          </ThemedText>

          {/* Success Message */}
          {successMessage ? (
            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgba(22, 163, 74, 0.1)",
                },
              ]}
            >
              <ThemedText style={[styles.messageText, { color: successColor }]}>
                {successMessage}
              </ThemedText>
            </View>
          ) : null}

          {/* Error Message */}
          {error ? (
            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(220, 38, 38, 0.1)",
                },
              ]}
            >
              <ThemedText style={[styles.messageText, { color: errorColor }]}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              error={!!error && !email}
            />

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect={false}
                error={!!error && !password}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              disabled={isLoading}
              loading={isLoading}
              style={styles.loginButton}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </View>

          {/* Account Management Links */}
          <View style={styles.linksContainer}>
            <ThemedText style={styles.linkText}>
              Don't have an account?{" "}
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.link, { color: primaryColor }]}>
                    Sign Up
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </ThemedText>
            <Link href="/forgot-password" asChild>
              <TouchableOpacity>
                <ThemedText style={[styles.link, { color: primaryColor }]}>
                  Forgot Password?
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
    justifyContent: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "600",
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: 32,
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 15,
    zIndex: 1,
  },
  loginButton: {
    width: "100%",
    marginTop: 8,
  },
  linksContainer: {
    alignItems: "center",
    gap: 12,
  },
  linkText: {
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    fontSize: 14,
    fontWeight: "500",
  },
});
