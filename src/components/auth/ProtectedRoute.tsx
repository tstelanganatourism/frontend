'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, UserRole } from '@/stores/authStore';

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
      // Keep showing spinner while waiting for user profile to hydrate
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-8 w-8 animate-spin text-[var(--color-brand-teal)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
          <span className="text-sm text-muted-foreground">Verifying access...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
