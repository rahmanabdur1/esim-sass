import { authService } from '@/services/auth.service';
import apiClient from '@/lib/api-client';
import { jest } from '@jest/globals';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('authService Integration', () => {
  afterEach(() => jest.clearAllMocks());

  it('login returns user and token on success', async () => {
    const mockData = {
      data: {
        user: { id: '1', email: 'a@b.com', name: 'Test' },
        token: 'tok',
        refreshToken: 'ref',
      },
      message: 'ok',
      success: true,
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: mockData });

    const result = await authService.login({
      email: 'a@b.com',
      password: 'pass1234',
      rememberMe: false,
    });

    expect(result.user.email).toBe('a@b.com');
    expect(result.token).toBe('tok');
  });

  it('logout calls /auth/logout endpoint', async () => {
    mockedApiClient.post.mockResolvedValueOnce({});
    await authService.logout();
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('forgotPassword calls correct endpoint', async () => {
    mockedApiClient.post.mockResolvedValueOnce({});
    await authService.forgotPassword({ email: 'a@b.com' });
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'a@b.com',
    });
  });
});
