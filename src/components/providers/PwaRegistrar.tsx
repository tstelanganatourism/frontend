'use client';
import { useEffect } from 'react';

export default function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as any;
    if (w.trustedTypes && !w.trustedTypes.defaultPolicy) {
      try {
        w.trustedTypes.createPolicy('default', {
          createHTML: (s: string) => s,
          createScript: (s: string) => s,
          createScriptURL: (s: string) => s,
        });
      } catch {
        // Policy already exists or cannot be created
      }
    }

    if ('serviceWorker' in navigator) {
      // In development, unregister any active service workers and clear cache to avoid stale chunk errors
      if (process.env.NODE_ENV !== 'production') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
        return;
      }

      // Production registration
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            registration.update();
          },
          function (err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}
