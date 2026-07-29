import { plansService, countriesService } from '@/services/plans.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

describe('plansService Integration', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAll returns paginated plans', async () => {
    const mockPlans = { data: { data: [{ id: '1', name: 'Japan 5GB', price: 4.99 }], total: 1, page: 1, limit: 10, totalPages: 1 }, message: 'ok', success: true };
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockPlans });

    const result = await plansService.getAll();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Japan 5GB');
  });

  it('getFeatured calls /plans/featured', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { data: [], message: 'ok', success: true } });
    await plansService.getFeatured();
    expect(apiClient.get).toHaveBeenCalledWith('/plans/featured');
  });
});

describe('countriesService Integration', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAll returns countries list', async () => {
    const mockCountries = { data: { data: [{ id: '1', name: 'Japan', code: 'JP', flag: '🇯🇵' }] }, message: 'ok', success: true };
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockCountries });

    const result = await countriesService.getAll();
    expect(Array.isArray(result)).toBe(true);
  });
});
