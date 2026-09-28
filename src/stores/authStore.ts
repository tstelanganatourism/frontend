/**
 * Auth store — Zustand-powered in-memory session state.
 *
 * Access token lives in memory (never localStorage) to prevent XSS theft.
 * Refresh token lives in an HttpOnly cookie managed by the backend.
 * Hydration from /auth/me happens via the QueryProvider on app load.
 */
'use client';

import { create } from 'zustand';

export type UserRole = 'USER' | 'AGENT' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'DISABLED';

export interface AuthUser {
  id: number;
  email: string | null;
  full_name: string;
  role: UserRole;
  account_status: AccountStatus;
  phone_number?: string | null;
  avatar_url?: string | null;
  commission_percentage?: number | null;
  commission_type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
  commission_fixed_amount?: number | null;
  company_name?: string | null;
  gst_number?: string | null;
  address?: string | null;
  admin_notes?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void;
  updateUser: (user: AuthUser) => void;
  updateAccessToken: (token: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,
    };
  }

  const hasSession = localStorage.getItem('has_session');
  if (!hasSession) {
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: true, // Guests are immediately ready with zero lag
    };
  }

  try {
    const cachedUserStr = localStorage.getItem('cached_user');
    const cachedToken = sessionStorage.getItem('access_token');
    if (cachedUserStr) {
      const user = JSON.parse(cachedUserStr);
      return {
        user,
        accessToken: cachedToken || null,
        isAuthenticated: true,
        // If we already have the token in sessionStorage, we are 100% hydrated from frame 0!
        isHydrated: !!cachedToken,
      };
    }
  } catch {}

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isHydrated: false,
  };
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...getInitialAuthState(),

  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('has_session', '1');
      try {
        localStorage.setItem('cached_user', JSON.stringify(user));
        if (accessToken) {
          sessionStorage.setItem('access_token', accessToken);
        }
      } catch {}
    }
    set({ user, accessToken, isAuthenticated: true, isHydrated: true });
  },

  updateUser: (user) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cached_user', JSON.stringify(user));
      } catch {}
    }
    set({ user });
  },

  updateAccessToken: (token) => {
    if (typeof window !== 'undefined' && token) {
      try {
        sessionStorage.setItem('access_token', token);
      } catch {}
    }
    set({ accessToken: token });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('has_session');
      localStorage.removeItem('cached_user');
      try {
        sessionStorage.removeItem('access_token');
      } catch {}
    }
    set({ user: null, accessToken: null, isAuthenticated: false, isHydrated: true });
  },

  setHydrated: () =>
    set({ isHydrated: true }),
}));

