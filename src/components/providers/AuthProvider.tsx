'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshToken } from '@/services/authService';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Component-level ref to prevent duplicate concurrent initializations
  const isInitialized = useRef(false);

  useEffect(() => {
    // Guard against duplicate execution or if already hydrated
    if (isHydrated || isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    const initAuth = async () => {
      // INSTANT HYDRATION FOR GUESTS: 
      // If the user doesn't have the session flag, don't even make the API call.
      const hasSession = typeof window !== 'undefined' ? localStorage.getItem('has_session') : null;
      if (!hasSession) {
        setHydrated();
        return;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth hydration timeout')), 30000)
      );

      try {
        // Run refresh token request with a strict 30-second safety timeout around refreshToken() only
        await Promise.race([refreshToken(), timeoutPromise]);
      } catch (error: any) {
        // Handle explicit 401/403 credentials rejection safely
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
        }
      } finally {
        // ALWAYS mark hydration complete via finally to guarantee the UI never locks
        setHydrated();
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

