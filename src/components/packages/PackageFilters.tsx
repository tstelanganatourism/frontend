'use client';

import React, { useTransition } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Check, Filter, ChevronDown } from 'lucide-react';
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

  const activeRegionParam = searchParams.get('region');
  const activeTypeParam = searchParams.get('type');
  const activeTagsParam = searchParams.getAll('tags');
  const activePlaceParam = searchParams.get('place');
  const activeSortParam = (searchParams.get('sort') as SortOption | null) || 'priority';

  // Optimistic local state for instant toggle feedback
  const [activeRegion, setActiveRegion] = React.useState(activeRegionParam);
  const [activeType, setActiveType] = React.useState(activeTypeParam);
  const [activePlace, setActivePlace] = React.useState(activePlaceParam);
  const [activeTags, setActiveTags] = React.useState(activeTagsParam);
  const [activeSort, setActiveSort] = React.useState(activeSortParam);
  const [places, setPlaces] = React.useState<string[]>([]);
  const [isPlacesOpen, setIsPlacesOpen] = React.useState(false);
  const placesDropdownRef = React.useRef<HTMLDivElement>(null);

  const activeTagsString = activeTagsParam.join(',');

  React.useEffect(() => {
    setActiveRegion(activeRegionParam);
    setActiveType(activeTypeParam);
    setActiveTags(activeTagsParam);
    setActiveSort(activeSortParam);
    setActivePlace(activePlaceParam);
  }, [activeRegionParam, activeTypeParam, activeTagsString, activeSortParam, activePlaceParam]);

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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (placesDropdownRef.current && !placesDropdownRef.current.contains(event.target as Node)) {
        setIsPlacesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    if (key === 'region') setActiveRegion(value);
    if (key === 'type') setActiveType(value);
    if (key === 'place') setActivePlace(value);
    if (key === 'sort' && value) setActiveSort(value as SortOption);

    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushPackageParams(params);
  };

  const toggleTag = (tag: string) => {
    const nextTags = activeTags.includes(tag) ? activeTags.filter((item) => item !== tag) : [...activeTags, tag];
    
    // Instant optimistic feedback
    setActiveTags(nextTags);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    nextTags.forEach((item) => params.append('tags', item));
    pushPackageParams(params);
  };

  const clearAll = () => {
    // Instant optimistic feedback
    setActiveRegion(null);
    setActiveType(null);
    setActivePlace(null);
    setActiveTags([]);
    setActiveSort('priority');

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

      {/* Places Filter Dropdown */}
      {places.length > 0 && (
        <div className="relative w-full" ref={placesDropdownRef}>
          <h4 className="mb-3 text-sm font-semibold text-[var(--color-brand-river)]">Search by Places</h4>
          <button
            type="button"
            onClick={() => setIsPlacesOpen(!isPlacesOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-[var(--color-brand-teal)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20 cursor-pointer"
          >
            <span>{activePlace || 'All Places'}</span>
            <ChevronDown 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isPlacesOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isPlacesOpen && (
            <div className="absolute left-0 right-0 z-50 mt-2 origin-top overflow-hidden rounded-xl border border-border bg-white shadow-2xl animate-in fade-in zoom-in duration-200 max-h-60 overflow-y-auto">
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setParam('place', null);
                    setIsPlacesOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs transition-colors ${
                    !activePlace
                      ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Places
                  {!activePlace && <Check className="h-4 w-4 text-[var(--color-brand-teal)]" />}
                </button>
                {places.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setParam('place', p);
                      setIsPlacesOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs transition-colors ${
                      activePlace === p
                        ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                    {activePlace === p && <Check className="h-4 w-4 text-[var(--color-brand-teal)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
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
