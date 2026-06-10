import React from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock, MapPin, Route, Ship, Sparkles, Compass, Star } from 'lucide-react';

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
    duration?: string | null;
    place?: string | null;
    region: string;
    cover_image_url: string | null;
    is_featured: boolean;
    tags: string[];
    starting_price: number | null;
    transport_info?: string | null;
    variants?: Array<{
      id: number;
      title: string;
      adult_price: number;
      child_price: number;
      transport_info?: string | null;
      is_active: boolean;
    }>;
  };
  priority?: boolean;
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
  return place?.trim() || 'Destination updating';
}

function getTransportType(
  transport_info: string | null | undefined,
  title: string
) {
  if (transport_info && transport_info.trim().length > 0) {
    const t = transport_info.toLowerCase();
    if (t.includes('non-ac') || t.includes('non ac')) return 'Non-A/C Transport';
    if (t.includes('ac') || t.includes('a/c')) return 'A/C Luxury Transport';
    return transport_info;
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

function PackageCard({ pkg, priority = false }: PackageProps) {
  const isTrip = pkg.type?.toUpperCase() === 'TRIP';

  // Clean tags
  const visibleTags = getCleanTags(pkg.tags, pkg.is_featured);

  // Dynamic Content Deduction
  const duration = pkg.duration ? pkg.duration : getDurationLabel(pkg.title, pkg.slug);
  const destination = getPackageDestination(pkg.place);
  const transport = getTransportType(pkg.transport_info, pkg.title);
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

  // Generate a pseudo-random review score between 4.5 and 4.9 based on the package ID
  const reviewScore = React.useMemo(() => {
    const randomSeed = (pkg.id * 137) % 5;
    return (4.5 + randomSeed * 0.1).toFixed(1);
  }, [pkg.id]);

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      prefetch={false}
      className="group/card relative flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(15,61,86,0.04)] outline outline-1 outline-slate-200/60 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(15,61,86,0.12)] hover:outline-[var(--color-brand-teal)]/30"
    >
      {/* Premium Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-[16/10]">
        <Image
          src={pkg.cover_image_url || '/placeholder-tourism.jpg'}
          alt={pkg.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={65}
          className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
        />
        
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,25,35,0.85)] via-[rgba(10,25,35,0.2)] to-[rgba(10,25,35,0.05)] opacity-90 transition-opacity duration-300 group-hover/card:opacity-100" />

        {/* Top Badges Area */}
        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
          <div className="flex max-w-[70%] flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${tag.toLowerCase() === 'featured'
                    ? 'bg-[#b45309] text-white shadow-md'
                    : 'bg-white/95 text-[var(--color-brand-river)] shadow-sm'
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Rating Pill */}
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-lg backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
            {reviewScore}
          </div>
        </div>

        {/* Image Footer Info (Overlaying the image) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
            <IdentityIcon className="h-3.5 w-3.5 text-white/90" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
              {experienceType}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/80 px-2.5 py-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="relative flex flex-1 flex-col p-5">
        <div className="mb-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#083e4a]">
            {transport}
          </span>
        </div>

        <h3 className="mb-2 min-h-[3.125rem] text-[1.25rem] font-black leading-tight text-[var(--color-brand-river)] line-clamp-2 transition-colors group-hover/card:text-[var(--color-brand-teal)]">
          {pkg.title}
        </h3>

        {/* Star Rating */}
        <div className="mb-4 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingVal = Number(reviewScore);
              const fullStars = Math.floor(ratingVal);
              const hasHalf = ratingVal % 1 >= 0.4;
              if (i < fullStars) {
                return <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />;
              }
              if (i === fullStars && hasHalf) {
                return (
                  <span key={i} className="relative h-3.5 w-3.5">
                    <Star className="absolute inset-0 h-3.5 w-3.5 text-slate-200" />
                    <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  </span>
                );
              }
              return <Star key={i} className="h-3.5 w-3.5 text-slate-200" />;
            })}
          </div>
          <span className="text-xs font-bold text-slate-700">{reviewScore}</span>
          <span className="text-[11px] text-slate-600">({40 + ((pkg.id * 31 + 7) % 160)} reviews)</span>
        </div>

        {/* Key Features Grid */}
        <div className="mt-auto mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#f8fafc] p-4 border border-slate-100/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Clock className="h-3.5 w-3.5 text-[var(--color-brand-teal)]" />
            </div>
            <span className="text-[13px] font-bold text-slate-600 line-clamp-1">{duration}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-teal)]" />
            </div>
            <span className="text-[13px] font-bold text-slate-600 line-clamp-1">{destination}</span>
          </div>
        </div>

        {/* Pricing & Action Footer */}
        <div className="mt-3 flex flex-col gap-3">
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
              Starts From
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  Adult Fare
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[1.35rem] font-black leading-none tracking-tight text-[#0b5c6d]">
                    {adultPrice ? `₹${adultPrice.toLocaleString('en-IN')}` : 'updating'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">/ adult</span>
                </div>
              </div>

              {childPrice !== null && childPrice > 0 && (
                <div className="text-right">
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                    Child Fare
                  </p>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[1.15rem] font-black leading-none tracking-tight text-[#b45309]">
                      ₹{childPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">/ child</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-md transition-all duration-300 group-hover/card:shadow-lg ${isTrip ? 'bg-[#8c6519] group-hover/card:bg-[#735314]' : 'bg-[var(--color-brand-teal)] group-hover/card:bg-[#125866]'
            }`}>
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(PackageCard);
