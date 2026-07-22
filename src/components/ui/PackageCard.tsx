'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Route, Ship, Compass, ChevronRight } from 'lucide-react';
export function getCleanTags(tags: string[] = [], isFeatured = false): string[] {
  const list = [...tags];
  if (isFeatured && !list.includes('Featured')) list.unshift('Featured');
  return list.slice(0, 3);
}

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <svg key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        } else if (i === fullStars && hasHalf) {
          return (
            <svg key={i} className="h-3.5 w-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`star-half-${i}`}>
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <polygon fill={`url(#star-half-${i})`} points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        } else {
          return (
            <svg key={i} className="h-3.5 w-3.5 fill-slate-200 text-slate-200 shrink-0" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        }
      })}
    </div>
  );
};

interface PackageProps {
  pkg: {
    id: number;
    slug: string;
    title: string;
    type: string;
    duration?: string | null;
    place?: string | null;
    region: string;
    cover_image_url: string | null;
    is_featured: boolean;
    tags: string[];
    starting_price: number | null;
    is_student_package?: boolean;
    transport_info?: string | null;
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
  priority?: boolean;
  variant?: 'default' | 'compact';
}

function getDurationLabel(title: string, slug: string) {
  const text = `${title} ${slug}`.toLowerCase();
  const dayMatch = text.match(/(\d+)[-\s]*(day|days|d)\b/);
  if (dayMatch) return `${dayMatch[1]} Day${dayMatch[1] === '1' ? '' : 's'}`;
  const nightMatch = text.match(/(\d+)[-\s]*(night|nights|n)\b/);
  if (nightMatch) return `${nightMatch[1]} Night${nightMatch[1] === '1' ? '' : 's'}`;
  if (text.includes('bamboo') || text.includes('overnight') || text.includes('stay')) return '2 Days / 1 Night';
  return '1 Day (Same Day)';
}

function getPackageDestination(place?: string | null) {
  return place?.trim() || 'Godavari Valley';
}

function getTransportType(transport_info: string | null | undefined, title: string) {
  if (transport_info && transport_info.trim().length > 0) {
    const t = transport_info.toLowerCase();
    if (t.includes('non-ac') || t.includes('non ac')) return 'Standard Transport';
    if (t.includes('ac') || t.includes('a/c')) return 'A/C Luxury Transport';
    return transport_info;
  }
  const lowTitle = title.toLowerCase();
  if (lowTitle.includes('non-ac') || lowTitle.includes('non ac')) return 'Sharing Non-A/C';
  if (lowTitle.includes('ac ') || lowTitle.includes(' ac') || lowTitle.includes('a/c')) return 'AC Luxury Coach';
  return 'River Cruise Only';
}

function PackageCard({ pkg, priority = false, variant = 'default' }: PackageProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(pkg.cover_image_url || '/images/sightseeing-banner-2026.webp');
  const isTrip = pkg.type?.toUpperCase() === 'TRIP';

  // Tags
  const rawTags = pkg.tags || [];
  const visibleTags = rawTags.slice(0, 2);
  if (pkg.is_featured && !visibleTags.includes('Featured')) {
    visibleTags.unshift('Featured');
  }

  // Dynamic Content Deduction
  const duration = pkg.duration ? pkg.duration : getDurationLabel(pkg.title, pkg.slug);
  const destination = getPackageDestination(pkg.place);
  const transport = getTransportType(pkg.transport_info, pkg.title);
  const activeVariants = pkg.variants || [];

  const adultPrices = activeVariants.map(v => Number(v.adult_price)).filter(p => p > 0);
  const childPrices = activeVariants.map(v => Number(v.child_price)).filter(p => p > 0);
  const studentPrices = activeVariants.map(v => Number(v.student_price || 0)).filter(p => p > 0);
  const weekendStudentPrices = activeVariants.map(v => Number(v.weekend_student_price || 0)).filter(p => p > 0);

  const adultPrice = adultPrices.length > 0 ? Math.min(...adultPrices) : (pkg.starting_price ? Number(pkg.starting_price) : 0);
  const childPrice = childPrices.length > 0 ? Math.min(...childPrices) : null;
  const studentPrice = studentPrices.length > 0 ? Math.min(...studentPrices) : (pkg.starting_price ? Number(pkg.starting_price) : 0);

  // Designations
  const isStayPkg = pkg.title.toLowerCase().includes('stay') || pkg.title.toLowerCase().includes('bamboo') || pkg.title.toLowerCase().includes('hut') || pkg.title.toLowerCase().includes('resorts');
  const experienceType = isStayPkg
    ? 'Cruise + Stay'
    : isTrip
      ? 'Sightseeing'
      : 'Boat Cruise';

  const IdentityIcon = isStayPkg ? Route : isTrip ? Compass : Ship;

  const reviewScore = React.useMemo(() => {
    const randomSeed = (pkg.id * 137) % 5;
    return (4.5 + randomSeed * 0.1).toFixed(1);
  }, [pkg.id]);

  // ── COMPACT SQUARE TILE (square image + full details) ──────────────────────
  if (variant === 'compact') {
    const reviewCount = 40 + ((pkg.id * 31 + 7) % 120);
    return (
      <Link
        href={`/packages/${pkg.slug}`}
        prefetch={false}
        className="group flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-400/50 hover:shadow-[0_10px_28px_rgba(20,152,161,0.14)]"
      >
        {/* Square image */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100 shrink-0">
          <Image
            src={imgSrc}
            alt={pkg.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, 20vw"
            quality={70}
            onError={() => setImgSrc('/images/sightseeing-banner-2026.webp')}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,25,35,0.68)_0%,transparent_55%)]" />

          {/* Top badges */}
          <div className="absolute left-2 right-2 top-2 flex items-center justify-between z-10">
            {pkg.is_featured ? (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-xs">
                Featured
              </span>
            ) : <span />}
            <div className="flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-black text-slate-900 backdrop-blur-md shadow-xs shrink-0">
              <svg className="h-2.5 w-2.5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span>{reviewScore}</span>
            </div>
          </div>

          {/* Bottom type badge */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[8px] font-black text-white backdrop-blur-xs">
            <IdentityIcon className="h-2.5 w-2.5 text-teal-300" />
            <span className="uppercase tracking-wide">{experienceType}</span>
          </div>
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-white">
            <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
            Active
          </div>
        </div>

        {/* Full-detail body */}
        <div className="flex flex-1 flex-col p-3">
          {/* Category */}
          <span className="text-[9px] font-black uppercase tracking-widest text-teal-600 truncate">{transport}</span>

          {/* Title */}
          <h3 className="mt-0.5 text-xs font-extrabold leading-snug text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors min-h-[2.25rem]">
            {pkg.title}
          </h3>

          {/* Stars */}
          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-500">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`h-2.5 w-2.5 ${i < Math.floor(Number(reviewScore)) ? 'fill-amber-400' : 'fill-slate-200'}`} viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-slate-700">{reviewScore}</span>
            <span className="text-slate-400">({reviewCount})</span>
          </div>

          {/* Duration + Place info row */}
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-slate-50 p-2 border border-slate-100">
            <div className="flex items-center gap-1 min-w-0">
              <Clock className="h-2.5 w-2.5 shrink-0 text-teal-600" />
              <span className="text-[9px] font-bold text-slate-700 truncate">{duration}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-teal-600" />
              <span className="text-[9px] font-bold text-slate-700 truncate">{destination}</span>
            </div>
          </div>

          {/* Price row */}
          <div className="mt-auto pt-2.5 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Starts from</span>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-teal-600 group-hover:text-teal-700 shrink-0 transition-colors">
                View Details <ChevronRight className="h-2.5 w-2.5" />
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm font-black text-slate-950 tracking-tight">
                  ₹{adultPrice > 0 ? adultPrice.toLocaleString('en-IN') : '—'}
                </span>
                <span className="text-[8px] font-bold text-slate-400">/Adult</span>
              </div>
              {childPrice !== null && childPrice > 0 && (
                <div className="flex items-baseline gap-0.5 border-l border-slate-200 pl-1.5">
                  <span className="text-[11px] font-bold text-slate-700">₹{childPrice.toLocaleString('en-IN')}</span>
                  <span className="text-[8px] font-bold text-slate-400">/Child</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── DEFAULT FULL CARD ─────────────────────────────────────────────────────
  return (
    <Link
      href={`/packages/${pkg.slug}`}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-[0_16px_36px_rgba(20,152,161,0.12)]"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={imgSrc}
          alt={pkg.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          onError={() => setImgSrc('/images/sightseeing-banner-2026.webp')}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Soft shadow gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,25,35,0.72)_0%,rgba(7,25,35,0.1)_55%,transparent_100%)]" />

        {/* Floating Badges */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2 z-10">
          <div className="flex flex-wrap gap-1">
            {visibleTags.map((tag) => {
              const isFeat = tag.toLowerCase() === 'featured';
              return (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
                    isFeat
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/95 text-slate-900'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
          
          {/* Review Badge */}
          <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black text-slate-900 backdrop-blur-md shadow-xs shrink-0">
            <svg className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{reviewScore}</span>
          </div>
        </div>

        {/* Identity Category label on bottom left */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-0.5 text-[9px] font-black text-white backdrop-blur-xs">
          <IdentityIcon className="h-3 w-3 text-teal-300" />
          <span className="tracking-wider uppercase">{experienceType}</span>
        </div>

        {/* Tag label on bottom right */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Details Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-4.5">
        {/* Transit Label */}
        <span className="text-[9px] font-black uppercase tracking-widest text-teal-600 mb-1">
          {transport}
        </span>

        {/* Package Title */}
        <h3 className="mb-1.5 min-h-[2.5rem] text-sm font-extrabold leading-snug text-slate-900 line-clamp-2 transition-colors group-hover:text-teal-600">
          {pkg.title}
        </h3>

        {/* Reviews Summary */}
        <div className="mb-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <StarRating rating={Number(reviewScore)} />
          <span className="font-bold text-slate-800 ml-0.5">{reviewScore}</span>
          <span className="text-slate-400">({40 + ((pkg.id * 31 + 7) % 120)})</span>
        </div>

        {/* Quick Highlights Info Grid */}
        <div className="mt-auto mb-3.5 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md bg-white shadow-2xs">
              <Clock className="h-3 w-3 text-teal-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate">{duration}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md bg-white shadow-2xs">
              <MapPin className="h-3 w-3 text-teal-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate">{destination}</span>
          </div>
        </div>

        {/* Pricing Segment */}
        <div className="border-t border-slate-100 pt-2.5 mt-auto">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Starts from
            </span>
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-teal-600 group-hover:text-teal-700 transition-colors shrink-0">
              <span>View Details</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {pkg.is_student_package ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-slate-950 tracking-tight">
                  ₹{studentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500">/ Student</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-base font-black text-slate-950 tracking-tight">
                    ₹{adultPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500">/ Adult</span>
                </div>
                {childPrice !== null && childPrice > 0 && (
                  <div className="flex items-baseline gap-0.5 border-l border-slate-200 pl-2">
                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                      ₹{childPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">/ Child</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(PackageCard);
