import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, CheckCircle2, ConciergeBell, MapPin, MoonStar } from 'lucide-react';
import { getCardTags, PremiumTag } from '@/components/ui/Badges';
import { getPriceDetails } from '@/lib/pricing';

interface RoomProps {
  room: {
    id: number;
    slug: string;
    lodge_name: string;
    cover_image_url: string | null;
    is_featured: boolean;
    starting_price: number | null;
    address: string | null;
    facilities: string[];
  };
}

function RoomCard({ room }: RoomProps) {
  const prices = getPriceDetails(room.starting_price);
  const roomTags = getCardTags(
    [
      ...(room.is_featured ? ['Premium Stay'] : []),
      ...room.facilities.filter((facility) => ['A/C', 'Wi-Fi', 'Hot Water', 'Room Service'].includes(facility)),
    ],
    room.is_featured,
    4
  );

  return (
    <Link 
      href={`/stays/${room.slug}`}
      className="smooth-card group/card relative block overflow-hidden rounded-xl border border-[#d6e4dd] bg-white shadow-[0_10px_28px_rgba(44,94,67,0.08)] outline outline-1 outline-white/70 transition-[box-shadow,border-color] duration-200 hover:border-[var(--color-brand-green)]/25 hover:shadow-[0_16px_38px_rgba(44,94,67,0.12)]"
    >
      <div className="pointer-events-none absolute inset-x-10 -bottom-8 hidden h-24 rounded-full bg-[#82c59d]/18 blur-2xl transition-opacity duration-300 sm:block" />
      <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-64">
        <Image 
          src={room.cover_image_url || '/placeholder-room.jpg'} 
          alt={room.lodge_name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,22,34,0.02)_0%,rgba(3,22,34,0.08)_34%,rgba(12,43,31,0.84)_100%)]" />
        <div className="absolute inset-0 bg-[#d7f5de] opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover/card:opacity-25" />
        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
          <div className="flex max-w-[78%] flex-wrap gap-2">
            {roomTags.slice(0, 2).map((tag) => (
              <PremiumTag key={tag} name={tag} compact />
            ))}
          </div>
          <div className="rounded-full border border-white/25 bg-black/18 p-2 text-white shadow-lg backdrop-blur-md">
            <ConciergeBell className="h-4 w-4" />
          </div>
        </div>
        {prices && (
          <div className="absolute bottom-4 right-4 z-10 rounded-full border border-white/30 bg-white/88 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-teal)] shadow-[0_10px_28px_rgba(0,0,0,0.16)] backdrop-blur-md">
            {prices.percentOff}% OFF
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-10 max-w-[68%] text-white">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
            <MoonStar className="h-3.5 w-3.5 text-[#d9f2c8]" />
            Comfort Stay
          </div>
        </div>
      </div>

      <div className="relative flex flex-col p-5 sm:p-6">
        <h3 className="mb-3 min-h-[2.9rem] text-[1.35rem] font-black leading-[1.08] text-[var(--color-brand-river)] line-clamp-2 sm:text-[1.45rem]">
          {room.lodge_name}
        </h3>
        
        <div className="mb-4 flex items-start gap-1.5 text-xs font-semibold leading-5 text-slate-500 line-clamp-2">
          <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-teal)] shrink-0 mt-0.5" />
          {room.address || 'Bhadrachalam'}
        </div>

        <div className="mb-5 grid grid-cols-1 gap-2">
          {room.facilities.slice(0, 3).map((facility, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
              <CheckCircle2 className="h-3 w-3 text-[var(--color-brand-green)]" />
              {facility}
            </div>
          ))}
          {room.facilities.length > 3 && (
            <div className="text-[11px] font-semibold text-slate-400">
              +{room.facilities.length - 3} more
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 rounded-xl border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(241,250,244,0.76))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 truncate">Stays from</p>
            <div className="flex flex-col">
              {prices && (
                <span className="text-[10px] text-slate-400 line-through decoration-rose-400/60 font-medium">
                  ₹{prices.originalPrice}
                </span>
              )}
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-2xl font-black text-[var(--color-brand-teal)] leading-none">
                  {room.starting_price ? `₹${room.starting_price}` : 'TBA'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ night</span>
              </div>
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-lg">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(RoomCard);
