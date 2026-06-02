/**
 * Auth service — all API calls for authentication flows.
 */
import { apiClient } from '@/lib/api';
import { useAuthStore, AuthUser } from '@/stores/authStore';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface OTPInitResponse {
  user_id: number;
  message: string;
}

// ─── Tourist ──────────────────────────────────────────────────────────────────

export async function touristSignup(data: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/api/v1/auth/tourist/signup', data);
  useAuthStore.getState().setAuth(res.data.user, res.data.access_token);
  return res.data;
}

export async function touristLogin(data: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/api/v1/auth/tourist/login', data);
  useAuthStore.getState().setAuth(res.data.user, res.data.access_token);
  return res.data;
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function getGoogleAuthUrl(redirectUri?: string, state?: string): Promise<string> {
  const queryParams = new URLSearchParams();
  if (redirectUri) queryParams.set('redirect_uri', redirectUri);
  if (state) queryParams.set('state', state);
  const params = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await apiClient.get<{ url: string }>(`/api/v1/auth/google/url${params}`);
  return res.data.url;
}

export async function googleCallback(code: string, redirectUri?: string): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/api/v1/auth/google/callback', {
    code,
    redirect_uri: redirectUri,
  });
  useAuthStore.getState().setAuth(res.data.user, res.data.access_token);
  return res.data;
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export async function agentLogin(data: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/api/v1/auth/agent/login', data);
  useAuthStore.getState().setAuth(res.data.user, res.data.access_token);
  return res.data;
}

// ─── Admin (2-step) ───────────────────────────────────────────────────────────

export async function adminLogin(data: {
  email: string;
  password: string;
}): Promise<OTPInitResponse> {
  const res = await apiClient.post<OTPInitResponse>('/api/v1/auth/admin/login', data);
  return res.data;
}

export async function adminVerifyOTP(data: {
  user_id: number;
  otp: string;
}): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/api/v1/auth/admin/verify-otp', data);
  useAuthStore.getState().setAuth(res.data.user, res.data.access_token);
  return res.data;
}
export async function resendAdminOtp(data: {
  email: string;
  password: string;
}): Promise<void> {
  await apiClient.post('/api/v1/auth/admin/resend-otp', data);
}

// ─── Shared ───────────────────────────────────────────────────────────────────

let activeRefreshPromise: Promise<TokenResponse> | null = null;

export async function refreshToken(): Promise<TokenResponse> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }
  
  activeRefreshPromise = (async () => {
    try {
      const res = await apiClient.post<TokenResponse>('/api/v1/auth/refresh');
      useAuthStore.getState().setAuth(res.data.user, res.data.access_token);
      return res.data;
    } finally {
      activeRefreshPromise = null;
    }
  })();
  
  return activeRefreshPromise;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/v1/auth/logout');
  } catch {
    // Always clear local state even if backend call fails
  }
  useAuthStore.getState().clearAuth();
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiClient.get<AuthUser>('/api/v1/auth/me');
  return res.data;
}

export async function updateProfile(data: { full_name?: string; phone_number?: string; avatar_url?: string }): Promise<AuthUser> {
  const res = await apiClient.put<AuthUser>('/api/v1/auth/me', data);
  useAuthStore.getState().setAuth(res.data, useAuthStore.getState().accessToken || '');
  return res.data;
}
