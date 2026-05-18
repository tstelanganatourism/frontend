'use client';

import React, { useTransition } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Check, Filter } from 'lucide-react';
import SortDropdown from '@/components/ui/SortDropdown';
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

const TAGS = [
  'A/C Transport',
  'Non-A/C Transport',
  'Self Transport',
  'Bhadrachalam Office',
  'Rajahmundry',
  'Meals Included',
  'River Cruise',
  'Temple',
  'Nature',
  'Overnight Stay'
];

export default function PackageFilters({ className, sticky = true }: { className?: string; sticky?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const activeRegion = searchParams.get('region');
  const activeType = searchParams.get('type');
  const activeTags = searchParams.getAll('tags');
  const activeSort = (searchParams.get('sort') as SortOption | null) || 'priority';

  // Determine path locks
  const isBoatRide = pathname === '/boat-rides';
  const isSightseeing = pathname === '/sightseeing';
  const hideTypeFilter = isBoatRide || isSightseeing;

  const pushPackageParams = (params: URLSearchParams) => {
    params.delete('page');
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextTags = activeTags.includes(tag) ? activeTags.filter((item) => item !== tag) : [...activeTags, tag];

    params.delete('tags');
    nextTags.forEach((item) => params.append('tags', item));
    pushPackageParams(params);
  };

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className={cn('space-y-8 rounded-[1.35rem] border border-white/70 bg-white/88 p-5 shadow-[0_18px_55px_rgba(15,61,86,0.1)] backdrop-blur-xl sm:p-6', sticky && 'sticky top-24', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--color-brand-river)]">
          <Filter className="h-5 w-5 text-[var(--color-brand-teal)]" />
          Filters
        </h3>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-[var(--color-brand-teal)]"
        >
          Clear All
        </button>
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

      {/* Popular Tags */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[var(--color-brand-river)]">Experience Features</h4>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${isActive
                    ? 'border-[var(--color-brand-river)] bg-[var(--color-brand-river)] text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--color-brand-teal)] hover:text-[var(--color-brand-teal)]'
                  }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting */}
      <div className="border-t border-slate-100 pt-4">
        <SortDropdown
          options={[
            { label: 'Recommended', value: 'priority' },
            { label: 'Price: Low to High', value: 'price_low' },
            { label: 'Price: High to Low', value: 'price_high' },
          ]}
          value={activeSort}
          onChange={(value: SortOption) => setParam('sort', value, 'priority')}
        />
      </div>
    </div>
  );
}
