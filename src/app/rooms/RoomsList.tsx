import React from 'react';
import Image from 'next/image';
import { BedDouble, Sparkles } from 'lucide-react';
import RoomCard from '@/components/ui/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import RealtimeSearch from '@/components/rooms/RealtimeSearch';
import RoomListPagination from '@/components/rooms/RoomListPagination';
import MobileRoomFilterSheet from '@/components/rooms/MobileRoomFilterSheet';
import Link from 'next/link';

type RoomData = {
  items: any[];
  total: number;
  size: number;
};

export default function RoomsList({ 
  data, 
  query,
  searchParams
}: { 
  data?: RoomData; 
  query?: string; 
  searchParams?: any;
}) {
  const [liveData, setLiveData] = React.useState<RoomData | undefined>(undefined);

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
        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const res = await fetch(`/api/v1/rooms${queryStr}`);
        if (res.ok) {
          const json = await res.json();
          setLiveData(json);
        }
      } catch (err) {
        console.error("Failed to fetch live sync storefront stays:", err);
      }
    };
    
    fetchLive();
  }, [searchParams]);

  const activeData = liveData !== undefined ? liveData : data;

  // Extract search term from query if needed for RealtimeSearch defaultValue
  let qValue = '';
  if (query) {
    const params = new URLSearchParams(query);
    qValue = params.get('q') || '';
  }

  return (
    <div className="min-h-screen bg-[#f4f6ef]">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-[var(--color-brand-river)] pb-14 pt-22 sm:pb-16 sm:pt-28">
        <Image
          src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912248/slider2_souyzb.jpg"
          alt="Luxury Stays Background"
          fill
          className="object-cover opacity-45"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,32,47,0.56),rgba(7,32,47,0.88)),linear-gradient(90deg,rgba(18,54,39,0.92),rgba(18,54,39,0.32))]" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f4f6ef] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-[var(--color-brand-sand)] animate-spin-slow" />
                Verified Riverside Lodging
              </div>
              <h1 className="mb-6 flex items-center gap-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                <BedDouble className="h-10 w-10 text-[var(--color-brand-teal)] shrink-0" />
                Riverside Stays
              </h1>
              <p className="text-lg leading-relaxed text-white/70">
                Book premium bamboo huts, Godavari forest resorts, and comfortable pilgrim cottages in Bhadrachalam and Kolluru with verified booking support.
              </p>
            </div>

            <div>
              <RealtimeSearch defaultValue={qValue} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 pb-32 sm:px-6 lg:px-8 lg:pb-16">
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

                {activeData.items.length > 0 ? (
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {activeData.items.map((room) => (
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
