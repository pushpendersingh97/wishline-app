import apiClient from '../apiClient';

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterUserResponse {
  message: string;
  data: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface VerifyUserRequest {
  email: string;
  verificationCode: string;
}

export interface VerifyUserResponse {
  message: string;
  data: string; // email
}

export interface UpdatePasswordRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordResponse {
  message: string;
  data: string; // email
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    token: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  data: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const authService = {
  register: async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
    const response = await apiClient.post<RegisterUserResponse>('/user', data);
    return response.data;
  },

  verifyOTP: async (data: VerifyUserRequest): Promise<VerifyUserResponse> => {
    const response = await apiClient.post<VerifyUserResponse>('/user/verify', data);
    return response.data;
  },

  updatePassword: async (
    data: UpdatePasswordRequest,
  ): Promise<UpdatePasswordResponse> => {
    const response = await apiClient.put<UpdatePasswordResponse>(
      '/user/updatepassword',
      data,
    );
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/user/login', data);
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>(
      '/user/reset-password',
      data,
    );
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>(
      '/user/profile',
      data,
    );
    return response.data;
  },
};

