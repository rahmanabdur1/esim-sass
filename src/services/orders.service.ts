import apiClient from '@/lib/api-client';
import type { Order, ApiResponse, PaginatedResponse } from '@/types';

export const ordersService = {
  async getAll(): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>('/orders');
    return data.data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  async create(payload: {
    planId: string;
    couponCode?: string;
    paymentMethodId: string;
  }): Promise<Order> {
    const { data } = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return data.data;
  },

  async applyCoupon(
    code: string,
    planId: string,
  ): Promise<{ discount: number; finalPrice: number }> {
    const { data } = await apiClient.post<ApiResponse<{ discount: number; finalPrice: number }>>(
      '/coupons/apply',
      {
        code,
        planId,
      },
    );
    return data.data;
  },

  async getInvoices(): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>('/invoices');
    return data.data;
  },

  async downloadInvoice(orderId: string): Promise<Blob> {
    const { data } = await apiClient.get(`/invoices/${orderId}/download`, {
      responseType: 'blob',
    });
    return data;
  },
};
