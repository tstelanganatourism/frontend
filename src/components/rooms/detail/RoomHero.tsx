'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getHdImageUrl } from '@/lib/utils';
import { BedDouble, MapPin, ShieldCheck, Sparkles, ChevronRight, Camera, Star, ChevronLeft, BadgeCheck } from 'lucide-react';
import { useState, useMemo } from 'react';

interface RoomHeroProps {
  lodgeName: string;
  coverImage?: string | null;
  address?: string | null;
  isFeatured?: boolean;
  startingPrice?: number | string | null;
  totalRooms?: number;
  gallery?: Array<{ id: number; image_url: string; alt_text?: string | null; is_cover: boolean }>;
}

const fallbackImage = 'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg';

export const RoomHero = ({
  lodgeName,
  coverImage,
  address,
  isFeatured,
  startingPrice,
  totalRooms,
  gallery = [],
}: RoomHeroProps) => {
  const imageUrl = getHdImageUrl(coverImage || fallbackImage);
  const [imgError, setImgError] = useState(false);

  // Build full gallery array for slider
  const slides = useMemo(() => {
    const list = [...gallery];
    if (coverImage && !list.some((img) => img.image_url === coverImage)) {
      list.unshift({ id: -99, image_url: coverImage, alt_text: lodgeName, is_cover: true });
    }
    return list.length > 0
      ? list
      : [{ id: -1, image_url: fallbackImage, alt_text: lodgeName, is_cover: true }];
  }, [gallery, coverImage, lodgeName]);

  const [activeIdx, setActiveIdx] = useState(0);

  const moveSlide = (direction: 'left' | 'right') => {
    setActiveIdx((prev) => {
      if (direction === 'left') return (prev - 1 + slides.length) % slides.length;
      return (prev + 1) % slides.length;
    });
  };

  const activeSlide = slides[activeIdx] || slides[0];

  return (
    <section className="relative isolate overflow-hidden bg-[#071923]">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imgError ? fallbackImage : imageUrl}
          alt={lodgeName}
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
          onError={() => setImgError(true)}
        />
        {/* Directional gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#021c24]/96 via-[#06373f]/75 to-[#021c24]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021c24]/80 via-transparent to-transparent" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 mx-auto w-full max-w-[1800px] px-4 pb-10 pt-8 sm:pt-10 lg:pt-12 sm:px-6 lg:px-8 xl:px-12">

        {/* Breadcrumb */}
        <nav className="mb-7 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/45">
          <Link href="/" className="transition hover:text-white/80">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/stays" className="transition hover:text-white/80">Stays</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="max-w-[200px] truncate text-white/65">{lodgeName}</span>
        </nav>

        {/* Main hero grid */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-center">

          {/* ── Left: Text & Badges ── */}
          <div className="space-y-5">

            {/* Badges & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#35c6ca]/40 bg-[#1598a1]/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8eecee] backdrop-blur-sm">
                <ShieldCheck className="h-3 w-3" />
                Verified Partner Stay
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm">
                <Star className="h-3 w-3 fill-amber-300" />
                Premium Accommodation
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80 uppercase tracking-wider backdrop-blur-sm">
                Bhadrachalam Stay
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80 uppercase tracking-wider backdrop-blur-sm">
                River Cruise Route
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.2rem]">
              {lodgeName}
            </h1>

            {/* Address */}
            {address && (
              <p className="flex items-center gap-2 text-sm font-semibold text-white/65">
                <MapPin className="h-4 w-4 shrink-0 text-[#8eecee]" />
                {address}
              </p>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md sm:max-w-lg">
              <div className="bg-[#06333c]/75 px-4 py-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/45">Starting From</p>
                <p className="mt-1.5 text-xl font-black text-[#8eecee]">
                  {startingPrice ? `₹${Number(startingPrice).toLocaleString('en-IN')}` : '—'}
                </p>
                <p className="text-[9px] font-semibold text-white/35">per night</p>
              </div>
              <div className="bg-[#06333c]/75 px-4 py-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/45">Rooms</p>
                <p className="mt-1.5 text-xl font-black text-white">{totalRooms ?? '—'}</p>
                <p className="text-[9px] font-semibold text-white/35">{totalRooms ? 'available' : 'on request'}</p>
              </div>
              <div className="bg-[#06333c]/75 px-4 py-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/45">Type</p>
                <p className="mt-1.5 text-xl font-black text-white">Stay</p>
                <p className="text-[9px] font-semibold text-white/35">accommodation</p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 130;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
                className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#1598a1] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(21,152,161,0.30)] transition-all hover:-translate-y-0.5 hover:bg-[#117f87] hover:shadow-[0_22px_50px_rgba(21,152,161,0.40)] active:scale-95"
              >
                <BedDouble className="h-4 w-4" />
                Choose Room &amp; Book
              </button>
            </div>
          </div>

          {/* ── Right: Expanded Visual Image Card & Gallery Slider (Matching PackageHeroV3) ── */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5 backdrop-blur-md shadow-2xl">
            <div className="relative overflow-hidden rounded-xl bg-slate-950">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:min-h-[350px]">
                <Image
                  src={getHdImageUrl(activeSlide.image_url)}
                  alt={activeSlide.alt_text || lodgeName}
                  fill
                  priority
                  className="object-cover transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 460px"
                />
                
                {/* Overlay Footer Badges */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
                    <Camera className="h-3.5 w-3.5 text-[#0d6e75]" />
                    {slides.length} {slides.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                  {totalRooms ? (
                    <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white ring-1 ring-white/20">
                      {totalRooms} Rooms Available
                    </span>
                  ) : null}
                </div>

                {/* Slider Control Arrows */}
                {slides.length > 1 && (
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
                )}
              </div>
            </div>

            {/* Bottom Notice Tag */}
            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-[#1598a1]/15 border border-[#1598a1]/30 px-3.5 py-2.5 text-[11px] font-bold text-[#8eecee]">
              <BadgeCheck className="h-4 w-4 text-[#8eecee] shrink-0" />
              <span>More photos &amp; room details will be confirmed before travel.</span>
            </div>
          </div>
        </div>

        {/* Bottom tag bar */}
        <div className="mt-7 inline-flex max-w-full items-center gap-1.5 rounded-2xl sm:rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/45">
          <Sparkles className="h-3 w-3 text-amber-300 shrink-0" />
          <span className="truncate">Premium Bhadrachalam Accommodation · Instant Online Booking</span>
        </div>
      </div>
    </section>
  );
};
