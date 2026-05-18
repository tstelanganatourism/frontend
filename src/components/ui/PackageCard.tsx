import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock, MapPin, Route, Ship, Sparkles, Compass } from 'lucide-react';

// Helper to determine active tags in layout
export function getCleanTags(tags: string[] = [], isFeatured = false): string[] {
  const list = [...tags];
  if (isFeatured && !list.includes('Featured')) list.unshift('Featured');
  return list.slice(0, 3);
}

interface PackageProps {
  pkg: {
    id: number;
    slug: string;
    title: string;
    type: string;
    region: string;
    cover_image_url: string | null;
    is_featured: boolean;
    tags: string[];
    starting_price: number | null;
    variants?: Array<{
      id: number;
      title: string;
      adult_price: number;
      child_price: number;
      transport_info?: string | null;
      is_active: boolean;
    }>;
  };
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

function getBoardingLocation(title: string, slug: string, tags: string[] = []) {
  const text = `${title} ${slug} ${tags.join(' ')}`.toLowerCase();
  if (text.includes('rajahmundry') || text.includes('rjy')) return 'Rajahmundry';
  if (text.includes('bhadrachalam') || text.includes('bdl')) return 'Bhadrachalam';
  return 'Bhadrachalam Office';
}

function getTransportType(variants: any[] = [], title: string) {
  const activeVariants = variants.filter(v => v.is_active);
  if (activeVariants.length > 0) {
    const transports = activeVariants
      .map(v => v.transport_info || '')
      .filter(t => t.trim().length > 0);
    if (transports.length > 0) {
      // Return the most unique short transport label
      const t = transports[0].toLowerCase();
      if (t.includes('non-ac') || t.includes('non ac')) return 'Non-A/C Transport';
      if (t.includes('ac') || t.includes('a/c')) return 'A/C Luxury Transport';
      return transports[0];
    }
  }
  const lowTitle = title.toLowerCase();
  if (lowTitle.includes('non-ac') || lowTitle.includes('non ac')) return 'Non-A/C Sharing';
  if (lowTitle.includes('ac ') || lowTitle.includes(' ac') || lowTitle.includes('a/c')) return 'A/C Luxury Bus';
  return 'Boat Only / Self-Transport';
}

function getDisplayPrice(pkg: PackageProps['pkg']) {
  const startingPrice = Number(pkg.starting_price || 0);
  if (startingPrice > 0) return startingPrice;

  const activeVariantPrices = (pkg.variants || [])
    .filter((variant) => variant.is_active && Number(variant.adult_price) > 0)
    .map((variant) => Number(variant.adult_price));

  if (activeVariantPrices.length > 0) return Math.min(...activeVariantPrices);
  return null;
}

function PackageCard({ pkg }: PackageProps) {
  const isTrip = pkg.type?.toUpperCase() === 'TRIP';
  
  // Clean tags
  const visibleTags = getCleanTags(pkg.tags, pkg.is_featured);

  // Dynamic Content Deduction
  const duration = getDurationLabel(pkg.title, pkg.slug);
  const boarding = getBoardingLocation(pkg.title, pkg.slug, pkg.tags);
  const transport = getTransportType(pkg.variants || [], pkg.title);
  const displayPrice = getDisplayPrice(pkg);
  
  const activeVariants = pkg.variants || [];
  const hasMultipleVariants = activeVariants.length > 1;

  const adultPrices = activeVariants.map(v => Number(v.adult_price)).filter(p => p > 0);
  const childPrices = activeVariants.map(v => Number(v.child_price)).filter(p => p > 0);

  const adultPrice = adultPrices.length > 0 ? Math.min(...adultPrices) : (pkg.starting_price ? Number(pkg.starting_price) : 0);
  const childPrice = childPrices.length > 0 ? Math.min(...childPrices) : null;
  
  // Experience type designation
  const isStayPkg = pkg.title.toLowerCase().includes('stay') || pkg.title.toLowerCase().includes('bamboo') || pkg.title.toLowerCase().includes('hut');
  const experienceType = isStayPkg 
    ? 'River Cruise + Stay' 
    : isTrip 
    ? 'Sightseeing Journey' 
    : 'Godavari Boat Ride';

  const IdentityIcon = isStayPkg ? Route : isTrip ? Compass : Ship;
  
  return (
    <Link 
      href={`/packages/${pkg.slug}`}
      className={`group/card relative block overflow-hidden rounded-2xl border bg-white shadow-[0_12px_32px_rgba(15,61,86,0.06)] outline outline-1 outline-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,61,86,0.12)] ${
        isTrip ? 'border-[#ead8af]' : 'border-[#cde5ea]'
      }`}
    >
      {/* Background glow hover animation */}
      <div className={`pointer-events-none absolute inset-x-10 -bottom-8 hidden h-24 rounded-full blur-2xl transition-opacity duration-300 sm:block opacity-0 group-hover/card:opacity-100 ${
        isTrip ? 'bg-[#f4d58d]/25' : 'bg-[#58c4d7]/20'
      }`} />

      {/* Image Gallery Cover */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100 sm:h-64">
        <Image 
          src={pkg.cover_image_url || '/placeholder-tourism.jpg'} 
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,22,34,0.02)_0%,rgba(3,22,34,0.15)_40%,rgba(3,22,34,0.85)_100%)]" />
        
        {/* Top Badges */}
        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
          <div className="flex max-w-[75%] flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <span 
                key={tag} 
                className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                  tag.toLowerCase() === 'featured'
                    ? 'bg-[#d97706] text-white border border-[#f59e0b]/30'
                    : 'bg-white/90 text-[var(--color-brand-river)] border border-white/50'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="rounded-full border border-white/30 bg-black/25 p-2 text-white shadow-lg backdrop-blur-md">
            <IdentityIcon className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Seat / Availability Badge */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Daily Departures
        </div>
      </div>

      {/* Card Body */}
      <div className="relative p-5 sm:p-6">
        {/* Experience & Transport Metadata Headers */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
            isTrip ? 'bg-[#fff7df] text-[#855e11]' : 'bg-[#eaf8fb] text-[#0b5c6d]'
          }`}>
            <Sparkles className="h-3 w-3 shrink-0" />
            {experienceType}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
            {transport}
          </span>
        </div>
        
        {/* Package Title */}
        <h3 className="mb-4 min-h-[3rem] text-[1.2rem] font-black leading-[1.12] text-[var(--color-brand-river)] line-clamp-2 sm:text-[1.3rem] group-hover/card:text-[var(--color-brand-teal)] transition-colors">
          {pkg.title}
        </h3>

        {/* Dynamic Context Fields Grid */}
        <div className="mb-5 grid grid-cols-2 gap-y-3 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--color-brand-teal)]" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--color-brand-teal)]" />
            <span className="truncate">{boarding}</span>
          </div>
        </div>

        {/* Price & Action Footer Block */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,250,249,0.85))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.02)]">
          <div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
              {hasMultipleVariants ? 'Starting From' : 'Fare Plan'}
            </p>
            <div className="flex items-center gap-5">
              <div>
                <span className="mr-1 text-[10px] font-extrabold uppercase text-slate-400">Adult</span>
                <span className="text-xl font-black leading-none text-[var(--color-brand-teal)]">
                  {adultPrice ? `₹${adultPrice.toLocaleString('en-IN')}` : 'updating'}
                </span>
              </div>
              {childPrice !== null && childPrice > 0 && (
                <div className="border-l border-slate-200 pl-5">
                  <span className="mr-1 text-[10px] font-extrabold uppercase text-slate-400">Child</span>
                  <span className="text-xl font-black leading-none text-[#d97706]">
                    {`₹${childPrice.toLocaleString('en-IN')}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover/card:translate-x-1 ${
            isTrip ? 'bg-[#b98928] group-hover/card:bg-[#a67a20]' : 'bg-[var(--color-brand-teal)] group-hover/card:bg-[#125866]'
          }`}>
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(PackageCard);
