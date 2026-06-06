'use client';

import React from 'react';
import Image from 'next/image';
import { BedDouble, Sparkles } from 'lucide-react';
import RoomCard from '@/components/ui/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import RoomListPagination from '@/components/rooms/RoomListPagination';
import MobileRoomFilterSheet from '@/components/rooms/MobileRoomFilterSheet';
import Link from 'next/link';
import { Search } from 'lucide-react';

type RoomData = {
  items: RoomItem[];
  total: number;
  size: number;
};

type RoomItem = {
  id: number;
  slug: string;
  lodge_name: string;
  cover_image_url: string | null;
  is_featured: boolean;
  starting_price: number | null | string;
  starting_weekend_price?: number | null | string;
  address: string | null;
  facilities: string[];
};

export default function RoomsList({ 
  data, 
  searchParams,
}: { 
  data?: RoomData; 
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [liveData, setLiveData] = React.useState<{ query: string; data: RoomData } | undefined>(undefined);
  const [isFetching, setIsFetching] = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  const isInitialMount = React.useRef(true);
  const previousSearchStr = React.useRef(typeof window !== 'undefined' ? window.location.search : '');
  const currentBrowserSearch = typeof window !== 'undefined' ? window.location.search : '';

  // To avoid Next.js dynamic bail-out during build when reading searchParams directly,
  // we do not use the useSearchParams hook outside of a Suspense boundary if we want the 
  // route to remain perfectly static. Instead, we use a simple window location check in useEffect.
  React.useEffect(() => {
    const fetchLive = async () => {
      try {
        const currentSearch = window.location.search;
        const queryParams = new URLSearchParams(currentSearch);
        
        // If there are no query parameters, we can just use the server-provided SSG data 
        // without an extra network call.
        if (queryParams.toString() === '') {
          return;
        }

        queryParams.set('size', '6');
        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
        setIsFetching(true);
        try {
          const res = await fetch(`/api/v1/rooms${queryStr}`);
          if (res.ok) {
            const json = await res.json();
            setLiveData({ query: currentSearch, data: json });
          }
        } finally {
          setIsFetching(false);
        }
      } catch (err) {
        console.error("Failed to fetch live sync storefront stays:", err);
        setIsFetching(false);
      }
    };
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentSearch = window.location.search;
    if (currentSearch !== previousSearchStr.current) {
      previousSearchStr.current = currentSearch;
      fetchLive();
    }
  }, [searchParams]);

  const activeData = liveData?.query === currentBrowserSearch ? liveData.data : data;

  // Extract active items and filter locally
  const filteredItems = activeData ? activeData.items.filter((room) => 
    searchVal === '' || 
    (room.lodge_name && room.lodge_name.toLowerCase().includes(searchVal.toLowerCase()))
  ) : [];

  return (
    <div className="bg-[#f4f6ef]">
      {/* Premium Hero Banner */}
      <div className="relative min-h-[23rem] overflow-hidden bg-[#0c2b24] pb-12 pt-24 sm:min-h-[28rem] sm:pb-16 sm:pt-32">
        <Image
          src="/images/stays-banner-2026.webp"
          alt="Riverside stays and accommodation banner"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: 'center 56%' }}
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,24,20,0.92)_0%,rgba(5,24,20,0.72)_42%,rgba(5,24,20,0.18)_72%,rgba(5,24,20,0.04)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,24,20,0.14)_0%,rgba(5,24,20,0.06)_42%,rgba(5,24,20,0.58)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f4f6ef] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[15rem] flex-col justify-end gap-8 md:min-h-[18rem] md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl text-white">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/45 bg-slate-950/34 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_28px_rgba(0,0,0,0.2)] backdrop-blur-md sm:px-4">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                Verified Riverside Lodging
              </div>
              <h1 className="mb-4 flex items-start gap-3 text-[2.8rem] font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.38)] sm:gap-4 sm:text-6xl lg:text-7xl">
                <BedDouble className="mt-1 h-9 w-9 shrink-0 text-amber-300 sm:h-11 sm:w-11" strokeWidth={1.8} />
                <span>
                  <span className="block text-amber-300">Riverside</span>
                  <span className="block">Stays</span>
                </span>
              </h1>
              <div className="mb-4 flex max-w-md items-center gap-3 text-amber-300/90">
                <span className="h-px flex-1 bg-current/70" />
                <span className="text-xs font-black uppercase tracking-[0.24em]">Bamboo Huts & Verified Rooms</span>
                <span className="h-px flex-1 bg-current/70" />
              </div>
              <p className="max-w-2xl text-base font-semibold leading-7 text-white/86 sm:text-lg">
                Book cozy riverside cottages, bamboo-style stays, and comfortable pilgrim rooms around Bhadrachalam and Kolluru with verified booking support.
              </p>
            </div>

            <div>
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search by hotel or area..." 
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
            <RoomFilters />
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
                    We found <span className="font-bold text-[var(--color-brand-river)]">{activeData.total || 0}</span> beautiful stays
                  </p>
                  <MobileRoomFilterSheet />
                </div>

                {isFetching ? (
                  <div className="flex flex-col gap-5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-[#d6e4dd] bg-white shadow-sm md:flex-row">
                        <div className="h-56 w-full animate-pulse bg-slate-100 md:h-auto md:w-[31%]" />
                        <div className="flex flex-1 flex-col p-5">
                          <div className="mb-3 h-7 w-2/3 animate-pulse rounded bg-slate-100" />
                          <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                          <div className="mb-5 flex gap-2">
                            <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
                            <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
                            <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
                          </div>
                          <div className="mt-auto h-14 w-full animate-pulse rounded-xl bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {filteredItems.map((room) => (
                      <RoomCard key={room.id} room={room} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center shadow-sm">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                      <BedDouble className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-black text-[var(--color-brand-river)]">No stays found</h3>
                    <p className="mx-auto mb-8 max-w-sm text-sm text-slate-500 font-semibold leading-relaxed">
                      We could not find any accommodations matching your criteria. Try adjusting your search parameters.
                    </p>
                    <Link href="/stays" className="text-sm font-black text-[var(--color-brand-teal)] hover:underline">
                      Clear all filters
                    </Link>
                  </div>
                )}

                <RoomListPagination total={activeData.total} size={activeData.size} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
