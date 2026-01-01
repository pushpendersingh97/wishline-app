import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from './config';

const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 30000, // Increased timeout for mobile networks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API configuration on initialization
if (__DEV__) {
  console.log('API Client initialized with baseURL:', appConfig.apiBaseUrl);
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`API Success [${response.config.method?.toUpperCase()}]`, response.config.url);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log error details in development
    if (__DEV__) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle network errors
    if (!error.response) {
      const networkError = error.code === 'ECONNABORTED' 
        ? 'Request timeout. Please check your connection.'
        : error.message || 'Network error. Please check your internet connection.';
      return Promise.reject(new Error(networkError));
    }

    // Handle 401 Unauthorized - clear token
    if (error.response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }

    // Extract error message from response
    const message =
      (error.response.data as any)?.message ?? 
      error.response.statusText ?? 
      error.message ?? 
      'An error occurred. Please try again.';
    
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

