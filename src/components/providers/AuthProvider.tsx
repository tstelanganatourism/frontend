'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshToken } from '@/services/authService';
import { processQueue } from '@/lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    const initAuth = async () => {
      const hasSession = typeof window !== 'undefined' ? localStorage.getItem('has_session') : null;
      if (!hasSession) {
        setHydrated();
        processQueue(null, null);
        return;
      }

      // Fast 4-second timeout safeguard for token refresh so UI never hangs
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth refresh timeout')), 4000)
      );

      try {
        await Promise.race([refreshToken(), timeoutPromise]);
        const freshToken = useAuthStore.getState().accessToken;
        processQueue(null, freshToken || '');
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
        }
        processQueue(error, null);
      } finally {
        setHydrated();
      }
    };

    initAuth();
  }, [setHydrated, clearAuth]);

  return <>{children}</>;
}


