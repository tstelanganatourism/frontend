'use client';

import React, { useTransition } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function PackageSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const q = searchParams.get('q') || '';
  const [value, setValue] = React.useState(q);

  const handleSearch = (newVal: string) => {
    setValue(newVal);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Reset to page 1 on search
    if (newVal.trim()) {
      params.set('q', newVal.trim());
    } else {
      params.delete('q');
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
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
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search tours, trips, temples..."
        className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-12 pr-10 text-white backdrop-blur-md transition-all placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)] focus:bg-white/20 font-bold"
      />
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
      {value && (
        <button
          type="button"
          onClick={() => handleSearch('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
