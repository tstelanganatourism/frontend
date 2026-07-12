'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Anchor,
  BadgeCheck,
  BedDouble,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Globe2,
  Headphones,
  Home,
  MapPin,
  Package,
  ShieldCheck,
  Ship,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

// ─── Static data (unchanged) ────────────────────────────────────────────────



const bottomTags = [
  { icon: Ship, label: 'Godavari Cruises' },
  { icon: BedDouble, label: 'Riverside Stays' },
  { icon: Camera, label: 'Sightseeing Tours' },
  { icon: Users, label: 'Family Packages' },
  { icon: BadgeCheck, label: 'Aadhaar Verified' },
];

const trustItems = [
  { icon: ShieldCheck, label: 'Authorized Booking Agent', sub: 'Telangana & Andhra Pradesh' },
  { icon: BadgeCheck, label: 'Government Approved', sub: 'Safe & Trusted' },
  { icon: Headphones, label: '24/7 Booking Support', sub: 'Quick & Reliable' },
  { icon: Globe2, label: 'Secure Payments', sub: 'Secure & Encrypted' },
];

const heroStats = [
  { icon: Users, value: '20+', label: 'Years Experience' },
  { icon: Globe2, value: '100K+', label: 'Happy Travellers' },
];

// ─── Default fallback slide (Godavari main) ─────────────────────────────────

const DEFAULT_SLIDE = {
  type: 'default' as const,
  slug: '',
  title: 'Telangana & AP Boat Tourism',
  description: 'Journey into Nature, Peace & Culture',
  cover_image_url: '/home/godavari-hero-banner.jpg',
  starting_price: null,
  region: null,
  duration: null,
  place: null,
  address: null,
  package_type: null,
  starting_weekend_price: null,
  child_price: null,
};

type ApiSlide = {
  type: 'package' | 'room';
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  starting_price: number | null;
  region: string | null;
  duration: string | null;
  place: string | null;
  address: string | null;
  package_type: string | null;
  starting_weekend_price: number | null;
  child_price: number | null;
  is_student_package?: boolean;
  student_price?: number | null;
  weekend_student_price?: number | null;
  refreshment_student_price?: number | null;
  has_refreshments?: boolean;
};

type Slide = typeof DEFAULT_SLIDE & {
  is_student_package?: boolean;
  student_price?: number | null;
  weekend_student_price?: number | null;
  refreshment_student_price?: number | null;
  has_refreshments?: boolean;
} | ApiSlide;

// ─── SVG decorators ─────────────────────────────────────────────────────────

function TopFlourish() {
  return (
    <svg viewBox="0 0 520 84" className="mx-auto h-14 w-full max-w-[36rem] text-amber-300/80" fill="none" aria-hidden="true">
      <path d="M16 58 C72 58 86 28 130 44 C156 54 176 44 190 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M504 58 C448 58 434 28 390 44 C364 54 344 44 330 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M206 46 C224 22 244 22 260 44 C276 22 296 22 314 46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M260 18 L266 32 L282 38 L266 44 L260 60 L254 44 L238 38 L254 32 Z" fill="currentColor" opacity="0.95" />
      <path d="M16 58 H188 M332 58 H504" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.72" />
      <circle cx="130" cy="44" r="3" fill="currentColor" opacity="0.75" />
      <circle cx="390" cy="44" r="3" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function TitleOrnament() {
  return (
    <div className="mt-3 flex w-full max-w-[18rem] items-center gap-3 overflow-visible text-amber-300/90">
      <span className="h-px flex-1 bg-amber-300/70" />
      <svg viewBox="0 0 92 20" className="h-5 w-24 shrink-0" fill="none" aria-hidden="true">
        <path d="M4 14 C10 7 18 7 24 14 M34 14 C40 7 48 7 54 14 M66 14 C72 7 80 7 86 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27 13 L31 6 L35 13 M57 13 L61 6 L65 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
      <span className="h-px flex-1 bg-amber-300/70" />
    </div>
  );
}

function SmallDivider() {
  return (
    <div className="mt-4 flex w-full max-w-[15rem] items-center gap-2 text-amber-300/85">
      <span className="h-px flex-1 bg-current/60" />
      <svg viewBox="0 0 62 18" className="h-5 w-16 shrink-0" fill="none" aria-hidden="true">
        <path d="M3 12 C10 4 18 4 24 12 C31 4 39 4 46 12 C50 16 56 16 59 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M31 3 L34 9 L40 11 L34 13 L31 17 L28 13 L22 11 L28 9 Z" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-current/60" />
    </div>
  );
}

function StatBlock({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-white/18 bg-slate-950/34 px-3 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-300 text-slate-950 shadow-[0_10px_26px_rgba(251,191,36,0.22)] sm:h-10 sm:w-10">
        <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <div className="text-[1.7rem] font-black leading-none text-amber-300 sm:text-[2rem] lg:text-[2.1rem] xl:text-[2.35rem]">{value}</div>
        <div className="mt-1 truncate text-[9px] font-black uppercase leading-3 tracking-[0.1em] text-white/82 sm:text-[10px]">
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Price formatter ─────────────────────────────────────────────────────────

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(price);
}

// ─── Main HeroBody Component ─────────────────────────────────────────────────

export default function HeroCarouselClient({ apiSlides = [] }: { apiSlides?: ApiSlide[] }) {
  const [slides] = useState<Slide[]>(() => [DEFAULT_SLIDE, ...apiSlides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const isTransitioningRef = useRef(false);
  const activeIndexRef = useRef(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTimeout(() => {
      activeIndexRef.current = index;
      setActiveIndex(index);
      setProgressKey(k => k + 1);
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 280);
  }, []);

  const goNext = useCallback(() => {
    goTo((activeIndexRef.current + 1) % slides.length);
  }, [slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIndexRef.current - 1 + slides.length) % slides.length);
  }, [slides.length, goTo]);

  // Auto-advance timer (5 s per slide) — uses ref to avoid stale closure
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setTimeout(() => {
      goTo((activeIndexRef.current + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  // progressKey drives the timer restart on every slide change
  }, [progressKey, isPaused, slides.length, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const activeSlide = slides[activeIndex];
  const isDefault = activeSlide.type === 'default';
  const isPackage = activeSlide.type === 'package';
  const isRoom = activeSlide.type === 'room';

  const isBoatRideSlide = isPackage && (
    (activeSlide as ApiSlide).package_type === 'TOUR' ||
    (activeSlide as ApiSlide).slug?.toLowerCase().includes('boat') ||
    (activeSlide as ApiSlide).slug?.toLowerCase().includes('cruise') ||
    (activeSlide as ApiSlide).slug?.toLowerCase().includes('ride') ||
    (activeSlide as ApiSlide).slug?.toLowerCase().includes('launch') ||
    (activeSlide as ApiSlide).title?.toLowerCase().includes('boat') ||
    (activeSlide as ApiSlide).title?.toLowerCase().includes('cruise') ||
    (activeSlide as ApiSlide).title?.toLowerCase().includes('ride')
  );



  // Compute CTA paths, labels, and icons
  let bookLink = '/boat-rides';
  let primaryLabel = 'Explore Boat Rides';
  let PrimaryIcon = Ship;

  let secondLink = '/stays';
  let secondLabel = 'Book Riverside Stays';
  let SecondIcon = BedDouble;

  if (!isDefault) {
    if (isRoom) {
      bookLink = `/stays/${activeSlide.slug}`;
      primaryLabel = 'Book Stay Now';
      PrimaryIcon = BedDouble;

      secondLink = '/stays';
      secondLabel = 'Browse Stays';
      SecondIcon = Home;
    } else if (isBoatRideSlide) {
      bookLink = `/packages/${activeSlide.slug}`;
      primaryLabel = 'Book Package Now';
      PrimaryIcon = Anchor;

      secondLink = '/boat-rides';
      secondLabel = 'Browse More Boat Rides';
      SecondIcon = Ship;
    } else { // Sightseeing
      bookLink = `/packages/${activeSlide.slug}`;
      primaryLabel = 'Book Package Now';
      PrimaryIcon = Compass;

      secondLink = '/sightseeing';
      secondLabel = 'Browse More Sightseeing';
      SecondIcon = Camera;
    }
  }

  // Define dynamic buttons list for the active slide
  type HeroButton = {
    href: string;
    label: string;
    icon: React.ElementType;
    styleType: 'primary' | 'secondary' | 'accent';
  };

  const getSlideButtons = (): HeroButton[] => {
    if (isDefault) {
      return [
        {
          href: '/boat-rides',
          label: 'Explore Boat Rides',
          icon: Ship,
          styleType: 'primary',
        },
        {
          href: '/sightseeing',
          label: 'Explore Sightseeing',
          icon: Camera,
          styleType: 'accent',
        },
        {
          href: '/stays',
          label: 'Book Riverside Stays',
          icon: BedDouble,
          styleType: 'secondary',
        },
      ];
    }

    return [
      {
        href: bookLink,
        label: primaryLabel,
        icon: PrimaryIcon,
        styleType: 'primary',
      },
      {
        href: secondLink,
        label: secondLabel,
        icon: SecondIcon,
        styleType: 'secondary',
      },
    ];
  };

  const currentButtons = getSlideButtons();



  return (
    <section
      className="sticky top-0 w-full overflow-hidden bg-slate-950 relative isolate flex h-[100svh] flex-col text-white"
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsPaused(false);
        }
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) {
          if (delta < 0) {
            goNext();
          } else {
            goPrev();
          }
        }
        touchStartX.current = null;
      }}
    >
      {/* ─── Background Images (all preloaded, cross-fade on active) ─── */}
      {slides.map((slide, idx) => {
        // Virtualize DOM slides: only render active, next, and previous slides to prevent memory/rendering lag
        const isRendered = idx === activeIndex || 
                           idx === (activeIndex + 1) % slides.length || 
                           idx === (activeIndex - 1 + slides.length) % slides.length;
        if (!isRendered) return null;

        const imgSrc = slide.cover_image_url || '/home/godavari-hero-banner.jpg';
        return (
          <div
            key={idx}
            className={`absolute inset-0 -z-10 transition-opacity duration-700 ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={idx !== activeIndex}
          >
            <Image
              src={imgSrc}
              alt={slide.title}
              fill
              priority={idx === 0}
              fetchPriority={idx === 0 ? 'high' : 'low'}
              sizes="(max-width: 640px) 100vw, 100vw"
              className="object-cover object-center"
              quality={80}
            />
          </div>
        );
      })}

      {/* ─── Overlays ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,16,30,0.96)_0%,rgba(2,24,38,0.82)_34%,rgba(2,19,32,0.36)_63%,rgba(2,19,32,0.12)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,14,26,0.16)_0%,rgba(2,14,26,0.12)_48%,rgba(2,14,26,0.72)_100%)]" />

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 mr-auto ml-0 flex w-full max-w-[120rem] flex-1 items-start pt-14 sm:items-center sm:pt-4 px-8 py-4 sm:px-12 sm:py-6 md:px-16 lg:px-20 xl:px-24 2xl:px-28">
        <div className="w-full">
          <div className="hidden lg:block">
            <TopFlourish />
          </div>
          {/* Badge */}
          <div className={`mb-4 flex w-full lg:mb-5 lg:justify-start ${isDefault ? 'justify-center' : 'justify-start'}`}>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/70 bg-slate-950/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-md sm:px-5 sm:text-[12px]">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
              <span className="truncate">
                {isDefault
                  ? 'Pappikondalu & Bhadrachalam Tour Bookings'
                  : isRoom
                    ? 'Verified Riverside Stay'
                    : isBoatRideSlide
                      ? 'Scenic Godavari Cruise'
                      : 'Heritage & Sightseeing Tour'}
              </span>
            </div>
          </div>

          {/* ─── MAIN CONTENT LAYOUT ─── */}
          {isDefault ? (
            <>
              {/* DESKTOP 3-column layout (lg+) */}
              <div
                className={`hidden max-w-[82rem] grid-cols-[0.9fr_1.2fr_0.9fr] items-start gap-4 lg:grid lg:gap-6 xl:gap-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                <div className="border-r border-amber-300/58 pr-4 lg:pr-7 pl-2 lg:pl-6">
                  <h2 className="text-[1.4rem] lg:text-[1.85rem] xl:text-[2.2rem] 2xl:text-[2.8rem] font-black leading-[1.1] tracking-tight text-amber-300">తెలంగాణ & ఏపీ</h2>
                  <div className="mt-2 text-[1.5rem] lg:text-[1.85rem] xl:text-[2.1rem] 2xl:text-[2.6rem] font-black leading-[1.1] tracking-tight text-white">బోట్ టూరిజం</div>
                  <p className="mt-3 lg:mt-5 max-w-[16rem] text-xs lg:text-sm xl:text-[15px] 2xl:text-lg font-semibold leading-relaxed text-white/88">ప్రకృతితో ఒక అందమైన ప్రయాణం</p>
                  <SmallDivider />
                </div>

                <div className="px-2">
                  <h1 className="font-serif text-[2.2rem] lg:text-[2.85rem] font-black leading-[0.96] tracking-normal xl:text-[3.45rem] 2xl:text-[4.15rem]">
                    <span className="block whitespace-nowrap text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)]">
                      Telangana & AP
                    </span>
                    <span className="block whitespace-nowrap text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)]">
                      Boat Tourism
                    </span>
                  </h1>
                  <TitleOrnament />
                  <p className="mt-3 text-sm lg:text-base xl:text-lg 2xl:text-xl font-semibold leading-relaxed text-white/92">
                    Journey into Nature, Peace & Culture
                  </p>
                  <SmallDivider />
                </div>

                <div className="border-l border-amber-300/58 pl-4 lg:pl-7 pr-2 lg:pr-6 text-right" dir="rtl">
                  <h2 className="text-[1.3rem] lg:text-[1.75rem] xl:text-[2.15rem] 2xl:text-[2.7rem] font-black leading-[1.2] tracking-tight text-amber-300">تلنگانہ اور اے پی</h2>
                  <div className="mt-2 text-[1.5rem] lg:text-[1.85rem] xl:text-[2.1rem] 2xl:text-[2.6rem] font-black leading-[1.2] tracking-tight text-white">بوٹ ٹورزم</div>
                  <p className="mr-auto mt-3 lg:mt-5 max-w-[16rem] text-xs lg:text-sm xl:text-[15px] 2xl:text-lg font-semibold leading-relaxed text-white/88">قدرت، سکون اور یادوں کا سفر</p>
                  <div className="flex justify-end">
                    <SmallDivider />
                  </div>
                </div>
              </div>

              {/* MOBILE centered layout (< 980px) */}
              <div
                className={`lg:hidden transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                <div className="mx-auto max-w-[25rem] border-x border-amber-300/55 px-4 text-center">
                  <h1 className="font-serif text-[clamp(2.3rem,9vw,3.2rem)] font-black leading-[0.95] tracking-normal">
                    <span className="block text-amber-300 font-bold">Telangana & AP</span>
                    <span className="block text-white font-bold">Boat Tourism</span>
                  </h1>
                  <div className="mx-auto flex justify-center">
                    <TitleOrnament />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-6 text-white/92 line-clamp-2">
                    Journey into Nature, Peace & Culture
                  </p>
                </div>
              </div>

              {/* RENDER DEFAULT CTA BUTTONS */}
              <div className={`mt-6 flex flex-col gap-3 min-[480px]:flex-row sm:gap-4 lg:mt-8 w-full max-w-[56rem] justify-center lg:justify-start relative z-[40] transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                {currentButtons.map((btn, index) => {
                  const Icon = btn.icon;
                  return (
                    <Link
                      key={index}
                      href={btn.href}
                      className={
                        btn.styleType === 'primary'
                          ? "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-4 text-[12px] font-black text-slate-950 shadow-[0_18px_42px_rgba(251,191,36,0.34)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(251,191,36,0.46)] sm:flex-none sm:gap-3 sm:px-7 sm:text-sm lg:px-9 lg:text-base"
                          : btn.styleType === 'accent'
                            ? "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-teal-350 bg-teal-950/74 px-4 text-[12px] font-black text-white shadow-[0_18px_42px_rgba(20,80,90,0.28)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-teal-900/86 sm:flex-none sm:gap-3 sm:px-7 sm:text-sm lg:px-9 lg:text-base"
                            : "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-sky-300/45 bg-blue-950/74 px-4 text-[12px] font-black text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-blue-900/86 sm:flex-none sm:gap-3 sm:px-7 sm:text-sm lg:px-9 lg:text-base"
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="whitespace-nowrap">{btn.label}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            /* Premium responsive dynamic slide layout (Pure English) */
            <div
              className={`w-full max-w-[76rem] transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.28fr_0.72fr] lg:gap-10 lg:items-center px-0">
                {/* Column 1: Core Info */}
                <div className="border-l-4 border-amber-400 pl-4 sm:pl-6 md:pl-8 min-w-0">
                  {/* Category Pill for details page */}
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    {isRoom ? 'Accommodation' : isBoatRideSlide ? 'Boat Cruise' : 'Sightseeing Tour'}
                  </div>

                  <h1 className="font-serif text-[clamp(1.75rem,3.8vw,3.2rem)] font-black leading-[1.08] tracking-tight text-white break-words">
                    <span 
                      className="block text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                      dangerouslySetInnerHTML={{ __html: activeSlide.title.replace(/\(/g, ' (') }}
                    />
                  </h1>
                  
                  <div className="mt-2 max-w-[20rem]">
                    <TitleOrnament />
                  </div>

                  {/* Sub-info tags row */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">
                    {activeSlide.place && (
                      <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
                        {activeSlide.place}
                      </span>
                    )}
                    {activeSlide.duration && (
                      <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
                        {activeSlide.duration}
                      </span>
                    )}
                    {activeSlide.is_student_package ? (
                      <>
                        {activeSlide.student_price && (
                          <span className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1.5 sm:px-4 sm:py-2 text-amber-300 backdrop-blur-sm font-extrabold lg:hidden">
                            Student: {formatPrice(activeSlide.student_price ?? null)}
                          </span>
                        )}
                        {activeSlide.weekend_student_price && (
                          <span className="flex items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 sm:px-4 sm:py-2 text-sky-300 backdrop-blur-sm font-extrabold lg:hidden">
                            Weekend: {formatPrice(activeSlide.weekend_student_price ?? null)}
                          </span>
                        )}
                        {activeSlide.has_refreshments && activeSlide.refreshment_student_price && (
                          <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-300 backdrop-blur-sm font-extrabold lg:hidden">
                            Food: +{formatPrice(activeSlide.refreshment_student_price ?? null)}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {activeSlide.starting_price && (
                          <span className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1.5 sm:px-4 sm:py-2 text-amber-300 backdrop-blur-sm font-extrabold lg:hidden">
                            {isRoom ? 'Weekday' : 'Adult'}: {formatPrice(activeSlide.starting_price)}
                          </span>
                        )}
                        {isPackage && activeSlide.child_price && (
                          <span className="flex items-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-400/10 px-3 py-1.5 sm:px-4 sm:py-2 text-amber-250 backdrop-blur-sm font-extrabold lg:hidden">
                            Child: {formatPrice(activeSlide.child_price)}
                          </span>
                        )}
                        {isRoom && activeSlide.starting_weekend_price && (
                          <span className="flex items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 sm:px-4 sm:py-2 text-sky-300 backdrop-blur-sm font-extrabold lg:hidden">
                            Weekend: {formatPrice(activeSlide.starting_weekend_price)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div 
                    className="mt-4 max-w-[44rem] text-xs font-medium leading-relaxed text-white/92 sm:text-base sm:leading-7 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                    dangerouslySetInnerHTML={{ __html: activeSlide.description || 'Experience the beauty of Godavari with our government-approved premier package tours.' }}
                  />

                  {/* CTA Buttons in Column 1 */}
                  <div className="mt-6 flex flex-col gap-3 min-[480px]:flex-row sm:gap-4 lg:mt-8 w-full max-w-[36rem] relative z-[40]">
                    {currentButtons.map((btn, index) => {
                      const Icon = btn.icon;
                      return (
                        <Link
                          key={index}
                          href={btn.href}
                          className={
                            btn.styleType === 'primary'
                              ? "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-4 text-[12px] font-black text-slate-950 shadow-[0_18px_42px_rgba(251,191,36,0.34)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(251,191,36,0.46)] sm:flex-none sm:gap-3 sm:px-7 sm:text-sm lg:px-9 lg:text-base"
                              : btn.styleType === 'accent'
                                ? "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-teal-350 bg-teal-950/74 px-4 text-[12px] font-black text-white shadow-[0_18px_42px_rgba(20,80,90,0.28)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-teal-900/86 sm:flex-none sm:gap-3 sm:px-7 sm:text-sm lg:px-9 lg:text-base"
                                : "inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-sky-300/45 bg-blue-950/74 px-4 text-[12px] font-black text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-blue-900/86 sm:flex-none sm:gap-3 sm:px-7 sm:text-sm lg:px-9 lg:text-base"
                          }
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${btn.styleType === 'primary' ? 'animate-pulse' : ''}`} />
                          <span className="whitespace-nowrap">{btn.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Premium Pricing Breakdown Card */}
                <div className="hidden lg:block min-w-[16rem] shrink-0">
                  <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-950/50 p-6 backdrop-blur-md shadow-[0_24px_55px_rgba(0,0,0,0.4)]">
                    {/* Glowing highlight */}
                    <div className="absolute -top-10 -right-10 h-32 w-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                      Pricing & Rates
                    </h3>
                    <p className="mt-1 text-lg font-black text-white">
                      {isRoom ? 'Premium Stay Rates' : activeSlide.is_student_package ? 'Student Group Fares' : 'All-Inclusive Fares'}
                    </p>

                    <div className="mt-4 space-y-4">
                      {/* Price Row 1 */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <p className="text-xs font-bold text-white/70">
                            {isRoom ? 'Weekday Stay (Sun - Thu)' : activeSlide.is_student_package ? 'Student Ticket (Regular)' : 'Adult Package Ticket'}
                          </p>
                          <p className="text-[10px] text-white/50">
                            {isRoom ? 'Per night, double occupancy' : activeSlide.is_student_package ? 'Per-student regular weekday fare' : 'Standard all-inclusive passenger'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-amber-300">
                            {formatPrice((activeSlide.is_student_package ? activeSlide.student_price : activeSlide.starting_price) ?? null)}
                          </p>
                        </div>
                      </div>

                      {/* Price Row 2 */}
                      {isRoom && activeSlide.starting_weekend_price ? (
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <p className="text-xs font-bold text-white/70">Weekend Stay (Fri - Sat)</p>
                            <p className="text-[10px] text-white/50">Subject to room availability</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-sky-300">
                              {formatPrice(activeSlide.starting_weekend_price)}
                            </p>
                          </div>
                        </div>
                      ) : activeSlide.is_student_package ? (
                        <>
                          {activeSlide.weekend_student_price && (
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                              <div>
                                <p className="text-xs font-bold text-white/70">Student Ticket (Weekend)</p>
                                <p className="text-[10px] text-white/50">Weekend / festival / holiday fare</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-sky-350">
                                  {formatPrice(activeSlide.weekend_student_price ?? null)}
                                </p>
                              </div>
                            </div>
                          )}
                          {activeSlide.has_refreshments && activeSlide.refreshment_student_price && (
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                              <div>
                                <p className="text-xs font-bold text-white/70">Refreshments (Optional)</p>
                                {/* <p className="text-[10px] text-white/50">Veg lunch, breakfast, snacks</p> */}
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-emerald-400">
                                  +{formatPrice(activeSlide.refreshment_student_price ?? null)}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : activeSlide.child_price ? (
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <p className="text-xs font-bold text-white/70">Child Ticket (Ages 4-10)</p>
                            <p className="text-[10px] text-white/50">Children under 4 travel free</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-amber-300">
                              {formatPrice(activeSlide.child_price)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <p className="text-xs font-bold text-white/70">Booking Assistance</p>
                            <p className="text-[10px] text-white/50">24/7 boarding assistance</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-400">Included</p>
                          </div>
                        </div>
                      )}

                      {/* Trust pill */}
                      <div className="flex items-center gap-2 rounded-xl bg-amber-400/10 px-3 py-2 text-[10px] font-semibold text-amber-300">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-amber-300" />
                        <span>APTDC & Telangana Tourism Partner</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Mobile bilingual mini-cards ─── */}
          {isDefault && (
            <div className="mx-auto mt-3 grid w-full max-w-[25rem] grid-cols-2 gap-2 md:hidden">
              <div className="min-w-0 rounded-2xl border border-white/14 bg-slate-950/30 p-2.5 backdrop-blur-md">
                <div className="truncate text-base font-black leading-tight text-amber-300">తెలంగాణ & ఏపీ</div>
                <div className="mt-0.5 truncate text-sm font-black leading-tight text-white">బోట్ టూరిజం</div>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/14 bg-slate-950/30 p-2.5 text-right backdrop-blur-md" dir="rtl">
                <div className="truncate text-base font-black leading-tight text-amber-300">تلنگانہ اور اے پی</div>
                <div className="mt-0.5 truncate text-sm font-black leading-tight text-white">بوٹ ٹورزم</div>
              </div>
              {heroStats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/14 bg-slate-950/34 p-2.5 backdrop-blur-md">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-300 text-slate-950">
                    <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl font-black leading-none text-amber-300">{value}</div>
                    <div className="mt-0.5 truncate text-[8px] font-black uppercase tracking-[0.08em] text-white/82">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Bottom tags (md+) ─── */}
          {isDefault && (
            <div className="mt-4 hidden max-w-[58rem] flex-wrap gap-2.5 md:flex lg:mt-4">
              {bottomTags.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/23 bg-slate-950/22 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-md">
                  <Icon className="h-4 w-4 text-amber-300" />
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* ─── md bilingual cards ─── */}
          {isDefault && (
            <div className="mx-auto mt-4 hidden max-w-[25rem] grid-cols-2 gap-3 md:grid lg:hidden">
              <div className="rounded-2xl border border-white/13 bg-slate-950/28 p-3 backdrop-blur-md">
                <div className="text-xl font-black leading-tight text-amber-300">తెలంగాణ & ఏపీ</div>
                <div className="mt-1 text-lg font-black leading-tight text-white">బోట్ టూరిజం</div>
                <p className="mt-2 text-[11px] font-semibold leading-4 text-white/78">ప్రకృతితో ఒక అందమైన ప్రయాణం</p>
              </div>
              <div className="rounded-2xl border border-white/13 bg-slate-950/28 p-3 text-right backdrop-blur-md" dir="rtl">
                <div className="text-xl font-black leading-tight text-amber-300">تلنگانہ اور اے پی</div>
                <div className="mt-1 text-lg font-black leading-tight text-white">بوٹ ٹورزم</div>
                <p className="mt-2 text-[11px] font-semibold leading-4 text-white/78">قدرت، سکون اور یادوں کا سفر</p>
              </div>
            </div>
          )}

          {/* ─── Stats (md) ─── */}
          {isDefault && (
            <div className="mx-auto mt-4 hidden w-full max-w-[25rem] grid-cols-2 gap-2.5 md:grid lg:hidden">
              {heroStats.map((stat) => (
                <StatBlock key={stat.label} {...stat} />
              ))}
              <div className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/88 backdrop-blur-md">
                <BadgeCheck className="h-4 w-4 shrink-0 text-amber-300" />
                Verified support from booking to boarding
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Floating right elements (2xl) ─── */}
      <div className="pointer-events-none absolute right-8 top-[17%] z-20 hidden text-right 2xl:block">
        <div className="font-serif text-5xl italic leading-[0.92] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">Explore</div>
        <div className="mt-1 text-2xl font-semibold italic text-white/88">the Beauty of</div>
        <div className="font-serif text-6xl italic leading-none text-amber-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">Godavari</div>
        <span className="ml-auto mt-1 block h-1 w-44 rounded-full bg-amber-300" />
      </div>

      <div className="pointer-events-none absolute bottom-28 right-10 z-20 hidden items-center gap-3 lg:flex xl:gap-4">
        {heroStats.map((stat) => (
          <StatBlock key={stat.label} {...stat} />
        ))}
      </div>

      {/* ─── Carousel Controls ─────────────────────────────────────────── */}
      {slides.length > 1 && (
        <>
          {/* ── Desktop side arrows ── */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:border-white/60 hover:bg-black/60 hover:scale-110 active:scale-95 lg:left-6 xl:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:border-white/60 hover:bg-black/60 hover:scale-110 active:scale-95 lg:right-6 xl:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Slide type label badge */}
          {!isDefault && (
            <div className="absolute bottom-28 right-4 z-30 md:right-8 md:bottom-24 hidden sm:block">
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                {isPackage ? <Package className="h-3 w-3 text-amber-300" /> : <BedDouble className="h-3 w-3 text-sky-300" />}
                {isPackage ? 'Tour Package' : 'Riverside Stay'}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── CSS for carousel progress animation ────────────────────────── */}
      <style>{`
        @keyframes carousel-progress {
          from { transform: scaleX(0); transform-origin: left center; }
          to   { transform: scaleX(1); transform-origin: left center; }
        }
      `}</style>
    </section>
  );
}
