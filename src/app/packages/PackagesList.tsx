'use client';

import React, { useTransition } from 'react';
import Image from 'next/image';
import { Anchor, Camera, Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
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

  const [allPackages, setAllPackages] = React.useState<PackageItem[]>(data?.items || []);
  const [isFetching, setIsFetching] = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  
  const currentBrowserSearch = typeof window !== 'undefined' ? window.location.search : '';

  // Sync search input with URL parameter 'q'
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchVal(params.get('q') || '');
    }
  }, [currentBrowserSearch]);

  // Initial fetch of complete packages dataset (size=100) to ensure full offline client-side search
  React.useEffect(() => {
    let isMounted = true;
    const fetchAllPackages = async () => {
      try {
        setIsFetching(true);
        const res = await fetch('/api/v1/packages?size=100');
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.items && json.items.length > 0) {
            setAllPackages(json.items);
          }
        }
      } catch (err) {
        console.error("Failed to fetch full packages for client-side search:", err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchAllPackages();
    return () => { isMounted = false; };
  }, []);

  // INSTANT Client-Side Search & Filter Engine
  const filteredItems = React.useMemo(() => {
    if (!allPackages || allPackages.length === 0) return [];

    const params = typeof window !== 'undefined' ? new URLSearchParams(currentBrowserSearch) : new URLSearchParams();
    const query = searchVal.trim().toLowerCase() || params.get('q')?.trim().toLowerCase() || '';
    const isFeatured = params.get('is_featured') === 'true';
    const region = params.get('region');
    const destination = params.get('destination');
    const category = params.get('category') || (isBoatRide ? 'BOAT' : isSightseeing ? 'SIGHTSEEING' : null);
    const sort = params.get('sort');

    let list = [...allPackages];

    // 1. Filter by page type route
    if (isBoatRide) {
      list = list.filter((item) => item.type === 'TOUR' || item.type?.includes('BOAT') || item.title?.toLowerCase().includes('cruise') || item.title?.toLowerCase().includes('boat'));
    } else if (isSightseeing) {
      list = list.filter((item) => item.type === 'TRIP' || item.type?.includes('SIGHTSEEING') || item.title?.toLowerCase().includes('sightseeing') || item.title?.toLowerCase().includes('temple'));
    }

    // 2. Filter by search query (instant matching across title, place, region, type, slug, tags)
    if (query) {
      const queryWords = query.split(/\s+/);
      list = list.filter((item) => {
        const textToSearch = [
          item.title,
          item.slug,
          item.place,
          item.region,
          item.type,
          ...(item.tags || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return queryWords.every((word) => textToSearch.includes(word));
      });
    }

    // 3. Filter by Must Experience (featured toggle)
    if (isFeatured) {
      list = list.filter((item) => item.is_featured);
    }

    // 4. Filter by Region (TS / AP)
    if (region) {
      list = list.filter((item) => item.region?.toUpperCase() === region.toUpperCase());
    }

    // 5. Filter by Destination / Place
    if (destination) {
      list = list.filter((item) => 
        item.place?.toLowerCase() === destination.toLowerCase() || 
        item.title?.toLowerCase().includes(destination.toLowerCase())
      );
    }

    // 6. Filter by Category / Type
    if (category) {
      const catUpper = category.toUpperCase();
      if (catUpper === 'BOAT') {
        list = list.filter((item) => item.type === 'TOUR' || item.title?.toLowerCase().includes('cruise') || item.title?.toLowerCase().includes('boat'));
      } else if (catUpper === 'SIGHTSEEING') {
        list = list.filter((item) => item.type === 'TRIP' || item.title?.toLowerCase().includes('sightseeing') || item.title?.toLowerCase().includes('temple'));
      }
    }

    // 7. Sort
    if (sort === 'price_asc') {
      list.sort((a, b) => (Number(a.starting_price) || 0) - (Number(b.starting_price) || 0));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (Number(b.starting_price) || 0) - (Number(a.starting_price) || 0));
    } else if (sort === 'rating_desc') {
      list.sort((a, b) => (Number(b.is_featured ? 5 : 4) - Number(a.is_featured ? 5 : 4)));
    }

    return list;
  }, [allPackages, searchVal, currentBrowserSearch, isBoatRide, isSightseeing]);

  const activeData = { items: filteredItems, total: filteredItems.length, size: filteredItems.length };

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    
    // Instant background URL sync without network re-fetches
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cleanVal = val.trim();
      if (cleanVal) {
        params.set('q', cleanVal);
      } else {
        params.delete('q');
      }
      params.delete('page');
      
      const query = params.toString();
      window.history.replaceState(null, '', query ? `${pathnameHook}?${query}` : pathnameHook);
    }
  };

  const badgeText = isBoatRide
    ? 'Official Godavari Cruises'
    : isSightseeing
      ? 'Scenic Pilgrimage Journeys'
      : 'All-in-One Tours & Sightseeing';

  const headingPrimary = isBoatRide ? 'Godavari' : isSightseeing ? 'Heritage & Temple' : 'Tours &';
  const headingSecondary = isBoatRide ? 'Cruises & Rides' : isSightseeing ? 'Sightseeing Tours' : 'Sightseeings';

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
      : '/images/packages_hero_bg.png';

  const heroImagePosition = isBoatRide ? 'center 58%' : isSightseeing ? 'center 54%' : 'center';

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Unique State-of-the-Art Hero Canvas */}
      <div className="relative overflow-hidden bg-slate-950 pb-8 pt-20 sm:pb-10 sm:pt-24">
        {/* Ambient Glow Effects */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        
        {/* Rich Photography Background Image */}
        <Image
          src={backgroundImage}
          alt="Tourism Canvas Background"
          fill
          sizes="100vw"
          className="object-cover opacity-60"
          style={{ objectPosition: heroImagePosition }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/40" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-50/50 to-transparent" />
 
        <div className="relative z-10 mx-auto max-w-[112rem] px-3 sm:px-5 lg:px-6 2xl:px-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-teal-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3 w-3 text-amber-300" />
                {badgeText}
              </div>
 
              <h1 className="mb-2 text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
                <span className="block text-teal-400 font-extrabold text-sm sm:text-base uppercase tracking-widest mb-1">{headingPrimary}</span>
                <span className="block text-white drop-shadow-sm">{headingSecondary}</span>
              </h1>
 
              <p className="mb-4 max-w-xl text-xs font-semibold leading-relaxed text-slate-350 sm:text-sm">
                {descriptionText}
              </p>
 
              {/* Quick Feature Badges */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 backdrop-blur-xs">
                  ✨ Instant
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 backdrop-blur-xs">
                  🛡️ Verified
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 backdrop-blur-xs">
                  🚢 Safe
                </span>
              </div>
            </div>
 
            {/* Right Interactive Card Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-teal-400/40">
                <h3 className="mb-1 text-sm font-bold text-white flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-teal-400" />
                  Find Your Ideal Experience
                </h3>
                <p className="mb-3 text-[10px] text-slate-300">Search by title, location, or tour highlights</p>
 
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search e.g. Papikondalu, Kolluru, Bhadrachalam..."
                    className="w-full bg-slate-950/70 border border-slate-700/80 backdrop-blur-md rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all shadow-inner"
                  />
                </div>
 
                <div className="flex flex-wrap gap-1.5 text-[9px] font-semibold text-slate-350">
                  <span className="text-slate-450">Popular:</span>
                  <button onClick={() => handleSearchChange('Papikondalu')} className="hover:text-teal-300 underline cursor-pointer">Papikondalu</button>
                  <button onClick={() => handleSearchChange('Kolluru')} className="hover:text-teal-300 underline cursor-pointer">Kolluru</button>
                  <button onClick={() => handleSearchChange('Sirivaka')} className="hover:text-teal-300 underline cursor-pointer">Sirivaka</button>
                  <button onClick={() => handleSearchChange('Bogatha')} className="hover:text-teal-300 underline cursor-pointer">Bogatha</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[112rem] px-3 py-7 pb-16 sm:px-5 lg:px-6 2xl:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] items-start">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block sticky top-[92px] self-start">
            <PackageFilters sticky={false} />
          </aside>

          {/* Packages Listing Area */}
          <div className="min-w-0">
            {!activeData ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-md font-bold text-slate-800">Failed to load packages</h3>
                <p className="mx-auto mb-6 max-w-xs text-xs text-slate-500 leading-normal">
                  There was a connection issue. Please try refreshing or checking back shortly.
                </p>
                <button
                  onClick={() => router.refresh()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-600 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload Page
                </button>
              </div>
            ) : (
              <div className="transition-opacity duration-200">
                {/* Result header */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    We found <span className="font-bold text-teal-600">{activeData.total || 0}</span> matching {resultLabel}
                  </p>
                  <MobileFilterSheet />
                </div>

                {isFetching ? (
                  /* Premium Skeleton Loader */
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                        <div className="h-40 w-full animate-pulse bg-slate-100" />
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-2 h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                          <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                          <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                          <div className="mt-auto h-9 w-full animate-pulse rounded-xl bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredItems.map((pkg, index) => (
                      <PackageCard key={pkg.id} pkg={pkg} priority={index < 6} />
                    ))}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1.5 text-md font-bold text-slate-800">No experiences found</h3>
                    <p className="mx-auto mb-6 max-w-xs text-xs text-slate-500 font-medium leading-relaxed">
                      We couldn't find any tour packages matching your search filters. Try resetting your choices or using different keywords.
                    </p>
                    <button
                      onClick={() => {
                        startTransition(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          router.replace(pathnameHook, { scroll: true });
                        });
                      }}
                      className="text-xs font-black text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      Clear all active filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                <div className="mt-8">
                  <PackageListPagination total={activeData.total} size={activeData.size} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
