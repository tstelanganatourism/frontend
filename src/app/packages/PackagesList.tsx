'use client';

import React from 'react';
import Image from 'next/image';
import { Map, Search, Sparkles } from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import PackageFilters from '@/components/packages/PackageFilters';
import PackageListPagination from '@/components/packages/PackageListPagination';
import MobileFilterSheet from '@/components/packages/MobileFilterSheet';
import Link from 'next/link';

type PackageData = {
  items: any[];
  total: number;
  size: number;
};

export default function PackagesList({
  data,
  pathname,
  searchParams
}: {
  data?: PackageData;
  pathname: string;
  searchParams?: any;
}) {
  const isBoatRide = pathname === '/boat-rides';
  const isSightseeing = pathname === '/sightseeing';

  const [liveData, setLiveData] = React.useState<PackageData | undefined>(undefined);
  const [searchVal, setSearchVal] = React.useState('');

  React.useEffect(() => {
    const fetchLive = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchParams) {
          Object.entries(searchParams).forEach(([key, val]) => {
            if (Array.isArray(val)) {
              val.forEach(v => queryParams.append(key, v));
            } else if (val) {
              queryParams.set(key, val as string);
            }
          });
        }
        if (isBoatRide) {
          queryParams.set('type', 'TOUR');
        } else if (isSightseeing) {
          queryParams.set('type', 'TRIP');
        }

        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const res = await fetch(`/api/v1/packages${query}`);
        if (res.ok) {
          const json = await res.json();
          setLiveData(json);
        }
      } catch (err) {
        console.error("Failed to fetch live sync storefront packages:", err);
      }
    };

    fetchLive();
  }, [pathname, searchParams, isBoatRide, isSightseeing]);

  const activeData = liveData !== undefined ? liveData : data;

  // Extract active items and filter locally
  const filteredItems = activeData ? activeData.items.filter((pkg: any) => 
    searchVal === '' || 
    (pkg.title && pkg.title.toLowerCase().includes(searchVal.toLowerCase())) ||
    (pkg.slug && pkg.slug.toLowerCase().includes(searchVal.toLowerCase()))
  ) : [];

  const badgeText = isBoatRide
    ? 'Official Godavari Cruises'
    : isSightseeing
      ? 'Scenic Pilgrimage Journeys'
      : 'All-in-One Tours & Sightseeing';

  const headingText = isBoatRide
    ? 'Pappikondalu Boat Rides'
    : isSightseeing
      ? 'Bhadrachalam Sightseeing'
      : 'Tours & Sightseeing';

  const descriptionText = isBoatRide
    ? 'Book premium government-approved river cruises, luxury boat rides, and traditional dining day trips through the stunning Papi Hills.'
    : isSightseeing
      ? 'Explore sacred temple tours, guided nature excursions, and complete family packages with verified local support.'
      : 'Book premium boat rides, river cruises, temple tours, and local sightseeing packages with verified local support.';

  const resultLabel = isBoatRide ? 'boat ride experiences' : isSightseeing ? 'sightseeing trips' : 'experiences';

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      {/* Dynamic SEO Hero Banner */}
      <div className="relative overflow-hidden bg-[var(--color-brand-river)] pb-14 pt-28 sm:pb-16 sm:pt-36">
        <Image
          src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912203/slider4_rikfsq.jpg"
          alt="Explore Tours Background"
          fill
          className="object-cover opacity-45"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,32,47,0.6),rgba(7,32,47,0.88)),linear-gradient(90deg,rgba(7,32,47,0.94),rgba(7,32,47,0.36))]" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f6f3ec] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-[var(--color-brand-sand)] animate-spin-slow" />
                {badgeText}
              </div>
              <h1 className="mb-6 flex items-center gap-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                <Map className="h-10 w-10 text-[var(--color-brand-teal)] shrink-0" />
                {headingText}
              </h1>
              <p className="text-lg leading-relaxed text-white/70">
                {descriptionText}
              </p>
            </div>

            <div>
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search experiences..." 
                  className="w-full bg-white/10 border border-white/20 backdrop-blur-md rounded-full py-3 px-6 pl-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)] transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 pb-32 sm:px-6 lg:px-8 lg:pb-16">
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
                    We found <span className="font-bold text-[var(--color-brand-river)]">{filteredItems.length || 0}</span> amazing {resultLabel}
                  </p>
                  <MobileFilterSheet />
                </div>

                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                    {filteredItems.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
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
