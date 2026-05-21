'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminInvoiceGuard({ 
  children, 
  hasSecret 
}: { 
  children: React.ReactNode; 
  hasSecret: boolean; 
}) {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (hasSecret) {
      setAuthorized(true);
      return;
    }

    if (!user || user.role !== 'ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      setAuthorized(true);
    }
  }, [user, isHydrated, hasSecret, router]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
          <p className="mt-4 text-sm font-medium text-slate-500">Verifying secure access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
