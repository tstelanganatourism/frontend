'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, UserRole } from '@/stores/authStore';

import PremiumLoader from '@/components/ui/PremiumLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackUrl?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallbackUrl = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isHydrated) return;

    if (!isAuthenticated) {
      router.replace(`${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!user) {
      // Keep waiting for user profile to hydrate
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized');
      return;
    }

    setIsChecking(false);
  }, [mounted, isAuthenticated, isHydrated, user, allowedRoles, fallbackUrl, pathname, router]);

  if (!mounted || !isHydrated || isChecking) {
    return (
      <div className="relative min-h-screen">
        {/* Softly blurred backdrop of children/content */}
        <div className="filter blur-[3px] opacity-75 pointer-events-none select-none transition-all duration-300">
          {children}
        </div>
        {/* Enhanced Glassmorphic Floating Island Loader */}
        <PremiumLoader blurBackdrop={true} text="TS Boat Tourism" />
      </div>
    );
  }

  return <>{children}</>;
}
