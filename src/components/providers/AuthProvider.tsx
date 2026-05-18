'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshToken, getMe } from '@/services/authService';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const initAuth = async () => {
      try {
        // 1. Call /refresh — this rotates the cookie and returns a new access token.
        //    refreshToken() also immediately writes the access token into the Zustand
        //    store via updateAccessToken(), so any API call that fires concurrently
        //    (e.g. dashboard fetchStats) can use it without triggering the interceptor.
        const token = await refreshToken();

        if (token) {
          // 2. Fetch the user profile with the fresh access token.
          const user = await getMe();
          // 3. Set fully authenticated state.
          setAuth(user, token);
        }
      } catch (error: any) {
        // Only clear auth on explicit 401/403 (invalid/expired refresh token).
        // Network errors (5xx, timeout) should NOT log the user out.
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
        }
      } finally {
        // Mark hydration complete — navbar now shows the correct state.
        setHydrated();
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
