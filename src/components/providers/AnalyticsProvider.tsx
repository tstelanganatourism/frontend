'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadAnalytics, setLoadAnalytics] = useState(false);

  useEffect(() => {
    let triggered = false;
    const triggerLoading = () => {
      if (triggered) return;
      triggered = true;
      setLoadAnalytics(true);
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('scroll', triggerLoading);
      window.removeEventListener('mousemove', triggerLoading);
      window.removeEventListener('touchstart', triggerLoading);
    };

    window.addEventListener('scroll', triggerLoading, { passive: true });
    window.addEventListener('mousemove', triggerLoading, { passive: true });
    window.addEventListener('touchstart', triggerLoading, { passive: true });

    const timer = setTimeout(triggerLoading, 4000);

    return () => {
      clearTimeout(timer);
      cleanupListeners();
    };
  }, []);

  // Track pageviews explicitly once loaded
  useEffect(() => {
    if (loadAnalytics && pathname && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname + searchParams.toString(),
      });
    }
  }, [loadAnalytics, pathname, searchParams]);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const awIdInput = process.env.NEXT_PUBLIC_AW_ID;

  // Support single ID or comma-separated list of multiple IDs
  const awIds = awIdInput
    ? awIdInput.split(',').map((id) => id.trim()).filter(Boolean)
    : [];

  if (!loadAnalytics) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      {awIds.length > 0 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${awIds[0]}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-tag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${awIds.map((id) => `gtag('config', '${id}');`).join('\n              ')}
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

// Google Ads conversion tracking for 'Book Now' click
export const reportBookNowConversion = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-18250568283/WfmRCPuLpdEcENukxv5D',
      'value': 1.0,
      'currency': 'INR'
    });
  }
};
