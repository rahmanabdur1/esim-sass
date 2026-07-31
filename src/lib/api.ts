/**
 * api.ts — Unified Proxy API Client
 *
 * All microfrontends (shell, dashboard, marketing) use this client.
 * - Client-side calls hit /api/* (Next.js Route Handlers as proxy)
 * - Server Components call backend directly with server-only env vars
 * - Auth token handled via HttpOnly cookies (never in JS memory)
 */

// ── Base configuration ─────────────────────────────────────────

const CLIENT_API_BASE = '/api'; // Client → Next.js Route Handlers → Backend
const SERVER_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1'; // Server Components → Backend directly

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  serverSide?: boolean; // Force direct backend call (Server Components only)
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(
      `${this.baseUrl}${path}`,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    );
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, serverSide, ...fetchOptions } = options;

    // Route Handlers proxy on client; direct backend call on server
    const isServer = typeof window === 'undefined';
    const base = isServer || serverSide ? SERVER_API_BASE : CLIENT_API_BASE;
    const url = this.buildUrl.call({ baseUrl: base }, path, params);

    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      // Credentials: cookies are sent automatically with same-origin requests
      credentials: 'same-origin',
    });

    if (!res.ok) {
      let errorData: ApiError;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText, status: res.status };
      }
      throw new Error(errorData.message ?? `Request failed: ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  // ── Convenience methods ────────────────────────────────────────

  get<T>(
    path: string,
    params?: RequestOptions['params'],
    options?: Omit<RequestOptions, 'params'>,
  ) {
    return this.request<T>(path, { method: 'GET', params, ...options });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { method: 'DELETE', ...options });
  }
}

// ── Singleton exports ──────────────────────────────────────────

/** Client-side API (calls Next.js Route Handlers → Backend proxy) */
export const api = new ApiClient(CLIENT_API_BASE);

/** Server-side API (direct backend — use in Server Components only) */
export const serverApi = new ApiClient(SERVER_API_BASE);

// ── Typed API endpoints ────────────────────────────────────────

export const planApi = {
  list: (params?: Record<string, string>) => api.get('/plans', params),
  get: (id: string) => api.get(`/plans/${id}`),
};

export const esimApi = {
  list: () => api.get('/esims'),
  get: (id: string) => api.get(`/esims/${id}`),
  activate: (id: string) => api.post(`/esims/${id}/activate`),
};

export const orderApi = {
  list: () => api.get('/orders'),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (body: unknown) => api.post('/orders', body),
};

export const authApi = {
  login: (creds: { email: string; password: string }) => api.post('/auth/login', creds),
  logout: () => api.post('/auth/logout'),
  register: (body: unknown) => api.post('/auth/register', body),
  me: () => api.get('/auth/me'),
};
