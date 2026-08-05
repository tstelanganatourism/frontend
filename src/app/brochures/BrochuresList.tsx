'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { downloadFileViaFetch } from '@/lib/downloadUtils';
import {
  ArrowUpRight,
  Clock,
  FileDown,
  MapPin,
  Search,
  Ship,
  Sparkles,
} from 'lucide-react';

export type BrochurePackage = {
  id: number;
  slug: string;
  title: string;
  type: string;
  duration?: string | null;
  place?: string | null;
  region?: string | null;
  brochure_pdf_url?: string | null;
  generated_brochure_url?: string | null;
  cover_image_url?: string | null;
  is_featured: boolean;
  tags: string[];
  starting_price?: number | string | null;
  variants?: Array<{
    id: number;
    title: string;
    adult_price: number | string;
    child_price: number | string;
    transport_info?: string | null;
  }>;
};

type PackageData = {
  items: BrochurePackage[];
  total: number;
};

const filters = [
  { label: 'All', value: 'ALL' },
  { label: 'Boat Rides', value: 'TOUR' },
  { label: 'Sightseeing', value: 'TRIP' },
];

const heroImages = [
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/v1785917157/ts_boat_tourism/images/evafz4lgjowhjztykdvz.webp',
    alt: 'Official TS Boat Tourism Banner',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
    alt: 'Papikondalu river view',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    alt: 'Kolluru bamboo huts',
  },
];

function getActiveBrochureUrl(pkg: BrochurePackage) {
  return pkg.generated_brochure_url || pkg.brochure_pdf_url || '';
}

function formatPrice(value?: number | string | null) {
  const price = Number(value || 0);
  return price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Fare updating';
}

function getLowestPrice(pkg: BrochurePackage) {
  const prices = (pkg.variants || [])
    .map((variant) => Number(variant.adult_price || 0))
    .filter((price) => price > 0);

  if (prices.length) return Math.min(...prices);
  return Number(pkg.starting_price || 0) || null;
}

function getPlace(pkg: BrochurePackage) {
  return pkg.place?.trim() || 'Destination updating';
}

function getDuration(pkg: BrochurePackage) {
  if (pkg.duration) return pkg.duration;
  const text = `${pkg.title} ${pkg.slug}`.toLowerCase();
  const dayMatch = text.match(/(\d+)[-\s]*(day|days|d)\b/);
  if (dayMatch) return `${dayMatch[1]} Day${dayMatch[1] === '1' ? '' : 's'}`;
  if (text.includes('stay') || text.includes('bamboo') || text.includes('overnight')) return '2 Days / 1 Night';
  return '1 Day';
}

function BrochureCard({ pkg, index }: { pkg: BrochurePackage; index: number }) {
  const brochureUrl = getActiveBrochureUrl(pkg);
  const price = getLowestPrice(pkg);
  const category = pkg.type === 'TRIP' ? 'Sightseeing Package' : 'Boat Ride Package';
  const [isDownloading, setIsDownloading] = React.useState(false);

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,61,86,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#1a6b7a]/40 hover:shadow-[0_18px_44px_rgba(15,61,86,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={pkg.cover_image_url || 'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg'}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          priority={index < 3}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,32,47,0.05),rgba(7,32,47,0.78))]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {pkg.is_featured ? (
            <span className="rounded-full bg-[#b45309] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              Featured
            </span>
          ) : null}
          <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0f3d56] shadow-sm">
            PDF Ready
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
            {category}
          </p>
          <h2 className="line-clamp-2 text-xl font-black leading-tight tracking-normal text-white">
            {pkg.title}
          </h2>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex min-w-0 items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
            <Clock className="h-4 w-4 shrink-0 text-[#1a6b7a]" />
            <span className="truncate font-bold text-slate-700">{getDuration(pkg)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#b45309]" />
            <span className="truncate font-bold text-slate-700">{getPlace(pkg)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Starts From</p>
            <p className="mt-1 text-2xl font-black tracking-normal text-[#0b5c6d]">
              {formatPrice(price)}
            </p>
          </div>
          <Link
            href={`/packages/${pkg.slug}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#0f3d56] transition hover:border-[#1a6b7a] hover:bg-slate-50"
            aria-label={`View ${pkg.title}`}
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              window.open(`/print/package/${pkg.slug}`, '_blank');
            }}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#1a6b7a] px-4 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#13505c] cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            View &amp; Print Brochure
          </button>
          {brochureUrl && (
            <a
              href={`/api/download?url=${encodeURIComponent(brochureUrl)}&filename=${encodeURIComponent(`${pkg.slug}-brochure.pdf`)}`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              title="Download PDF"
            >
              PDF
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function BrochuresList({ data }: { data?: PackageData }) {
  const [query, setQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('ALL');

  const brochurePackages = React.useMemo(() => {
    return (data?.items || []).filter((pkg) => Boolean(getActiveBrochureUrl(pkg)));
  }, [data?.items]);

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return brochurePackages.filter((pkg) => {
      const matchesFilter = activeFilter === 'ALL' || pkg.type === activeFilter;
      const searchable = `${pkg.title} ${pkg.slug} ${pkg.place || ''} ${pkg.tags?.join(' ') || ''}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeFilter, brochurePackages, query]);

  return (
    <div className="bg-[#f6f3ec]">
      {/* Unique State-of-the-Art Hero Canvas */}
      <section className="relative overflow-hidden bg-slate-950 pb-16 pt-24 sm:pb-20 sm:pt-32">
        {/* Ambient Glow Effects */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        
        {/* Rich Photography Background Image */}
        <Image
          src="https://res.cloudinary.com/r929tquv/image/upload/v1785917164/ts_boat_tourism/images/gd4pulduucghrnfzel5z.jpg"
          alt="Papikondalu river hills"
          fill
          sizes="100vw"
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-indigo-950/40" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Official Package PDFs & Guides
              </div>

              <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                <span className="block text-cyan-400 font-extrabold text-xl sm:text-2xl uppercase tracking-widest mb-1.5">Offline Tour Schedules</span>
                <span className="block text-white drop-shadow-sm">Tour Brochures</span>
              </h1>

              <p className="mb-6 max-w-2xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                Download verified package PDFs with itinerary details, fare variants, reporting points, meal timings, inclusions, and rules in one place.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-300">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                  📄 Full Itinerary PDF
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                  📍 Boarding Instructions
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                  🍱 Meal Timings Included
                </span>
              </div>
            </div>

            {/* Right Card Panel */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/20">
                    <Image
                      src={heroImages[1].src}
                      alt={heroImages[1].alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white mb-1">High-Res Offline Guides</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Download complete printable brochures directly to your device for offline trip reference.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search brochures..."
              className="h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-bold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1a6b7a] focus:ring-4 focus:ring-[#1a6b7a]/10"
            />
          </div>

          <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`h-10 flex-1 rounded-md px-4 text-xs font-black uppercase tracking-wider transition sm:flex-none ${
                    isActive
                      ? 'bg-[#0f3d56] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#0f3d56]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1a6b7a]">
              {filteredItems.length} available
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-normal text-slate-950">
              Pick your package brochure
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Ship className="h-4 w-4 text-[#b45309]" />
            Verified boat tourism packages
          </div>
        </div>

        {!data ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-[#0f3d56]">Brochures are temporarily unavailable</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Please try again in a few minutes.</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((pkg, index) => (
              <BrochureCard key={pkg.id} pkg={pkg} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <FileDown className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-xl font-black text-[#0f3d56]">No matching brochures found</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Try a different package name or category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
