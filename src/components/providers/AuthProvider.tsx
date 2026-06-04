'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshToken } from '@/services/authService';
import { processQueue } from '@/lib/api';

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
        processQueue(null, null); // drain any queued requests (they'll fail gracefully without a token)
        return;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth hydration timeout')), 30000)
      );

      let refreshError: any = null;
      try {
        // Run refresh token request with a strict 5-second safety timeout
        const result = await Promise.race([refreshToken(), timeoutPromise]);
        // Drain the queue with the fresh access token
        const freshToken = useAuthStore.getState().accessToken;
        processQueue(null, freshToken || '');
      } catch (error: any) {
        refreshError = error;
        // Handle explicit 401/403 credentials rejection safely
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
        }
        // Drain queued requests with the error so they don't hang forever
        processQueue(error, null);
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

