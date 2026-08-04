'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Filter, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import type { SortOption } from '@/stores/useFilterStore';
import SortDropdown from '@/components/ui/SortDropdown';
import { cn } from '@/lib/utils';

const FACILITIES = [
  'Room Service', 'TV', 'Invertor', 'Car Parking', 'Hot Water', 'A/C', 'Wi-Fi'
];

export default function RoomFilters({ className, sticky = true }: { className?: string; sticky?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFeatured = searchParams.get('is_featured') === 'true';
  const activeFacilities = searchParams.getAll('facilities');
  const activeSort = (searchParams.get('sort') as SortOption | null) || 'priority';

  const pushRoomParams = (params: URLSearchParams) => {
    params.delete('page');
    const query = params.toString();
    const newUrl = query ? `/stays?${query}` : '/stays';
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newUrl);
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new CustomEvent('app:filter-change', { detail: newUrl }));
    }
  };

  const setParam = (key: string, value: string | null, defaultValue?: string) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : searchParams.toString());

    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushRoomParams(params);
  };

  const toggleFacility = (facility: string) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : searchParams.toString());
    const currentFacilities = params.getAll('facilities');
    const nextFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter((item) => item !== facility)
      : [...currentFacilities, facility];

    params.delete('facilities');
    nextFacilities.forEach((item) => params.append('facilities', item));
    pushRoomParams(params);
  };

  const clearAll = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/stays');
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new CustomEvent('app:filter-change', { detail: '/stays' }));
    }
  };

  const hasActiveFilters = isFeatured || activeFacilities.length > 0 || activeSort !== 'priority';

  return (
    <div
      className={cn(
        'relative space-y-6 overflow-visible rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all',
        sticky && 'sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200',
        className
      )}
    >
      {isPending && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xs">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0d6e75]/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0d6e75] shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-[#0d6e75]" />
            Updating Filters
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#0d6e75]/10 text-[#0d6e75]">
            <Filter className="h-4 w-4" />
          </div>
          Filter Accommodations
        </h3>
        {hasActiveFilters && (
          <button 
            type="button"
            onClick={clearAll}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Recommended Only Filter Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100/80 hover:border-slate-200 transition-colors">
        <label htmlFor="featured" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Recommended Stays Only
        </label>
        <input 
          id="featured"
          type="checkbox" 
          checked={isFeatured}
          onChange={(e) => setParam('is_featured', e.target.checked ? 'true' : null)}
          disabled={isPending}
          className="h-4 w-4 rounded border-slate-300 text-[#0d6e75] focus:ring-[#0d6e75] cursor-pointer"
        />
      </div>

      {/* Facilities Filter Grid */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 block">
          Facilities & Amenities
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {FACILITIES.map((f) => {
            const isActive = activeFacilities.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFacility(f)}
                disabled={isPending}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-[#0d6e75]/10 text-[#0d6e75] border border-[#0d6e75]/30 shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'
                }`}
              >
                <span>{f}</span>
                {isActive && <Check className="h-4 w-4 text-[#0d6e75] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Option Dropdown */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
          Sort Results By
        </label>
        <SortDropdown 
          options={[
            { label: 'Recommended', value: 'priority' },
            { label: 'Lowest Price First', value: 'price_low' },
            { label: 'Highest Price First', value: 'price_high' }
          ]}
          value={activeSort}
          onChange={(value) => setParam('sort', value as SortOption, 'priority')}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
