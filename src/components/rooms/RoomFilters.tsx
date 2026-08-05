'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Check, Filter, Loader2, RotateCcw, Sparkles, FolderTree } from 'lucide-react';
import type { SortOption } from '@/stores/useFilterStore';
import SortDropdown from '@/components/ui/SortDropdown';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { cn } from '@/lib/utils';

const FACILITIES = [
  'Room Service', 'TV', 'Invertor', 'Car Parking', 'Hot Water', 'A/C', 'Wi-Fi'
];

type RoomCategoryItem = {
  id: number;
  name: string;
  slug: string;
  room_count: number;
};

export default function RoomFilters({ className, sticky = true }: { className?: string; sticky?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFeatured = searchParams.get('is_featured') === 'true';
  const activeFacilities = searchParams.getAll('facilities');
  const activeSort = (searchParams.get('sort') as SortOption | null) || 'priority';

  const [categories, setCategories] = React.useState<RoomCategoryItem[]>([]);

  // Detect current category slug from path
  const currentCategorySlug = pathname.startsWith('/stays/categories/')
    ? pathname.replace('/stays/categories/', '')
    : '';

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/v1/rooms/categories', { cache: 'no-store' });
        if (res.ok) {
          setCategories(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch room categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const pushRoomParams = (params: URLSearchParams) => {
    params.delete('page');
    const query = params.toString();
    const targetPath = pathname.startsWith('/stays/categories/') ? '/stays' : pathname;
    const newUrl = query ? `${targetPath}?${query}` : `${targetPath}?view=all`;
    if (typeof window !== 'undefined') {
      window.location.href = newUrl;
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
      window.location.href = '/stays?view=all';
    }
  };

  const hasActiveFilters = isFeatured || activeFacilities.length > 0 || activeSort !== 'priority' || Boolean(currentCategorySlug);

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
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All
          </button>
        )}
      </div>

      {/* Stay Categories Selector */}
      {categories.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            <FolderTree className="h-3 w-3 text-emerald-600" />
            Stay Category
          </h4>
          <div className="relative z-30">
            <PremiumSelect
              value={currentCategorySlug}
              options={[
                { value: '', label: 'All Stay Categories' },
                ...categories.map((cat) => ({
                  value: cat.slug,
                  label: `${cat.name} (${cat.room_count})`
                })),
              ]}
              onChange={(value) => {
                if (typeof window !== 'undefined') {
                  if (value) {
                    window.location.href = `/stays/categories/${value}`;
                  } else {
                    window.location.href = `/stays?view=all`;
                  }
                }
              }}
              placeholder="Select Stay Category..."
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {/* Featured Switch */}
      <button
        type="button"
        onClick={() => setParam('is_featured', isFeatured ? null : 'true')}
        disabled={isPending}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold cursor-pointer',
          isFeatured
            ? 'bg-amber-500/10 border-amber-400 text-amber-900'
            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
        )}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Must Experience Stays
        </span>
        <div className={cn(
          'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
          isFeatured ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'
        )}>
          {isFeatured && <Check className="h-3 w-3" />}
        </div>
      </button>

      {/* Facilities Checkboxes */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Facilities</h4>
        <div className="space-y-1.5">
          {FACILITIES.map((facility) => {
            const isChecked = activeFacilities.includes(facility);
            return (
              <button
                key={facility}
                type="button"
                onClick={() => toggleFacility(facility)}
                disabled={isPending}
                className={cn(
                  'w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                  isChecked
                    ? 'bg-[#0d6e75]/10 border-[#0d6e75]/40 text-[#0d6e75]'
                    : 'bg-white border-slate-200/70 text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>{facility}</span>
                <div className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                  isChecked ? 'bg-[#0d6e75] border-[#0d6e75] text-white' : 'border-slate-300'
                )}>
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Sort By</h4>
        <SortDropdown
          options={[
            { label: 'Recommended First', value: 'priority' },
            { label: 'Price: Low to High', value: 'price_low' },
            { label: 'Price: High to Low', value: 'price_high' },
          ]}
          value={activeSort}
          onChange={(val) => setParam('sort', val as SortOption, 'priority')}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
