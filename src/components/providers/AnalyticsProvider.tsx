'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
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
  const awId = process.env.NEXT_PUBLIC_AW_ID;

  if (!gaId) return null;

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      {awId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${awId}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${awId}');
            `}
          </Script>
        </>
      )}
    </>
  );
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
