import apiClient, { setCookie, clearAuthCookies } from '@/lib/api-client';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants';
import type {
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
  ApiResponse,
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post<
      ApiResponse<{ user: User; token: string; refreshToken: string }>
    >('/auth/login', credentials);
    const days = credentials.rememberMe ? 30 : 7;
    setCookie(TOKEN_KEY, data.data.token, days);
    setCookie(REFRESH_TOKEN_KEY, data.data.refreshToken, days);
    return data.data;
  },

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    // Strip confirmPassword — backend doesn't need it
    const { confirmPassword: _, ...payload } = credentials;
    const { data } = await apiClient.post<
      ApiResponse<{ user: User; token: string; refreshToken: string }>
    >('/auth/register', payload);
    setCookie(TOKEN_KEY, data.data.token);
    setCookie(REFRESH_TOKEN_KEY, data.data.refreshToken);
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuthCookies();
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/auth/reset-password', payload);
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email });
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};
