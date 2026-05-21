'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text?: string | null;
  is_cover: boolean;
}

interface PackageHeroV2Props {
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
}

const fallbackImage =
  'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg';

const formatPrice = (value?: number | string | null) => {
  const numeric = Number(value || 0);
  if (!numeric) return null;
  return numeric.toLocaleString('en-IN');
};

export const PackageHeroV2 = ({
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
}: PackageHeroV2Props) => {
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

  const activeSlide = slides[activeIdx] || slides[0];
  const categoryLabel = type === 'TOUR' ? 'Boat Ride' : 'Sightseeing';
  const price = formatPrice(startingPrice);
  const cleanDescription = description?.replace(/\s+/g, ' ').trim();
  const intro =
    cleanDescription ||
    'A verified travel experience with clear timings, boarding details, inclusions, and fare options shown before booking.';

  const moveSlide = (direction: 'left' | 'right') => {
    setActiveIdx((prev) => {
      if (direction === 'left') return (prev - 1 + slides.length) % slides.length;
      return (prev + 1) % slides.length;
    });
  };

  // Swipe support for mobile hand action
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      moveSlide('right');
    } else if (isRightSwipe) {
      moveSlide('left');
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#f6fbfa]">
      <div className="absolute inset-x-0 top-0 h-[78%] bg-[linear-gradient(135deg,#073044_0%,#0f6f7a_58%,#f5b85a_100%)] lg:h-[74%]" />
      <div className="absolute inset-x-0 top-0 h-[78%] bg-[radial-gradient(circle_at_16%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(3,24,35,0.05),rgba(3,24,35,0.7))] lg:h-[74%]" />

      <div className="relative mx-auto max-w-[1600px] px-4 pb-8 pt-5 sm:px-6 lg:px-12 lg:pb-12">
        <div className="mb-5 flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={type === 'TOUR' ? '/boat-rides' : '/sightseeing'} className="transition hover:text-white">
            {type === 'TOUR' ? 'Boat Rides' : 'Sightseeing'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-white">{region || categoryLabel}</span>
        </div>

        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="text-white">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                Verified operator
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                Premium experience
              </span>
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
              {intro.length > 210 ? `${intro.slice(0, 207)}...` : intro}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="min-h-[116px] rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10">
                <Clock className="mb-3 h-4 w-4 text-amber-200" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Duration</p>
                <p className="mt-2 text-sm font-black leading-5 text-white">{durationLabel || 'Flexible'}</p>
              </div>
              <div className="min-h-[116px] rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10">
                <MapPin className="mb-3 h-4 w-4 text-amber-200" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Boarding</p>
                <p className="mt-2 text-sm font-black leading-5 text-white">{boardingPoint || region || 'After booking'}</p>
              </div>
              <div className="min-h-[116px] rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10">
                <Ship className="mb-3 h-4 w-4 text-amber-200" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Type</p>
                <p className="mt-2 text-sm font-black leading-5 text-white">{categoryLabel}</p>
              </div>
              <div className="min-h-[116px] rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10">
                <IndianRupee className="mb-3 h-4 w-4 text-amber-200" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">Starts from</p>
                <p className="mt-2 text-sm font-black leading-5 text-white">{price ? `₹${price}` : 'Check fare'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#booking"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-black text-[#0f3d56] shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-amber-50"
              >
                Check dates & fares
              </a>
              <a
                href="#itinerary"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
              >
                <Route className="h-4 w-4" />
                View schedule
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-white/18 bg-white p-2 shadow-2xl shadow-slate-950/18">
            <div 
              className="relative overflow-hidden rounded-lg bg-slate-950"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative aspect-[4/3] min-h-[280px] sm:aspect-[16/10] lg:min-h-[470px]">
                <Image
                  src={activeSlide.image_url}
                  alt={activeSlide.alt_text || title}
                  fill
                  priority
                  className="scale-110 object-cover opacity-20 blur-xl"
                  sizes="(max-width: 1024px) 100vw, 720px"
                />
                <Image
                  src={activeSlide.image_url}
                  alt={activeSlide.alt_text || title}
                  fill
                  priority
                  className="object-contain transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 720px"
                />
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute inset-0 z-10"
                  aria-label="Open photo gallery"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent p-3 sm:p-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm">
                    <Camera className="h-3.5 w-3.5" />
                    {slides.length} Photo{slides.length === 1 ? '' : 's'}
                  </span>
                  {variantCount > 0 ? (
                    <span className="hidden rounded-full bg-slate-950/65 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/10 sm:inline-flex">
                      {variantCount} fare option{variantCount === 1 ? '' : 's'}
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
                      className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide('right');
                      }}
                      className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {slides.slice(0, 5).map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-md border transition ${
                      idx === activeIdx
                        ? 'border-[#1a6b7a] ring-2 ring-[#1a6b7a]/20'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                    aria-label={`Show photo ${idx + 1}`}
                  >
                    <Image src={slide.image_url} alt={slide.alt_text || `Photo ${idx + 1}`} fill sizes="120px" className="object-cover" />
                    {idx === 4 && slides.length > 5 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/65 text-xs font-black text-white">
                        +{slides.length - 5}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#f4faf9] px-3 py-2 text-xs font-bold text-[#0f3d56]">
                <BadgeCheck className="h-4 w-4 text-[#1a6b7a]" />
                More photos may be shared by the operator before travel.
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-white/70">
              {activeIdx + 1} of {slides.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div 
            className="relative flex flex-1 items-center justify-center p-2 md:p-8"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveSlide('left');
                }}
                className="absolute left-2 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:left-8"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            )}
            <div className="relative h-full w-full max-w-6xl">
              <Image src={activeSlide.image_url} alt={activeSlide.alt_text || title} fill sizes="100vw" className="object-contain" />
            </div>
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveSlide('right');
                }}
                className="absolute right-2 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-8"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            )}
          </div>
          {slides.length > 1 && (
            <div className="flex justify-start gap-2 overflow-x-auto p-4 pb-6 md:justify-center md:pb-8">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md transition-all ${
                    idx === activeIdx ? 'scale-105 ring-2 ring-white' : 'opacity-50 hover:opacity-100'
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
