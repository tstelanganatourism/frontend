'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TicketRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Intercept DLT SMS URLs (e.g., ?TBT_BT_1062)
    const keys = Array.from(searchParams.keys());
    const ticketId = keys.find(k => k.startsWith('TBT'));
    
    if (ticketId) {
      router.replace(`/print/ticket/${ticketId}`);
    } else {
      router.replace('/');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-river)]" />
        <p className="text-sm font-bold text-slate-500">Retrieving your ticket...</p>
      </div>
    </div>
  );
}
