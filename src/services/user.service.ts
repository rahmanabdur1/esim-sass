import apiClient from '@/lib/api-client';
import type {
  User,
  ApiResponse,
  AnalyticsData,
  Notification,
  SupportTicket,
  ReferralData,
  RewardData,
  PaymentMethod,
  PaginatedResponse,
} from '@/types';

// ── Local types for session/activity (not in global types yet) ──
export interface Session {
  id:         string;
  device:     string;
  browser:    string;
  os:         string;
  location:   string;
  ip:         string;
  lastActive: string;
  current:    boolean;
}

export interface ActivityEvent {
  id:          string;
  type:        'login' | 'logout' | 'settings_change' | 'password_change' | 'security_alert';
  description: string;
  ip:          string;
  location:    string;
  browser:     string;
  os:          string;
  timestamp:   string;
  success:     boolean;
}

export const userService = {
  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<User>>('/user/profile', payload);
    return data.data;
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await apiClient.post<ApiResponse<User>>('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },


  async getAnalytics(): Promise<AnalyticsData> {
    const { data } = await apiClient.get<ApiResponse<AnalyticsData>>('/user/analytics');
    return data.data;
  },

  async getNotifications(): Promise<PaginatedResponse<Notification>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/user/notifications');
    return data.data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await apiClient.patch(`/user/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiClient.patch('/user/notifications/read-all');
  },

  async getSupportTickets(): Promise<PaginatedResponse<SupportTicket>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<SupportTicket>>>('/user/tickets');
    return data.data;
  },

  async createSupportTicket(payload: { subject: string; description: string; priority: string }): Promise<SupportTicket> {
    const { data } = await apiClient.post<ApiResponse<SupportTicket>>('/user/tickets', payload);
    return data.data;
  },

  async getReferralData(): Promise<ReferralData> {
    const { data } = await apiClient.get<ApiResponse<ReferralData>>('/user/referral');
    return data.data;
  },

  async getRewardData(): Promise<RewardData> {
    const { data } = await apiClient.get<ApiResponse<RewardData>>('/user/rewards');
    return data.data;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data } = await apiClient.get<ApiResponse<PaymentMethod[]>>('/user/payment-methods');
    return data.data;
  },

  async addPaymentMethod(payload: { token: string; type: string }): Promise<PaymentMethod> {
    const { data } = await apiClient.post<ApiResponse<PaymentMethod>>('/user/payment-methods', payload);
    return data.data;
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await apiClient.delete(`/user/payment-methods/${id}`);
  },

  async setDefaultPaymentMethod(id: string): Promise<void> {
    await apiClient.patch(`/user/payment-methods/${id}/default`);
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/user/account');
  },

  async exportData(): Promise<{ downloadUrl: string; expiresAt: string }> {
    const { data } = await apiClient.get<ApiResponse<{ downloadUrl: string; expiresAt: string }>>('/users/me/export');
    return data.data;
  },

  async getActiveSessions(): Promise<Session[]> {
    const { data } = await apiClient.get<ApiResponse<Session[]>>('/users/me/sessions');
    return data.data;
  },

  async revokeSession(id: string): Promise<void> {
    await apiClient.delete(`/users/me/sessions/${id}`);
  },

  async getActivityLog(): Promise<ActivityEvent[]> {
    const { data } = await apiClient.get<ApiResponse<ActivityEvent[]>>('/users/me/activity');
    return data.data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put('/users/me/password', payload);
  },

  async removePaymentMethod(id: string): Promise<void> {
    await apiClient.delete(`/user/payment-methods/${id}`);
  },

  async getSettings(): Promise<Record<string, unknown>> {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>('/user/settings');
    return data.data;
  },

  async updateSettings(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>('/user/settings', payload);
    return data.data;
  },
};
