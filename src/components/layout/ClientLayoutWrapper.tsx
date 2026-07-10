'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
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
  // Admin pages (except /admin/login) get the bare layout — no public navbar/footer.
  // Agent pages are storefront-facing and expect the public layout wrapper.
  const isAdminOrAgentPage = pathname?.startsWith('/admin') && !pathname?.endsWith('/login');
  const isPrintPage = pathname?.startsWith('/print');

  // Booking/detail pages (e.g. /packages/slug, /stays/slug) get the Sticky CTA bar
  // so the book-now button is always visible. MobileBottomNav is hidden here to
  // prevent double-bar stacking that consumed ~132px of mobile viewport.
  const isBookingPage = !!pathname?.match(/^\/(packages|stays|rooms)\/[^/]+(\/checkout)?\/?$/);

  // Dashboard pages: user is already authenticated / post-booking — show nav but NOT
  // the StickyConversionBar (irrelevant context). Previously `isDashboardPage` was
  // included in `showStickyBar`, causing double-bar stacking on the dashboard page.
  const isDashboardPage = !!pathname?.match(/^\/(dashboard|admin\/dashboard|agent\/dashboard)/);

  // StickyConversionBar: ONLY shown on booking/package/room detail pages, NOT on dashboard
  const showStickyBar = isBookingPage;

  // MobileBottomNav: shown everywhere EXCEPT booking pages (to avoid double bars)
  const showMobileNav = !isBookingPage;

  if (isAdminOrAgentPage || isPrintPage) {
    return (
      <main className={`flex-1 w-full relative min-h-screen`}>
        {children}
      </main>
    );
  }

  return (
    <>
      {promoBanner}
      <Suspense fallback={<div className="h-16 border-b border-border bg-white" />}>
        <PublicNavbar />
      </Suspense>
      <main
        suppressHydrationWarning
        className={`w-full relative md:pb-0 ${
          showStickyBar
            ? 'pb-[72px]'          // booking page: space for sticky CTA only
            : showMobileNav
              ? 'pb-[68px]'        // normal pages: space for mobile bottom nav
              : ''
        }`}
      >
        {children}
      </main>
      <PublicFooter isDashboard={isDashboardPage} />
      {showMobileNav && <MobileBottomNav isStacked={false} />}
      {!isBookingPage && <WhatsAppFAB hiddenOnMobile={showStickyBar} />}
      {showStickyBar && <StickyConversionBar />}
    </>
  );
}
