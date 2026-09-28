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

      // If already hydrated from sessionStorage, immediately flush queue with existing token
      const existingToken = useAuthStore.getState().accessToken;
      if (existingToken) {
        processQueue(null, existingToken);
      }

      // 2.5-second timeout — so auth resolves swiftly without stalling the UI
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth refresh timeout')), 2500)
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


