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

      // 7-second timeout — shorter than the 8-second queue timeout in api.ts
      // so auth ALWAYS resolves before queued requests time out
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth refresh timeout')), 7000)
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
        // Always flush the queue — even on error/timeout — so nothing hangs forever
        processQueue(error, null);
      } finally {
        setHydrated();
      }
    };

    initAuth();
  }, [setHydrated, clearAuth]);

  return <>{children}</>;
}


