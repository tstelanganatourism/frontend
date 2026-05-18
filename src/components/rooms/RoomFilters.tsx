'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Filter } from 'lucide-react';
import type { SortOption } from '@/stores/useFilterStore';
import SortDropdown from '@/components/ui/SortDropdown';
import { cn } from '@/lib/utils';

const FACILITIES = [
  'Room Service', 'TV', 'Invertor', 'Car Parking', 'Hot Water', 'A/C', 'Wi-Fi'
];

export default function RoomFilters({ className, sticky = true }: { className?: string; sticky?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const pushRoomParams = (params: URLSearchParams) => {
    params.delete('page');
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/stays?${query}` : '/stays', { scroll: false });
    });
  };

  const isFeatured = searchParams.get('is_featured') === 'true';
  const activeFacilities = searchParams.getAll('facilities');
  const activeSort = (searchParams.get('sort') as SortOption | null) || 'priority';

  const setParam = (key: string, value: string | null, defaultValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushRoomParams(params);
  };

  const toggleFacility = (facility: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextFacilities = activeFacilities.includes(facility)
      ? activeFacilities.filter((item) => item !== facility)
      : [...activeFacilities, facility];

    params.delete('facilities');
    nextFacilities.forEach((item) => params.append('facilities', item));
    pushRoomParams(params);
  };

  const clearAll = () => {
    startTransition(() => {
      router.replace('/stays', { scroll: false });
    });
  };

  return (
    <div className={cn('space-y-8 rounded-[1.35rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_55px_rgba(44,94,67,0.1)] backdrop-blur-xl sm:p-6', sticky && 'sticky top-24', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--color-brand-river)] flex items-center gap-2">
          <Filter className="h-5 w-5 text-[var(--color-brand-teal)]" />
          Filters
        </h3>
        <button 
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-muted-foreground hover:text-[var(--color-brand-teal)] transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Featured Filter */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <label htmlFor="featured" className="text-sm font-semibold text-[var(--color-brand-river)] cursor-pointer">
          Show Recommended Only
        </label>
        <input 
          id="featured"
          type="checkbox" 
          checked={isFeatured}
          onChange={(e) => setParam('is_featured', e.target.checked ? 'true' : null)}
          className="h-5 w-5 text-[var(--color-brand-teal)] focus:ring-[var(--color-brand-teal)] border-slate-300 rounded"
        />
      </div>

      {/* Facilities Filter */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--color-brand-river)] mb-3">Facilities</h4>
        <div className="grid grid-cols-1 gap-2">
          {FACILITIES.map((f) => {
            const isActive = activeFacilities.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFacility(f)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive 
                    ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] font-bold border border-[var(--color-brand-green)]/20' 
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {f}
                {isActive && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Option */}
      <div className="pt-4 border-t border-slate-100">
        <SortDropdown 
          options={[
            { label: 'Recommended', value: 'priority' },
            { label: 'Lowest Price First', value: 'price_low' },
            { label: 'Highest Price First', value: 'price_high' }
          ]}
          value={activeSort}
          onChange={(value: SortOption) => setParam('sort', value, 'priority')}
        />
      </div>
    </div>
  );
}
