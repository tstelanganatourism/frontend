/**
 * Axios instance with auth interceptors.
 *
 * - Injects Authorization: Bearer <token> from Zustand store on every request
 * - On 401: attempts token refresh via HttpOnly cookie, then retries once
 * - On refresh failure: clears auth store and redirects to /login
 *
 * Also exports `API_BASE` and `apiFetch` for server-side fetch compatibility.
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Environment-aware base URL ───────────────────────────────────────────────

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: use relative path (Next.js rewrites/proxy work here)
    return '';
  }
  // SSR: full URL required
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

export const API_BASE = getApiBaseUrl();

// ─── SSR-safe fetch helper (used by Server Components) ────────────────────────

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const signal = options.signal ?? AbortSignal.timeout(8_000);
  
  return fetch(url, {
    ...options,
    signal,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
};

// ─── Axios instance for Client Components ─────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? '' : (process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000'),
  withCredentials: true, // send HttpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor: inject access token ────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Lazily import store to avoid SSR issues
  if (typeof window !== 'undefined') {
    const { useAuthStore } = require('@/stores/authStore');
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: refresh on 401 ────────────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

export function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only intercept 401s that haven't been retried yet
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry login, signup, OTP verify, logout, or refresh itself
    const bypassRetry = 
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout') ||
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/signup') ||
      originalRequest.url?.includes('/verify-otp');

    if (bypassRetry) {
      return Promise.reject(error);
    }

    // CRITICAL: If auth has not hydrated yet, AuthProvider is already handling the
    // refresh. Queue this request so it gets retried once hydration completes
    // instead of dropping it (which would surface as a false logout).
    if (typeof window !== 'undefined') {
      const { useAuthStore } = require('@/stores/authStore');
      if (!useAuthStore.getState().isHydrated) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers!['Authorization'] = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue concurrent requests until refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers!['Authorization'] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await apiClient.post<{ access_token: string; user: any }>('/api/v1/auth/refresh');
      const newToken = data.access_token;

      if (typeof window !== 'undefined') {
        const { useAuthStore } = require('@/stores/authStore');
        useAuthStore.getState().updateAccessToken(newToken);
        useAuthStore.getState().updateUser(data.user);
      }

      processQueue(null, newToken);
      originalRequest.headers!['Authorization'] = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError: any) {
      processQueue(refreshError, null);

      // Only clear auth and redirect to login if the server explicitly rejects the credentials (401/403)
        const isAuthError = refreshError.response && (refreshError.response.status === 401 || refreshError.response.status === 403);

      if (isAuthError && typeof window !== 'undefined') {
        const { useAuthStore } = require('@/stores/authStore');
        useAuthStore.getState().clearAuth();
        
        // Smart redirect based on current route
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
