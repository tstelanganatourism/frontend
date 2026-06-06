'use client';

import React, { useEffect, useRef, useState } from 'react';
import NextTopLoader from 'nextjs-toploader';
import { usePathname } from 'next/navigation';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function TopLoader() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const loadingLockRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset loading state when pathname changes (navigation complete)
  useEffect(() => {
    setIsLoading(false);
    loadingLockRef.current = false;
  }, [pathname]);

  // Intercept local link clicks to show loader instantly
  useEffect(() => {
    if (!isMounted) return;

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Only care about internal navigation links
      const isInternalLink = href && 
        href.startsWith('/') && 
        !href.startsWith('/#') && 
        !href.startsWith('mailto:') && 
        !href.startsWith('tel:') && 
        targetAttr !== '_blank';

      if (!isInternalLink) return;

      // If we are ALREADY loading, PREVENT this click to stop spam
      if (loadingLockRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const cleanHref = href.split('?')[0].split('#')[0];
      const cleanPathname = window.location.pathname;

      // If it's a new route, start the loader and lock navigation
      if (cleanHref !== cleanPathname) {
        loadingLockRef.current = true;
        setIsLoading(true);
      }
    };

    // Auto-timeout loader after 10 seconds to prevent getting stuck
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        loadingLockRef.current = false;
      }, 10000);
    }

    // Use capture phase to intercept the click BEFORE Next.js Link handles it
    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMounted, isLoading]);

  // Listen to popstate (back/forward browser navigation)
  useEffect(() => {
    const handlePopState = () => {
      if (!loadingLockRef.current) {
        loadingLockRef.current = true;
        setIsLoading(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NextTopLoader
        color="#1A6B7A"
        showSpinner={false}
        height={3}
        crawl={true}
        speed={200}
        initialPosition={0.08}
        shadow="0 0 10px #1A6B7A, 0 0 5px rgba(229,218,197,0.5)"
      />

      {/* Premium Branded Navigation Loader Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          transition: 'opacity 0.35s ease-in-out, visibility 0.35s ease-in-out',
          opacity: isLoading ? 1 : 0,
          visibility: isLoading ? 'visible' : 'hidden',
          pointerEvents: isLoading ? 'auto' : 'none',
        }}
      >
        {isLoading && <PremiumLoader />}
      </div>
    </>
  );
}
