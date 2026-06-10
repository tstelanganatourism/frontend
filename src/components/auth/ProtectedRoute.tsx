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
    console.log("ProtectedRoute DEBUG: ", { pathname, isAuthenticated, isHydrated, user, mounted });
  }, [pathname, isAuthenticated, isHydrated, user, mounted]);

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
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-slate-50/50 px-4 py-12">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes progressSweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .custom-sweep {
            animation: progressSweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}} />
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
            {/* Outer rotating dashed border */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1a6b7a] animate-[spin_10s_linear_infinite] opacity-60" />
            
            {/* Inner pulsing background */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#1a6b7a] to-[#259b9a] animate-pulse opacity-10" />
            
            {/* Logo image container */}
            <div className="relative h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 ring-4 ring-[#1a6b7a]/5">
              <img
                src="/apple-touch-icon.png"
                alt="Telangana Boat Tourism"
                className="h-12 w-12 object-contain rounded-xl"
              />
            </div>
            
            {/* Orbiting loading dot */}
            <div className="absolute inset-[-4px] rounded-full animate-[spin_3s_linear_infinite]">
              <div className="h-2.5 w-2.5 rounded-full bg-[#259b9a] shadow-[0_0_8px_#259b9a]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">Verifying Access</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed px-2">
              Please wait while we authenticate your session.
            </p>
          </div>
          
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a6b7a] to-[#259b9a] rounded-full custom-sweep" style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
