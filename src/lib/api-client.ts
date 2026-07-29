import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, ROUTES } from '@/constants';
import { installMockInterceptor } from '@/lib/mock/handler';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Install mock interceptor FIRST (before auth interceptor)
// Runs when NEXT_PUBLIC_USE_MOCK_API=true or no API URL is configured
installMockInterceptor(apiClient);

// Request interceptor - inject token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = getCookie(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors & token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getCookie(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        setCookie(TOKEN_KEY, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        clearAuthCookies();
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Cookie helpers (secure storage)
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const setCookie = (name: string, value: string, days = 7): void => {
  if (typeof document === 'undefined') return;
  const expires  = new Date(Date.now() + days * 864e5).toUTCString();
  // Secure=true only in production (HTTPS). localhost is HTTP → Secure blocks the cookie.
  // SameSite=Lax allows cookie on top-level navigations (required for middleware redirect flow).
  const isProduction = process.env.NODE_ENV === 'production';
  const secure       = isProduction ? '; Secure' : '';
  document.cookie = `${name}=${value}; expires=${expires}; path=/${secure}; SameSite=Lax`;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const clearAuthCookies = (): void => {
  deleteCookie(TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
};

export default apiClient;
