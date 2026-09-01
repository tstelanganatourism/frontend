'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';
import dynamic from 'next/dynamic';

const MobileBottomNav = dynamic(() => import("./MobileBottomNav"), { ssr: false });

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
  const isPreBookingPage = pathname?.startsWith('/prebooking');

  const isBookingPage = !!pathname?.match(/^\/(packages|stays|rooms)\/[^/]+(\/checkout)?\/?$/);
  const isDashboardPage = !!pathname?.match(/^\/(dashboard|admin\/dashboard|agent\/dashboard)/);

  const showMobileNav = !isBookingPage;

  if (isAdminOrAgentPage || isPrintPage) {
    return (
      <main className="flex-1 w-full relative min-h-screen">
        {children}
      </main>
    );
  }

  const isHome = pathname === '/';

  return (
    <>
      {promoBanner}
      <Suspense fallback={<div className="h-16 border-b border-border bg-white" />}>
        <PublicNavbar />
      </Suspense>
      <main
        suppressHydrationWarning
        className={`w-full max-w-full flex-1 relative ${
          isHome ? 'pt-0' : 'pt-[72px] sm:pt-[76px]'
        } ${
          isBookingPage ? 'pb-[64px]' : 'pb-[64px] md:pb-0'
        }`}
      >
        {children}
      </main>
      <PublicFooter isDashboard={isDashboardPage} />
      {showMobileNav && <MobileBottomNav isStacked={false} />}
      {!isBookingPage && <WhatsAppFAB />}
    </>
  );
}
