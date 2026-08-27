'use client';

import React, { useTransition } from 'react';
import Image from 'next/image';
import { BedDouble, Sparkles, LayoutGrid, List } from 'lucide-react';
import RoomCard from '@/components/ui/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import RoomListPagination from '@/components/rooms/RoomListPagination';
import MobileRoomFilterSheet from '@/components/rooms/MobileRoomFilterSheet';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

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
  categoryName,
  categorySlug,
  categoryDescription,
}: { 
  data?: RoomData; 
  searchParams?: Record<string, string | string[] | undefined>;
  categoryName?: string;
  categorySlug?: string;
  categoryDescription?: string;
}) {
  const router = useRouter();
  const pathnameHook = usePathname();
  const [isPending, startTransition] = useTransition();

  const [allRooms, setAllRooms] = React.useState<RoomItem[]>(data?.items || []);
  const [isFetching, setIsFetching] = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [urlQuery, setUrlQuery] = React.useState(typeof window !== 'undefined' ? window.location.search : '');

  // Listen to popstate & custom filter change events for instant reactivity
  React.useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        setUrlQuery(window.location.search);
        const params = new URLSearchParams(window.location.search);
        setSearchVal(params.get('q') || '');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('app:filter-change', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('app:filter-change', handleLocationChange);
    };
  }, []);

  // Sync search input with URL parameter 'q'
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchVal(params.get('q') || '');
    }
  }, [urlQuery]);

  // Update allRooms if initial data changes
  React.useEffect(() => {
    if (data?.items && data.items.length > 0) {
      setAllRooms(data.items);
      setIsFetching(false);
    }
  }, [data]);

  // Fetch complete rooms dataset in background if not provided by SSR
  React.useEffect(() => {
    if (data?.items && data.items.length > 0 && categorySlug) return;

    let isMounted = true;
    const fetchAllRooms = async () => {
      try {
        if (!data?.items || data.items.length === 0) {
          setIsFetching(true);
        }
        const fetchUrl = categorySlug
          ? `/api/v1/rooms/categories/${categorySlug}`
          : '/api/v1/rooms?size=100';
        const res = await fetch(fetchUrl);
        if (res.ok && isMounted) {
          const json = await res.json();
          const items = categorySlug ? (json.rooms || []) : (json.items || []);
          if (items && items.length > 0) {
            setAllRooms(items);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rooms for client-side search:", err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchAllRooms();
    return () => { isMounted = false; };
  }, [categorySlug, data]);

  // INSTANT Client-Side Search & Filter Engine
  const filteredItems = React.useMemo(() => {
    if (!allRooms || allRooms.length === 0) return [];

    const params = typeof window !== 'undefined' ? new URLSearchParams(urlQuery) : new URLSearchParams();
    const query = searchVal.trim().toLowerCase() || params.get('q')?.trim().toLowerCase() || '';
    const isFeatured = params.get('is_featured') === 'true';
    const facilitiesFilter = params.getAll('facilities');

    let list = [...allRooms];

    // 1. Filter by search query
    if (query) {
      const queryWords = query.split(/\s+/);
      list = list.filter((item) => {
        const textToSearch = [
          item.lodge_name,
          item.slug,
          item.address,
          ...(item.facilities || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return queryWords.every((word) => textToSearch.includes(word));
      });
    }

    // 2. Filter by Must Experience (featured toggle)
    if (isFeatured) {
      list = list.filter((item) => item.is_featured);
    }

    // 3. Filter by Facilities
    if (facilitiesFilter && facilitiesFilter.length > 0) {
      list = list.filter((item) =>
        facilitiesFilter.every((fac) =>
          (item.facilities || []).some((itemFac) => itemFac.toLowerCase().includes(fac.toLowerCase()))
        )
      );
    }

    return list;
  }, [allRooms, searchVal, urlQuery]);

  const activeData = { items: filteredItems, total: filteredItems.length, size: filteredItems.length };

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    
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

  return (
    <div className="bg-[#f4f6ef] min-h-screen">
      {/* State-of-the-Art Hero Canvas */}
      <div className="relative overflow-hidden bg-slate-950 pb-16 pt-24 sm:pb-20 sm:pt-32">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />
        
        <Image
          src="https://res.cloudinary.com/r929tquv/image/upload/v1785917195/ts_boat_tourism/images/apggofcaijeekofdotpa.jpg"
          alt="Riverside stays and accommodation banner"
          fill
          sizes="100vw"
          className="object-cover opacity-65"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-emerald-950/40" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent" />

        <div className="relative z-10 mx-auto max-w-[112rem] px-3 sm:px-5 lg:px-6 2xl:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {categoryName ? `Stay Category: ${categoryName}` : 'Verified Riverside Lodging'}
              </div>

              <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                <span className="block text-emerald-400 font-extrabold text-xl sm:text-2xl uppercase tracking-widest mb-1.5">{categoryName ? 'Category' : 'Bamboo Huts & Resorts'}</span>
                <span className="block text-white drop-shadow-sm">{categoryName || 'Riverside Stays'}</span>
              </h1>

              <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-300">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                  🛖 Authentic Bamboo Huts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                  🌊 Riverfront Views
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                  🔥 Campfire Facilities
                </span>
              </div>
            </div>

            {/* Right Interactive Search Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/40">
                <h3 className="mb-2 text-md font-bold text-white flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-emerald-400" />
                  Find Accommodations
                </h3>
                <p className="mb-4 text-xs text-slate-300">Search by lodge name, location, or facility</p>

                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search e.g. Bamboo Huts, AC Family Suite, Forest Cottages..."
                    className="w-full bg-slate-950/70 border border-slate-700/80 backdrop-blur-md rounded-xl py-3 px-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all shadow-inner"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-300">
                  <span className="text-slate-400">Featured Types:</span>
                  <button onClick={() => handleSearchChange('Bamboo')} className="hover:text-emerald-300 underline cursor-pointer">Bamboo Huts</button>
                  <button onClick={() => handleSearchChange('Deluxe')} className="hover:text-emerald-300 underline cursor-pointer">Deluxe AC Suites</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Listing Layout */}
      <div className="mx-auto max-w-[112rem] px-3 py-7 pb-8 sm:px-5 lg:px-6 lg:pb-16 2xl:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] items-start">
          
          {/* FIXED Sidebar Filter */}
          <aside className="hidden lg:block self-start">
            <RoomFilters sticky={true} />
          </aside>

          {/* Main Items Column */}
          <div className="min-w-0">
            {!activeData ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center shadow-sm">
                <h3 className="mb-2 text-xl font-black text-[#0f3d56]">Failed to load</h3>
                <p className="mx-auto mb-8 max-w-sm text-sm text-slate-500">Please try again later.</p>
              </div>
            ) : (
              <div className="transition-opacity duration-200">
                
                {/* Results Header + View Switcher Toggle */}
                <div className="mb-6 flex items-center justify-between lg:mb-8 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    We found <span className="font-black text-[#0d6e75]">{activeData.total || 0}</span> beautiful stays
                  </p>

                  <div className="flex items-center gap-2">
                    {/* View Switcher: Boxes (Grid) vs Full (List) */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        title="Boxes / Grid View"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          viewMode === 'grid'
                            ? 'bg-[#0d6e75] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Boxes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        title="Full / Detailed List View"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          viewMode === 'list'
                            ? 'bg-[#0d6e75] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Full</span>
                      </button>
                    </div>

                    <MobileRoomFilterSheet />
                  </div>
                </div>

                {/* Listing Items */}
                {isFetching ? (
                  <div className="flex flex-col gap-5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:flex-row">
                        <div className="h-56 w-full animate-pulse bg-slate-100 md:h-[240px] md:w-[320px] shrink-0" />
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
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {filteredItems.map((room) => (
                        <RoomCard key={room.id} room={room} variant="grid" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {filteredItems.map((room) => (
                        <RoomCard key={room.id} room={room} variant="list" />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                      <BedDouble className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-black text-[#0f3d56]">No stays found</h3>
                    <p className="mx-auto mb-6 max-w-sm text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                      We could not find any accommodations matching your criteria. Try adjusting your search parameters.
                    </p>
                    <button onClick={() => handleSearchChange('')} className="inline-flex items-center justify-center rounded-xl bg-[#0d6e75] px-4 py-2.5 text-xs font-black text-white hover:bg-[#0b5c62] shadow-2xs">
                      Clear all filters
                    </button>
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
