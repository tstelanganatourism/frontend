'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import dynamic from 'next/dynamic';

const MobileBottomNav = dynamic(() => import("./MobileBottomNav"), { ssr: false });
const WhatsAppFAB = dynamic(() => import("../ui/WhatsAppFAB"), { ssr: false });
const StickyConversionBar = dynamic(() => import("../ui/StickyConversionBar"), { ssr: false });

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  promoBanner: React.ReactNode;
}

export default function ClientLayoutWrapper({ children, promoBanner }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminOrAgentPage = pathname?.startsWith('/admin') && !pathname?.endsWith('/login');
  const isPrintPage = pathname?.startsWith('/print');

  const isBookingPage = !!pathname?.match(/^\/(packages|stays|rooms)\/[^/]+(\/checkout)?$/);
  const isDashboardPage = !!pathname?.match(/^\/(dashboard|admin\/dashboard|agent\/dashboard)/);
  const showStickyBar = isBookingPage || isDashboardPage;
  const showMobileNav = !isBookingPage;

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Service Worker registration failed:', err));
    }
  }, []);

  if (isAdminOrAgentPage || isPrintPage) {
    return (
      <main className="flex-1 w-full relative min-h-screen">
        {children}
        {isDashboardPage && <StickyConversionBar />}
      </main>
    );
  }

  return (
    <>
      {promoBanner}
      <Suspense fallback={<div className="h-16 border-b border-border bg-white" />}>
        <PublicNavbar />
      </Suspense>
      <main className={`w-full relative md:pb-0 ${showStickyBar ? 'pb-[72px]' : showMobileNav ? 'pb-[68px]' : ''}`}>
        {children}
      </main>
      <PublicFooter />
      {showMobileNav && <MobileBottomNav isStacked={showStickyBar} />}
      <WhatsAppFAB hiddenOnMobile={showStickyBar} />
      {showStickyBar && <StickyConversionBar />}
    </>
  );
}
