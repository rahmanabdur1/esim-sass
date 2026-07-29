import apiClient from '@/lib/api-client';
import type { Plan, Country, ApiResponse, PaginatedResponse, PlanFilters } from '@/types';

export const plansService = {
  async getAll(filters?: PlanFilters): Promise<PaginatedResponse<Plan>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Plan>>>('/plans', {
      params: filters,
    });
    return data.data;
  },

  async getById(id: string): Promise<Plan> {
    const { data } = await apiClient.get<ApiResponse<Plan>>(`/plans/${id}`);
    return data.data;
  },

  async getByCountry(countryCode: string): Promise<Plan[]> {
    const { data } = await apiClient.get<ApiResponse<Plan[]>>(`/plans/country/${countryCode}`);
    return data.data;
  },

  async getFeatured(): Promise<Plan[]> {
    const { data } = await apiClient.get<ApiResponse<Plan[]>>('/plans/featured');
    return data.data;
  },
};

export const countriesService = {
  async getAll(): Promise<Country[]> {
    const { data } = await apiClient.get<ApiResponse<Country[]>>('/countries');
    return data.data;
  },

  async getById(id: string): Promise<Country> {
    const { data } = await apiClient.get<ApiResponse<Country>>(`/countries/${id}`);
    return data.data;
  },

  async getFeatured(): Promise<Country[]> {
    const { data } = await apiClient.get<ApiResponse<Country[]>>('/countries/featured');
    return data.data;
  },
};
