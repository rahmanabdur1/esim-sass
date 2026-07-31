import type { ApiError } from '@/types';

export function parseApiError(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as { response?: { data?: ApiError; status?: number }; message?: string };
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (e.response?.status === 403) return 'You do not have permission to perform this action.';
    if (e.response?.status === 404) return 'The requested resource was not found.';
    if (e.response?.status === 422)
      return 'The submitted data is invalid. Please check your inputs.';
    if (e.response?.status === 429) return 'Too many requests. Please slow down and try again.';
    if (e.response?.status && e.response.status >= 500)
      return 'A server error occurred. Please try again later.';
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (error && typeof error === 'object') {
    const e = error as { response?: { data?: ApiError } };
    return e.response?.data?.details ?? {};
  }
  return {};
}
