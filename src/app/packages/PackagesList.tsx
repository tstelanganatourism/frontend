'use client';

import React, { useTransition } from 'react';
import Image from 'next/image';
import { Anchor, Camera, Search, Sparkles } from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import PackageFilters from '@/components/packages/PackageFilters';
import PackageListPagination from '@/components/packages/PackageListPagination';
import MobileFilterSheet from '@/components/packages/MobileFilterSheet';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

type PackageData = {
  items: PackageItem[];
  total: number;
  size: number;
};

type PackageItem = {
  id: number;
  slug: string;
  title: string;
  type: string;
  duration?: string | null;
  place?: string | null;
  region: string;
  cover_image_url: string | null;
  is_featured: boolean;
  is_student_package?: boolean;
  tags: string[];
  starting_price: number | null;
  variants?: Array<{
    id: number;
    title: string;
    adult_price: number;
    child_price: number;
    weekend_adult_price?: number;
    weekend_child_price?: number;
    student_price?: number;
    weekend_student_price?: number;
    transport_info?: string | null;
    is_active: boolean;
  }>;
};

export default function PackagesList({
  data,
  pathname,
  searchParams,
}: {
  data?: PackageData;
  pathname: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const isBoatRide = pathname === '/boat-rides';
  const isSightseeing = pathname === '/sightseeing';
  const router = useRouter();
  const pathnameHook = usePathname();
  const [isPending, startTransition] = useTransition();

  const [liveData, setLiveData] = React.useState<{ query: string; data: PackageData } | undefined>(undefined);
  const [isFetching, setIsFetching] = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  const isInitialMount = React.useRef(true);
  const previousSearchStr = React.useRef(typeof window !== 'undefined' ? window.location.search : '');
  const currentBrowserSearch = typeof window !== 'undefined' ? window.location.search : '';
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync search input with URL parameter 'q'
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchVal(params.get('q') || '');
    }
  }, [currentBrowserSearch]);

  // To avoid Next.js dynamic bail-out during build when reading searchParams directly,
  // we do not use the useSearchParams hook outside of a Suspense boundary if we want the 
  // route to remain perfectly static. Instead, we use a simple window location check in useEffect.
  React.useEffect(() => {
    const fetchLive = async () => {
      try {
        const currentSearch = window.location.search;
        const queryParams = new URLSearchParams(currentSearch);
        queryParams.delete('tags');

        // If there are no query parameters, and we are not forcing a specific type,
        // we can just use the server-provided SSG data without an extra network call.
        if (queryParams.toString() === '' && !isBoatRide && !isSightseeing) {
          return;
        }

        if (isBoatRide) {
          queryParams.set('type', 'TOUR');
        } else if (isSightseeing) {
          queryParams.set('type', 'TRIP');
        }
        queryParams.set('size', '20');

        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        setIsFetching(true);
        try {
          const res = await fetch(`/api/v1/packages${query}`);
          if (res.ok) {
            const json = await res.json();
            setLiveData({ query: currentSearch, data: json });
          }
        } finally {
          setIsFetching(false);
        }
      } catch (err) {
        console.error("Failed to fetch live sync storefront packages:", err);
        setIsFetching(false);
      }
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const currentSearch = window.location.search;
      if (currentSearch) {
        previousSearchStr.current = currentSearch;
        fetchLive();
      }
      return;
    }

    const currentSearch = window.location.search;
    if (currentSearch !== previousSearchStr.current) {
      previousSearchStr.current = currentSearch;
      fetchLive();
    }
  }, [pathname, isBoatRide, isSightseeing, searchParams]);

  const activeData = liveData?.query === currentBrowserSearch ? liveData.data : data;

  const filteredItems = activeData ? activeData.items : [];

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const cleanVal = val.trim();
        if (cleanVal) {
          params.set('q', cleanVal);
        } else {
          params.delete('q');
        }
        params.delete('page'); // Reset to page 1 on new search query
        
        const query = params.toString();
        startTransition(() => {
          router.replace(query ? `${pathnameHook}?${query}` : pathnameHook, { scroll: false });
        });
      }
    }, 400);
  };

  const badgeText = isBoatRide
    ? 'Official Godavari Cruises'
    : isSightseeing
      ? 'Scenic Pilgrimage Journeys'
      : 'All-in-One Tours & Sightseeing';

  const headingText = isBoatRide
    ? 'Explore River Journeys'
    : isSightseeing
      ? 'Heritage & Temple Tours'
      : 'Tours & Sightseeing';

  const headingPrimary = isBoatRide ? 'Premium' : isSightseeing ? 'Cultural' : 'Tours';
  const headingSecondary = isBoatRide ? 'Boat Rides' : isSightseeing ? 'Sightseeing' : 'Sightseeing';

  const headingAccent = isBoatRide
    ? 'Godavari River Cruises'
    : isSightseeing
      ? 'Temple & Nature Trips'
      : 'Curated Travel Experiences';

  const descriptionText = isBoatRide
    ? 'Book scenic Godavari cruise packages through Papikondalu hills with verified reporting, family-friendly planning, and clear local support.'
    : isSightseeing
      ? 'Explore Bhadrachalam temple routes, nature viewpoints, and complete family sightseeing plans with verified local travel support.'
      : 'Book premium boat rides, river cruises, temple tours, and local sightseeing packages with verified local support.';

  const resultLabel = isBoatRide ? 'boat ride experiences' : isSightseeing ? 'sightseeing trips' : 'experiences';

  const backgroundImage = isBoatRide
    ? '/images/boat-rides-banner-2026.webp'
    : isSightseeing
      ? '/images/sightseeing-banner-2026.webp'
      : 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912203/slider4_rikfsq.jpg';

  const HeroIcon = isBoatRide ? Anchor : Camera;
  const heroImagePosition = isBoatRide ? 'center 58%' : isSightseeing ? 'center 54%' : 'center';

  return (
    <div className="bg-[#f6f3ec]">
      {/* Dynamic SEO Hero Banner */}
      <div className="relative min-h-[23rem] overflow-hidden bg-[#071f2f] pb-12 pt-24 sm:min-h-[28rem] sm:pb-16 sm:pt-32">
        <Image
          src={backgroundImage}
          alt={`${headingText} banner`}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: heroImagePosition }}
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,30,0.92)_0%,rgba(3,18,30,0.74)_42%,rgba(3,18,30,0.22)_72%,rgba(3,18,30,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,30,0.18)_0%,rgba(3,18,30,0.08)_42%,rgba(3,18,30,0.62)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f6f3ec] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[15rem] flex-col justify-end gap-8 md:min-h-[18rem] md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl text-white">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/45 bg-slate-950/34 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_28px_rgba(0,0,0,0.2)] backdrop-blur-md sm:px-4">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                {badgeText}
              </div>
              <h1 className="mb-4 flex items-start gap-3 text-[2.8rem] font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.38)] sm:gap-4 sm:text-6xl lg:text-7xl">
                <HeroIcon className="mt-1 h-9 w-9 shrink-0 text-amber-300 sm:h-11 sm:w-11" strokeWidth={1.8} />
                <span>
                  <span className="block text-amber-300">{headingPrimary}</span>
                  <span className="block">{headingSecondary}</span>
                </span>
              </h1>
              <div className="mb-4 flex max-w-md items-center gap-3 text-amber-300/90">
                <span className="h-px flex-1 bg-current/70" />
                <span className="text-xs font-black uppercase tracking-[0.24em]">{headingAccent}</span>
                <span className="h-px flex-1 bg-current/70" />
              </div>
              <p className="max-w-2xl text-base font-semibold leading-7 text-white/86 sm:text-lg">
                {descriptionText}
              </p>
            </div>

            <div>
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search experiences..."
                  className="w-full bg-white/10 border border-white/20 backdrop-blur-md rounded-full py-3 px-6 pl-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)] transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 pb-8 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="hidden lg:col-span-1 lg:block">
            <PackageFilters />
          </aside>

          <div className="lg:col-span-3">
            {!activeData ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center shadow-sm">
                <h3 className="mb-2 text-xl font-black text-[var(--color-brand-river)]">Failed to load</h3>
                <p className="mx-auto mb-8 max-w-sm text-sm text-slate-500">Please try again later.</p>
              </div>
            ) : (
              <div className="transition-opacity duration-200">
                <div className="mb-6 flex items-center justify-between lg:mb-8">
                  <p className="max-w-[calc(100%-8rem)] text-sm font-medium leading-5 text-slate-500 sm:max-w-none">
                    We found <span className="font-bold text-[var(--color-brand-river)]">{activeData.total || 0}</span> amazing {resultLabel}
                  </p>
                  <MobileFilterSheet />
                </div>

                {isFetching ? (
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex h-[400px] flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
                        <div className="h-48 w-full animate-pulse bg-slate-100" />
                        <div className="flex flex-1 flex-col p-5">
                          <div className="mb-3 h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                          <div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-slate-100" />
                          <div className="mb-4 flex gap-2">
                            <div className="h-4 w-4 animate-pulse rounded-full bg-slate-100" />
                            <div className="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
                          </div>
                          <div className="mt-auto grid grid-cols-2 gap-3">
                            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                    {filteredItems.map((pkg, index) => (
                      <PackageCard key={pkg.id} pkg={pkg} priority={index < 4} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center shadow-sm">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                      <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-black text-[var(--color-brand-river)]">No experiences found</h3>
                    <p className="mx-auto mb-8 max-w-sm text-sm text-slate-500 font-semibold leading-relaxed">
                      We could not find any tourism options matching your filters. Try clearing your filters or search query.
                    </p>
                    <Link href={pathname} className="text-sm font-black text-[var(--color-brand-teal)] hover:underline">
                      Clear all filters
                    </Link>
                  </div>
                )}

                <PackageListPagination total={activeData.total} size={activeData.size} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
