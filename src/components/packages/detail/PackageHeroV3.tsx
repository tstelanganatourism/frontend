'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getHdImageUrl } from '@/lib/utils';
import { useLightbox } from '@/hooks/useLightbox';
import { ExperienceVideoPlayer } from '@/components/ui/ExperienceVideoPlayer';
import {
  BadgeCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  MapPin,
  Route,
  ShieldCheck,
  Ship,
  Sparkles,
  Film,
} from 'lucide-react';

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text?: string | null;
  is_cover: boolean;
}

interface PackageHeroV3Props {
  title: string;
  coverImage?: string | null;
  region?: string | null;
  type?: string;
  tags?: string[];
  durationLabel?: string;
  boardingPoint?: string | null;
  description?: string | null;
  startingPrice?: number | string | null;
  variantCount?: number;
  gallery: GalleryImage[];
  videoUrl?: string | null;
}

const fallbackImage = 'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg';

const formatPrice = (value?: number | string | null) => {
  const numeric = Number(value || 0);
  if (!numeric) return null;
  return numeric.toLocaleString('en-IN');
};

export const PackageHeroV3 = ({
  title,
  coverImage,
  region,
  type,
  tags = [],
  durationLabel,
  boardingPoint,
  description,
  startingPrice,
  variantCount = 0,
  gallery = [],
  videoUrl,
}: PackageHeroV3Props) => {
  const slides = useMemo(() => {
    const list = [...gallery];
    if (coverImage && !list.some((img) => img.image_url === coverImage)) {
      list.unshift({ id: -99, image_url: coverImage, alt_text: title, is_cover: true });
    }
    return list.length > 0
      ? list
      : [{ id: -1, image_url: fallbackImage, alt_text: title, is_cover: true }];
  }, [gallery, coverImage, title]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'photos'>(videoUrl ? 'video' : 'photos');

  const activeSlide = slides[activeIdx] || slides[0];
  const categoryLabel = type === 'TOUR' ? 'Boat Ride' : 'Sightseeing';
  const price = formatPrice(startingPrice);
  
  const stripHtml = (html: string | null | undefined) => {
    if (!html) return '';
    let clean = html.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|p)>/gi, ' ');
    clean = clean.replace(/<(br|hr)\s*\/?>/gi, ' ');
    clean = clean.replace(/<[^>]*>?/gm, '');
    return clean
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  };

  const plainDescription = stripHtml(description)?.replace(/\s+/g, ' ').trim();
  const intro =
    plainDescription ||
    'A verified boat and temple travel experience with clear timings, boarding details, inclusions, and fare options shown before booking.';

  const moveSlide = (direction: 'left' | 'right') => {
    setActiveIdx((prev) => {
      if (direction === 'left') return (prev - 1 + slides.length) % slides.length;
      return (prev + 1) % slides.length;
    });
  };

  const { handlers: lightboxHandlers } = useLightbox({
    isOpen: lightboxOpen,
    onClose: () => setLightboxOpen(false),
    onNext: () => moveSlide('right'),
    onPrev: () => moveSlide('left'),
  });

  return (
    <section className="relative overflow-hidden bg-[#fafaf7] border-b border-slate-200/60 pb-10">
      {/* Top Breadcrumb & Title Area */}
      <div className="relative mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-12">
        <div className="mb-4 flex min-w-0 items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0d6e75]/70">
          <Link href="/" className="transition hover:text-[#0d6e75]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href={type === 'TOUR' ? '/boat-rides' : '/sightseeing'} className="transition hover:text-[#0d6e75]">
            {type === 'TOUR' ? 'Boat Rides' : 'Sightseeing'}
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="truncate text-slate-600">{region || categoryLabel}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* Left Text Column */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0d6e75]">
                <ShieldCheck className="h-3 w-3" />
                Verified Pilgrim Partner
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                <Sparkles className="h-3 w-3" />
                Divine Experience
              </span>
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl break-words">
              {title.replace(/\s*\(/g, ' (')}
            </h1>

            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              {intro}
            </p>

            {/* Quick Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Clock className="mb-2.5 h-4.5 w-4.5 text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                <p className="mt-1 text-sm font-extrabold text-slate-950">{durationLabel || 'Flexible'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <MapPin className="mb-2.5 h-4.5 w-4.5 text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Boarding Point</p>
                <p className="mt-1 text-sm font-extrabold text-slate-950 truncate">{boardingPoint || region || 'Confirmed'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Ship className="mb-2.5 h-4.5 w-4.5 text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cruise Type</p>
                <p className="mt-1 text-sm font-extrabold text-slate-950">{categoryLabel}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <IndianRupee className="mb-2.5 h-4.5 w-4.5 text-[#0d6e75]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Starting price</p>
                <p className="mt-1 text-sm font-extrabold text-[#0d6e75]">{price ? `₹${price}` : 'Check fare'}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0d6e75] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b5c62] cursor-pointer"
              >
                Select Travel Date
              </button>
              <a
                href="#itinerary"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-700 shadow-xs transition hover:-translate-y-0.5 hover:bg-slate-50 cursor-pointer"
              >
                <Route className="h-4 w-4 text-[#0d6e75]" />
                View Journey Schedule
              </a>
            </div>
          </div>

          {/* Right Visual Image & Gallery Strips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
            {/* Visual Type Selector Tabs */}
            {videoUrl && (
              <div className="mb-2.5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition ${
                    mediaType === 'video'
                      ? 'bg-[#0d6e75] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  Tour Video
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('photos')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition ${
                    mediaType === 'photos'
                      ? 'bg-[#0d6e75] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Photos ({slides.length})
                </button>
              </div>
            )}

            {mediaType === 'video' && videoUrl ? (
              <div className="overflow-hidden rounded-xl">
                <ExperienceVideoPlayer videoUrl={videoUrl} label={title} />
              </div>
            ) : (
              <>
                <div 
                  className="relative overflow-hidden rounded-xl bg-slate-950"
                  {...lightboxHandlers}
                >
                  <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:min-h-[380px]">
                    <div className="absolute inset-0 bg-slate-900/10" />
                    <Image
                      src={activeSlide.image_url}
                      alt={activeSlide.alt_text || title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 640px"
                    />
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="absolute inset-0 z-10 cursor-zoom-in"
                      aria-label="Open photo gallery"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                        <Camera className="h-3.5 w-3.5" />
                        {slides.length} Photos
                      </span>
                      {variantCount > 0 ? (
                        <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white ring-1 ring-white/10">
                          {variantCount} Packages
                        </span>
                      ) : null}
                    </div>
                    {slides.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSlide('left');
                          }}
                          className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md transition hover:scale-105"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSlide('right');
                          }}
                          className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md transition hover:scale-105"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {slides.length > 1 ? (
                  <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {slides.slice(0, 5).map((slide, idx) => (
                      <button
                        key={slide.id || idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition ${
                          idx === activeIdx
                            ? 'border-[#0d6e75] ring-2 ring-[#0d6e75]/20'
                            : 'border-slate-200 opacity-80 hover:opacity-100'
                        }`}
                        aria-label={`Show photo ${idx + 1}`}
                      >
                        <Image src={slide.image_url || fallbackImage} alt={slide.alt_text || `Photo ${idx + 1}`} fill sizes="120px" className="object-cover" />
                        {idx === 4 && slides.length > 5 ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-xs font-black text-white">
                            +{slides.length - 5}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-teal-500/5 px-3 py-2 text-[11px] font-bold text-[#0d6e75]">
                    <BadgeCheck className="h-4 w-4 text-[#0d6e75]" />
                    More photos will be shared before travel.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xs">
          <div className="flex items-center justify-between p-4">
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
              {activeIdx + 1} of {slides.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div 
            className="relative flex flex-1 items-center justify-center p-4"
            {...lightboxHandlers}
          >
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveSlide('left');
                }}
                className="absolute left-4 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <div className="relative h-full w-full max-w-5xl">
              <Image src={getHdImageUrl(activeSlide.image_url)} alt={activeSlide.alt_text || title} fill sizes="100vw" className="object-contain" quality={85} />
            </div>
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveSlide('right');
                }}
                className="absolute right-4 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
          {slides.length > 1 && (
            <div className="flex justify-start gap-2 overflow-x-auto p-4 pb-6 md:justify-center">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition-all ${
                    idx === activeIdx ? 'scale-105 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Open photo ${idx + 1}`}
                >
                  <Image src={slide.image_url} alt={slide.alt_text || `Photo ${idx + 1}`} fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
