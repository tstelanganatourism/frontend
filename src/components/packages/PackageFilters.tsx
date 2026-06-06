'use client';

import React, { useTransition } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Check, Filter, Loader2, Star } from 'lucide-react';
import SortDropdown from '@/components/ui/SortDropdown';
import PremiumSelect from '@/components/ui/PremiumSelect';
import type { SortOption } from '@/stores/useFilterStore';
import { cn } from '@/lib/utils';

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

  // Determine path locks
  const isBoatRide = pathname === '/boat-rides';
  const isSightseeing = pathname === '/sightseeing';
  const hideTypeFilter = isBoatRide || isSightseeing;

  const pushPackageParams = (params: URLSearchParams) => {
    params.delete('page');
    params.delete('tags');
    const query = params.toString();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: true });
    });
  };

  const setParam = (key: string, value: string | null, defaultValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushPackageParams(params);
  };

  const clearAll = () => {
    startTransition(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      router.replace(pathname, { scroll: true });
    });
  };

  return (
    <div className={cn('relative space-y-8 overflow-visible rounded-[1.35rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_55px_rgba(15,61,86,0.1)] backdrop-blur-xl sm:p-6', sticky && 'sticky top-24', className)}>
      {isPending && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center rounded-[1.35rem] bg-white/72 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-teal)]/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--color-brand-river)] shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand-teal)]" />
            Applying
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--color-brand-river)]">
          <Filter className="h-5 w-5 text-[var(--color-brand-teal)]" />
          Filters
        </h3>
        <button
          type="button"
          onClick={clearAll}
          disabled={isPending}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-[var(--color-brand-teal)]"
        >
          Clear All
        </button>
      </div>

      <div className="rounded-2xl border border-[#d7e7e5] bg-[linear-gradient(135deg,#ffffff_0%,#f4fbfa_100%)] p-3 shadow-sm">
        <label htmlFor="package-featured" className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[var(--color-brand-river)]">
            <Star className="h-4 w-4 shrink-0 fill-amber-300 text-amber-400" />
            Recommended packages
          </span>
          <input
            id="package-featured"
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setParam('is_featured', event.target.checked ? 'true' : null)}
            disabled={isPending}
            className="h-5 w-5 rounded border-slate-300 text-[var(--color-brand-teal)] focus:ring-[var(--color-brand-teal)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      {/* Region Filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[var(--color-brand-river)]">Reporting Region</h4>
        <div className="space-y-2">
          {REGIONS.map((region) => {
            const isActive = activeRegion === region.value;
            return (
              <button
                key={region.value}
                type="button"
                onClick={() => setParam('region', isActive ? null : region.value)}
                disabled={isPending}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${isActive
                    ? 'border-[var(--color-brand-teal)]/20 bg-[var(--color-brand-teal)]/10 font-bold text-[var(--color-brand-teal)]'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {region.label}
                {isActive && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Places Filter Dropdown */}
      {places.length > 0 && (
        <div className="relative z-30 w-full">
          <h4 className="mb-3 text-sm font-semibold text-[var(--color-brand-river)]">Search by Places</h4>
          <PremiumSelect
            value={activePlace || ''}
            options={[
              { value: '', label: 'All Places' },
              ...places.map((place) => ({ value: place, label: place })),
            ]}
            onChange={(value) => setParam('place', value ? String(value) : null)}
            placeholder="All Places"
            disabled={isPending}
          />
        </div>
      )}

      {/* Package Type (Hidden if on specific Boat-Rides or Sightseeing routes) */}
      {!hideTypeFilter && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-[var(--color-brand-river)]">Category</h4>
          <div className="space-y-2">
            {TYPES.map((type) => {
              const isActive = activeType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setParam('type', isActive ? null : type.value)}
                  disabled={isPending}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${isActive
                      ? 'border-[var(--color-brand-teal)]/20 bg-[var(--color-brand-teal)]/10 font-bold text-[var(--color-brand-teal)]'
                      : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {type.label}
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sorting */}
      <div className="border-t border-slate-100 pt-4">
        <SortDropdown
          options={[
            { label: 'Recommended', value: 'priority' },
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
