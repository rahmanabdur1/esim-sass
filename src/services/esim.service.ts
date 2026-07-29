import apiClient from '@/lib/api-client';
import type { ESIM, ApiResponse, PaginatedResponse } from '@/types';

export const esimService = {
  async getAll(): Promise<PaginatedResponse<ESIM>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ESIM>>>('/esims');
    return data.data;
  },

  async getById(id: string): Promise<ESIM> {
    const { data } = await apiClient.get<ApiResponse<ESIM>>(`/esims/${id}`);
    return data.data;
  },

  async activate(id: string): Promise<ESIM> {
    const { data } = await apiClient.post<ApiResponse<ESIM>>(`/esims/${id}/activate`);
    return data.data;
  },

  async getQRCode(id: string): Promise<string> {
    const { data } = await apiClient.get<ApiResponse<{ qrCode: string }>>(`/esims/${id}/qrcode`);
    return data.data.qrCode;
  },
};
