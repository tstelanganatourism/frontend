'use client';

import React, { useTransition } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Check, Loader2, Navigation, Layers, SlidersHorizontal } from 'lucide-react';
import SortDropdown from '@/components/ui/SortDropdown';
import PremiumSelect from '@/components/ui/PremiumSelect';
import type { SortOption } from '@/stores/useFilterStore';
import { cn } from '@/lib/utils';

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const REGIONS = [
  { label: 'Telangana', value: 'TS' },
  { label: 'Andhra Pradesh', value: 'AP' },
];

const TYPES = [
  { label: 'Boat Rides', value: 'TOUR' },
  { label: 'Sightseeing', value: 'TRIP' },
];

export default function PackageFilters({ className, sticky = true }: { className?: string; sticky?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeRegion = searchParams.get('region');
  const activeType = searchParams.get('type');
  const activePlace = searchParams.get('place');
  const activeSort = (searchParams.get('sort') as SortOption | null) || 'priority';
  const isFeatured = searchParams.get('is_featured') === 'true';
  const [places, setPlaces] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch('/api/v1/packages/places/all');
        if (res.ok) {
          const data = await res.json();
          setPlaces(data);
        }
      } catch (err) {
        console.error('Failed to fetch places:', err);
      }
    };
    fetchPlaces();
  }, []);

  const isBoatRide = pathname === '/boat-rides';
  const isSightseeing = pathname === '/sightseeing';
  const hideTypeFilter = isBoatRide || isSightseeing;

  const pushPackageParams = (params: URLSearchParams) => {
    params.delete('page');
    params.delete('tags');
    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;
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

    pushPackageParams(params);
  };

  const clearAll = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', pathname);
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new CustomEvent('app:filter-change', { detail: pathname }));
    }
  };

  return (
    <div className={cn(
      'relative space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300',
      sticky && 'sticky top-28',
      className
    )}>
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-teal-800 shadow-sm">
            <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
            Updating
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
          Filters
        </h3>
        <button
          type="button"
          onClick={clearAll}
          disabled={isPending}
          className="text-[11px] font-bold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Recommended Toggle */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-2.5 shadow-2xs hover:shadow-xs transition-all">
        <label htmlFor="package-featured" className="flex cursor-pointer items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StarIcon />
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Must Experience</span>
          </div>
          <input
            id="package-featured"
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setParam('is_featured', event.target.checked ? 'true' : null)}
            disabled={isPending}
            className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Region Filter (Segmented Switch) */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
          <Navigation className="h-3 w-3 text-teal-600" />
          Region
        </h4>
        <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl">
          {REGIONS.map((region) => {
            const isActive = activeRegion === region.value;
            return (
              <button
                key={region.value}
                type="button"
                onClick={() => setParam('region', isActive ? null : region.value)}
                disabled={isPending}
                className={cn(
                  'flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  isActive
                    ? 'bg-white text-teal-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                )}
              >
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Places Filter Dropdown */}
      {places.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            <SlidersHorizontal className="h-3 w-3 text-teal-600" />
            Destination
          </h4>
          <div className="relative z-30">
            <PremiumSelect
              value={activePlace || ''}
              options={[
                { value: '', label: 'All Destination Places' },
                ...places.map((place) => ({ value: place, label: place })),
              ]}
              onChange={(value) => setParam('place', value ? String(value) : null)}
              placeholder="All Destination Places"
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {/* Package Type Category Filter (Segmented Switch) */}
      {!hideTypeFilter && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            <Layers className="h-3 w-3 text-teal-600" />
            Category
          </h4>
          <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl">
            {TYPES.map((type) => {
              const isActive = activeType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setParam('type', isActive ? null : type.value)}
                  disabled={isPending}
                  className={cn(
                    'flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
                    isActive
                      ? 'bg-white text-teal-700 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  )}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sorting */}
      <div className="border-t border-slate-100 pt-3">
        <SortDropdown
          options={[
            { label: 'Recommended First', value: 'priority' },
            { label: 'Price: Low to High', value: 'price_low' },
            { label: 'Price: High to Low', value: 'price_high' },
          ]}
          value={activeSort}
          onChange={(value) => setParam('sort', value as SortOption, 'priority')}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
