'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import MobileBottomNav from "./MobileBottomNav";
import WhatsAppFAB from "../ui/WhatsAppFAB";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  promoBanner: React.ReactNode;
}

export default function ClientLayoutWrapper({ children, promoBanner }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminOrAgentPage = (pathname?.startsWith('/admin') || pathname?.startsWith('/agent')) && !pathname?.endsWith('/login');
  const isPrintPage = pathname?.startsWith('/print');

  // Trigger real-time revalidation whenever the browser tab gains focus
  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registered with scope:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));
    }
  }, []);

  if (isAdminOrAgentPage || isPrintPage) {
    return (
      <main className="flex-1 w-full relative min-h-screen">
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
      <main className="flex-1 w-full relative pb-24 md:pb-0 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      <PublicFooter />
      <MobileBottomNav />
      <WhatsAppFAB />
    </>
  );
}
