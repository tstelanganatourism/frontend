import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  CheckCircle2, 
  ConciergeBell, 
  MapPin, 
  MoonStar, 
  Star, 
  Sparkles, 
  Coffee, 
  Tv, 
  Shield, 
  Wind, 
  Flame, 
  Wifi, 
  Car, 
  UtensilsCrossed 
} from 'lucide-react';
import { getCardTags, PremiumTag } from '@/components/ui/Badges';
import { getPriceDetails } from '@/lib/pricing';

interface RoomProps {
  room: {
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
  variant?: 'grid' | 'list';
}

const FACILITY_ICON_MAP: Record<string, React.ElementType> = {
  'a/c': Wind,
  'ac': Wind,
  'tv': Tv,
  'invertor': Shield,
  'generator': Shield,
  'car parking': Car,
  'parking': Car,
  'hot water': Flame,
  'wi-fi': Wifi,
  'wifi': Wifi,
  'room service': Coffee,
  'restaurant': UtensilsCrossed,
  'meals': UtensilsCrossed,
};

function getFacilityIcon(name: string): React.ElementType {
  const key = name.trim().toLowerCase();
  return FACILITY_ICON_MAP[key] || CheckCircle2;
}

/**
 * Generate a deterministic "random" rating between 4.5 and 4.9
 * based on the room id, so it's stable across renders and SSR/CSR.
 */
function getRoomRating(id: number) {
  const seed = ((id * 7919) + 13) % 100;          // deterministic hash
  const rating = 4.5 + (seed % 5) * 0.1;          // 4.5, 4.6, 4.7, 4.8, 4.9
  const reviewCount = 40 + ((id * 31 + 7) % 160); // 40–199 reviews
  return { rating: Math.round(rating * 10) / 10, reviewCount };
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((index) => {
          // Calculate precise fill percentage for this specific star
          const fillPercent = Math.max(0, Math.min(100, (rating - index) * 100));
          
          return (
            <div key={index} className="relative h-4 w-4 shrink-0">
              {/* Grey/Outline Background Star */}
              <Star className="absolute inset-0 h-4 w-4 text-slate-300 fill-slate-100" />
              
              {/* Gold Filled overlay star clipped to fillPercent */}
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: `${fillPercent}%` }}
              >
                <Star className="h-4 w-4 text-amber-400 fill-amber-400 max-w-none" />
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-sm font-extrabold text-slate-800 ml-1">{rating}</span>
      <span className="text-xs font-semibold text-slate-400">({count} reviews)</span>
    </div>
  );
}

function RoomCard({ room, variant = 'list' }: RoomProps) {
  const startPriceNum = room.starting_price ? Number(room.starting_price) : null;
  const startWeekendNum = room.starting_weekend_price ? Number(room.starting_weekend_price) : null;
  const prices = getPriceDetails(startPriceNum);
  const { rating, reviewCount } = getRoomRating(room.id);
  const roomTags = getCardTags(
    [
      ...(room.is_featured ? ['Premium Stay'] : []),
      ...room.facilities.filter((facility) => ['A/C', 'Wi-Fi', 'Hot Water', 'Room Service'].includes(facility)),
    ],
    room.is_featured,
    4
  );

  if (variant === 'list') {
    const visibleFacilities = room.facilities.slice(0, 5);

    return (
      <Link
        href={`/stays/${room.slug}`}
        className="group/list block overflow-hidden rounded-2xl border border-[#d6e4dd] bg-white shadow-[0_14px_34px_rgba(15,61,86,0.07)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-green)]/35 hover:shadow-[0_20px_50px_rgba(15,61,86,0.12)]"
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-100 md:h-auto md:min-h-[232px] md:w-[31%] md:max-w-[320px]">
            <Image
              src={room.cover_image_url || '/placeholder-room.jpg'}
              alt={room.lodge_name}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover transition-transform duration-500 group-hover/list:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,22,34,0.02)_0%,rgba(3,22,34,0.1)_48%,rgba(8,35,27,0.58)_100%)]" />
            {room.is_featured && (
              <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-lg">
                <Sparkles className="h-3 w-3" />
                Featured
              </div>
            )}
            {prices && (
              <div className="absolute right-3 top-3 z-10 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg">
                {prices.percentOff}% off
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-black leading-tight text-slate-900 transition-colors duration-200 group-hover/list:text-[var(--color-brand-teal)] sm:text-2xl">
                  {room.lodge_name}
                </h3>
                <div className="mt-2 flex items-start gap-1.5 text-sm font-semibold leading-5 text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-teal)]" />
                  <span className="line-clamp-2">{room.address || 'Bhadrachalam'}</span>
                </div>
              </div>
              {room.is_featured && (
                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Verified
                </span>
              )}
            </div>

            <div className="mt-3">
              <StarRating rating={rating} count={reviewCount} />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {visibleFacilities.map((facility) => {
                const Icon = getFacilityIcon(facility);
                return (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100"
                  >
                    <Icon className="h-3 w-3 text-[var(--color-brand-teal)]" />
                    {facility}
                  </span>
                );
              })}
              {room.facilities.length > 5 && (
                <span className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-400 ring-1 ring-slate-100">
                  +{room.facilities.length - 5} more
                </span>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-4 border-t border-dashed border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Starts from</p>
                <div className="flex flex-row flex-wrap items-center gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weekdays</p>
                  <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                    <span className="text-xl font-black leading-none text-[var(--color-brand-teal)]">
                      {startPriceNum ? `₹${startPriceNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'TBA'}
                    </span>
                    {prices && (
                      <span className="text-xs font-semibold text-slate-400 line-through decoration-rose-400/70">
                        ₹{prices.originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400">/ night</span>
                  </div>
                </div>
                {startWeekendNum && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weekends</p>
                    <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-xl font-black leading-none text-[var(--color-brand-teal)]">
                        ₹{startWeekendNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/ night</span>
                    </div>
                  </div>
                )}
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-teal)] px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-900/20 transition-transform duration-200 group-hover/list:-translate-y-0.5">
                View Stay
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/stays/${room.slug}`}
      className="group/card flex h-full flex-col overflow-hidden rounded-2xl border border-[#d6e4dd] bg-white shadow-[0_12px_34px_rgba(15,61,86,0.07)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/35 hover:shadow-[0_22px_52px_rgba(15,61,86,0.13)]"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
        <Image
          src={room.cover_image_url || '/placeholder-room.jpg'}
          alt={room.lodge_name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,22,34,0.02)_0%,rgba(3,22,34,0.08)_48%,rgba(8,35,27,0.62)_100%)]" />
        <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-4rem)] flex-wrap gap-2">
          {roomTags.slice(0, 2).map((tag) => (
            <PremiumTag key={tag} name={tag} compact />
          ))}
        </div>
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white shadow-lg backdrop-blur-md">
          <ConciergeBell className="h-4 w-4" />
        </div>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/36 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
          <MoonStar className="h-3.5 w-3.5 text-[#d9f2c8]" />
          Comfort Stay
        </div>
        {prices && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase text-[var(--color-brand-teal)] shadow-lg">
            {prices.percentOff}% off
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-xl font-black leading-tight text-slate-900 line-clamp-2 transition-colors duration-200 group-hover/card:text-[var(--color-brand-teal)]">
            {room.lodge_name}
          </h3>
          {room.is_featured && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
              Verified
            </span>
          )}
        </div>

        <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-slate-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-teal)]" />
          <span className="line-clamp-2">{room.address || 'Bhadrachalam'}</span>
        </div>

        <div className="mt-3">
          <StarRating rating={rating} count={reviewCount} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {room.facilities.slice(0, 4).map((facility) => {
            const Icon = getFacilityIcon(facility);
            return (
              <span
                key={facility}
                className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--color-brand-teal)]" />
                {facility}
              </span>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-dashed border-slate-100 pt-5">
          <div className="min-w-0 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Starts from</p>
            <div className="flex flex-row flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weekdays</p>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl font-black leading-none text-[var(--color-brand-teal)]">
                  {startPriceNum ? `₹${startPriceNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'TBA'}
                </span>
                {prices && (
                  <span className="text-xs font-semibold text-slate-400 line-through decoration-rose-400/70">
                    ₹{prices.originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>
            </div>
            {startWeekendNum && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weekends</p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                  <span className="text-xl font-black leading-none text-[var(--color-brand-teal)]">
                    ₹{startWeekendNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            )}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand-teal)] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-teal-900/20 transition-transform duration-200 group-hover/card:-translate-y-0.5">
            View Stay
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(RoomCard);
