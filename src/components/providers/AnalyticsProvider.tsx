'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Optionally track pageviews explicitly if needed (though @next/third-parties does this automatically)
  useEffect(() => {
    if (pathname && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname + searchParams.toString(),
      });
    }
  }, [pathname, searchParams]);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}

// Helper to track custom events
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
