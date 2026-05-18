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

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  updateUser: (user) =>
    set({ user }),

  updateAccessToken: (token) =>
    set({ accessToken: token }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setHydrated: () =>
    set({ isHydrated: true }),
}));
