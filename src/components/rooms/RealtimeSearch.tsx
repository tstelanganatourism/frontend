'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function RealtimeSearch({ defaultValue = '' }: { defaultValue?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [, startTransition] = useTransition();

  // Debounced update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedQuery = query.trim();

      if (trimmedQuery) {
        params.set('q', trimmedQuery);
      } else {
        params.delete('q');
      }

      // Reset page when searching
      params.delete('page');

      const nextQuery = params.toString();
      if (nextQuery === searchParams.toString()) return;

      startTransition(() => {
        router.replace(nextQuery ? `/stays?${nextQuery}` : '/stays', { scroll: false });
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query, searchParams]);

  return (
    <div className="relative w-full md:w-96">
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by hotel or area..." 
        className="w-full bg-white/10 border border-white/20 backdrop-blur-md rounded-full py-3 px-6 pl-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)] transition-all"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
    </div>
  );
}
