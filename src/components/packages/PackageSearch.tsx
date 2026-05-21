'use client';

import React, { useState, useEffect, useTransition, useDeferredValue } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function PackageSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const q = searchParams.get('q') || '';
  const [value, setValue] = useState(q);
  const deferredValue = useDeferredValue(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedQuery = deferredValue.trim();

      if (trimmedQuery) {
        params.set('q', trimmedQuery);
      } else {
        params.delete('q');
      }

      // Reset to page 1 on search
      params.delete('page');

      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();
      
      // Prevent redundant pushes
      if (nextQuery === currentQuery) return;

      startTransition(() => {
        router.replace(`${pathname}?${nextQuery}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [deferredValue, pathname, router, searchParams]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className="relative w-full md:w-96">
      <label htmlFor="package-search" className="sr-only">
        Search packages
      </label>
      <input
        id="package-search"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search tours, trips, temples..."
        className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-12 pr-10 text-white backdrop-blur-md transition-all placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)] focus:bg-white/20 font-bold"
      />
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
