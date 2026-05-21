'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshToken } from '@/services/authService';

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
        // Call /refresh — this rotates the cookie, returns a new access token + user details,
        // and updates the Zustand store automatically.
        await refreshToken();
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
