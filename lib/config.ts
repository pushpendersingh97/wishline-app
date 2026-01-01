import Constants from "expo-constants";

// Get API base URL from environment variables or use default
const getApiBaseUrl = (): string => {
  // Try to get from expo constants first
  const expoApiUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (expoApiUrl) {
    return expoApiUrl;
  }

  // Try environment variable (for development)
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Default fallback - use IP address for development
  // For physical devices, use your computer's IP address
  return "http://192.168.1.5:3000/api";
};

export const appConfig = {
  name: "Wishline",
  tagline: "Plan it. Track it. Finish it.",
  apiBaseUrl: getApiBaseUrl(),
  supportEmail: "support@wishline.app",
};

export type AppConfig = typeof appConfig;
