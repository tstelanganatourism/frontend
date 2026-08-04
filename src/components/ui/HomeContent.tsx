'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Ship,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { translations } from '@/lib/translations';
import PackageCard from '@/components/ui/PackageCard';
import RoomCard from '@/components/ui/RoomCard';
import GoogleReviewsCarousel from '@/components/ui/GoogleReviewsCarousel';
import HeroBackgroundSlideshow from '@/components/ui/HeroBackgroundSlideshow';
import type { HeroItem, FeaturedPackage, RoomItem } from '@/app/page';

// ─── Constants ─────────────────────────────────────────────────────────────

const GOOGLE_REVIEW_URL = 'https://g.page/r/CcdqZmyXuAhxEAI';
const GOOGLE_WRITE_REVIEW_URL = 'https://g.page/r/CcdqZmyXuAhxEAI/review';

const GOOGLE_REVIEWS = [
  { text: 'One of the best boat journey. Each and every one has to be ride this journey their life atleast.thanks ts boat tourism', name: 'Bhanu Kumar', time: '3 months ago', rating: 5 },
  { text: 'One of the best boat journey. Thanks TS Boat Tourism. I have small suggestion for boat tourism team, kindly update on website daily how many boats are travelled by every day.', name: 'I Am Hari', time: 'a year ago', rating: 5 },
  { text: 'Papikodal boating very good experience.boatig so excited.ts boat tourism services good.', name: 'Bagula Srinivas', time: 'a year ago', rating: 5 },
  { text: 'Ts boat tourism papikondalu good service food', name: 'Akkineni Srikanth', time: 'a year ago', rating: 5 },
  { text: 'This responsibility office in boarding office number One', name: 'guguloth bhima', time: '3 months ago', rating: 5 },
  { text: 'Its was soo good, i enjoyed thoroughly, booking, food, transport and boating everything super', name: 'Raghu Lee', time: '8 months ago', rating: 5 },
  { text: 'Best friend journey Papikondalu', name: 'Chinnapareddy 5081', time: 'a year ago', rating: 5 },
];

const TRUST_VALUES = ['20+', '1L+', '10,000+', '100%'];

const EXPERIENCE_IMAGES = [
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
];

const FALLBACK_PACKAGES: FeaturedPackage[] = [
  { id: 1, slug: 'hyderabad-kolluru-huts-3-days', title: 'Hyderabad To Kolluru Huts 3 Days Tour', type: 'PACKAGE', duration: '3 Days / 2 Nights', place: 'Kolluru Huts', region: 'AP', cover_image_url: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg', is_featured: true, tags: ['Cruise + Stay', 'Best Seller'], starting_price: 4500, variants: [{ id: 101, title: 'Standard Train Sleeper Package', adult_price: 4500, child_price: 4000, is_active: true }] },
  { id: 2, slug: 'bhadrachalam-rajahmundry-1-day', title: 'Bhadrachalam To Rajahmundry 1Day Tour', type: 'PACKAGE', duration: '1 Day', place: 'Rajahmundry', region: 'AP', cover_image_url: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg', is_featured: true, tags: ['Sightseeing', 'Popular'], starting_price: 2500, variants: [{ id: 102, title: 'Day Cruise Package', adult_price: 2500, child_price: 2200, is_active: true }] },
  { id: 3, slug: 'bhadrachalam-kolluru-huts-2-days', title: 'Bhadrachalam To Kolluru Huts 2 Days Tour', type: 'PACKAGE', duration: '2 Days / 1 Night', place: 'Kolluru Huts', region: 'AP', cover_image_url: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg', is_featured: true, tags: ['Cruise + Stay', 'Nature Huts'], starting_price: 4000, variants: [{ id: 103, title: 'Bamboo Hut Stay Package', adult_price: 4000, child_price: 3500, is_active: true }] },
];

const FALLBACK_ROOMS: RoomItem[] = [
  { id: 1, slug: 'bhadrachalam-riverside-lodge', lodge_name: 'Bhadrachalam Temple View Lodge', cover_image_url: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg', is_featured: true, starting_price: 1800, starting_weekend_price: 2200, address: 'Near Temple Road, Bhadrachalam', facilities: ['A/C', 'Wi-Fi', 'Hot Water', 'Room Service'] },
  { id: 2, slug: 'kolluru-river-huts', lodge_name: 'Kolluru Bamboo River Huts', cover_image_url: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg', is_featured: true, starting_price: 2500, starting_weekend_price: 3000, address: 'Kolluru Sandbanks, Papikondalu', facilities: ['Meals Included', 'River View', 'Hot Water'] },
  { id: 3, slug: 'rajahmundry-deluxe-stay', lodge_name: 'Godavari View Deluxe Stay', cover_image_url: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613511/ts_boat_tourism/packages/ywm9affxxbtriy8szyp2.jpg', is_featured: true, starting_price: 1500, starting_weekend_price: 1800, address: 'Rajahmundry Pushkar Ghat Road', facilities: ['A/C', 'Car Parking', 'Wi-Fi'] },
];

// ─── Item Row (hero scroll card) ───────────────────────────────────────────

function HeroItemRow({ item, index }: { item: HeroItem; index: number }) {
  const Icon = item.itemType === 'room' ? BedDouble : Ship;
  const badgeColor = item.itemType === 'room' ? 'text-amber-600' : 'text-[#1598a1]';

  return (
    <Link
      href={item.href}
      key={`hero-item-${index}`}
      className="group grid grid-cols-[4.5rem_minmax(0,1fr)_1.25rem] items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2 pr-3 transition-all hover:scale-[1.01] hover:border-[#1598a1] hover:bg-[#f6fbfb] shadow-sm"
    >
      {/* Thumbnail */}
      <span className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-md bg-slate-100">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Type badge overlay */}
        <span className={`absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 py-0.5 text-[7px] font-black uppercase tracking-wide backdrop-blur-sm ${
          item.itemType === 'room'
            ? 'bg-amber-500/85 text-white'
            : 'bg-[#1598a1]/85 text-white'
        }`}>
          <Icon className="h-2 w-2 shrink-0" />
          {item.itemType === 'room' ? 'Stay' : 'Tour'}
        </span>
      </span>

      {/* Text */}
      <span className="min-w-0 pr-1">
        <span className={`mb-0.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] ${badgeColor}`}>
          <Icon className="h-3 w-3 shrink-0" />
          {item.meta}
        </span>
        <span className="block text-xs font-black leading-4 text-[#0f2f3d] line-clamp-1">
          {item.title}
        </span>
        <span className="mt-0.5 line-clamp-1 block text-[10px] font-semibold leading-3 text-slate-500">
          {item.desc}
        </span>
      </span>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1598a1]" />
    </Link>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface HomeContentProps {
  heroItems: HeroItem[];
  featuredPackages: FeaturedPackage[] | null;
  rooms: RoomItem[] | null;
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function HomeContent({ heroItems, featuredPackages, rooms }: HomeContentProps) {
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];
  const isTelugu = language === 'te';
  const tc = isTelugu ? 'font-telugu' : '';

  const trustLabels = [
    t.trust.yearsOfService,
    t.trust.happyTravellers,
    t.trust.bookingsServed,
    t.trust.securePayments,
  ];

  const displayPkgs = featuredPackages && featuredPackages.length > 0
    ? featuredPackages.slice(0, 3)
    : null;
  const displayRooms = rooms && rooms.length > 0 ? rooms.slice(0, 3) : FALLBACK_ROOMS;

  const experienceItems = [
    { title: t.experience.boat.title, desc: t.experience.boat.desc, image: EXPERIENCE_IMAGES[0], points: t.experience.boat.points },
    { title: t.experience.temple.title, desc: t.experience.temple.desc, image: EXPERIENCE_IMAGES[1], points: t.experience.temple.points },
  ];

  // Duplicate the hero items for seamless infinite scroll
  const scrollItems = heroItems.length > 0 ? heroItems : [];
  const animDuration = `${Math.max(scrollItems.length * 5, 20)}s`;

  return (
    <main className="w-full overflow-x-clip bg-[#f6faf8] text-[#0f2f3d]">

      {/* ─── HERO ─── */}
      <section className="relative isolate overflow-hidden bg-[#07242c]">
        {/* Slideshow renders its own gradient overlay + carousel controls internally */}
        <HeroBackgroundSlideshow />

        <div className="relative z-10 mx-auto grid min-h-[auto] lg:min-h-screen lg:h-screen w-full max-w-[1800px] items-start lg:items-center gap-8 px-4 pb-8 pt-24 sm:pt-28 lg:pt-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:px-8 xl:px-12">

          {/* Left: hero text */}
          <div className="max-w-4xl py-4 text-white lg:py-6">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-md border border-[#35c6ca]/45 bg-[#1598a1]/18 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a7f3f4] backdrop-blur-md sm:text-xs ${tc}`}>
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              {t.hero.badge}
            </div>

            <h1 className={`max-w-4xl font-black leading-[1.1] tracking-tight ${tc} ${
              isTelugu
                ? 'text-2xl sm:text-4xl lg:text-[2.4rem] xl:text-[3rem] 2xl:text-[3.6rem]'
                : 'text-3xl sm:text-5xl lg:text-[2.75rem] xl:text-[3.5rem] 2xl:text-[4.2rem]'
            }`}>
              {t.hero.heading}
            </h1>

            <p className={`mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base ${tc}`}>
              {t.hero.description}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/packages"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#1598a1] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(21,152,161,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#117f87] sm:text-base ${tc}`}
              >
                {t.hero.viewPackages} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <a
                href="tel:+919951369573"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/28 bg-white/12 px-7 text-sm font-black text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/18 sm:text-base ${tc}`}
              >
                <Phone className="h-4 w-4 shrink-0" /> {t.hero.talkToTeam}
              </a>
            </div>

            {/* Trust bar */}
            <div className="mt-6 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-md border border-white/18 bg-white/18 sm:grid-cols-4">
              {TRUST_VALUES.map((value, idx) => (
                <div key={idx} className="bg-[#06333c]/66 p-3 backdrop-blur">
                  <p className="text-xl font-black text-[#8eecee] sm:text-2xl">{value}</p>
                  <p className={`mt-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/58 ${tc}`}>
                    {trustLabels[idx]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Find your package + stay card ─── */}
          <div className="pb-6 lg:pb-0">
            <div className="rounded-xl border border-white/10 bg-white p-4 shadow-[0_24px_70px_rgba(15,61,86,0.16)]">

              {/* Card header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-1 pb-3">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.16em] text-[#1598a1] ${tc}`}>
                    {t.findPackage.startHere}
                  </p>
                  <h2 className={`mt-0.5 text-lg font-black text-[#0f2f3d] ${tc}`}>
                    {t.findPackage.findPackage}
                  </h2>
                </div>
                {/* Legend pills */}
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f8] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-[#1598a1]">
                    <Ship className="h-2.5 w-2.5" /> Tour
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-600">
                    <BedDouble className="h-2.5 w-2.5" /> Stay
                  </span>
                </div>
              </div>

              {/* Scrolling list */}
              <div className="relative h-[280px] overflow-hidden mt-3 [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]">
                {scrollItems.length > 0 ? (
                  <div
                    className="marquee-container animate-marquee-vertical flex flex-col gap-2.5"
                    style={{ animationDuration: animDuration }}
                  >
                    {/* First pass */}
                    {scrollItems.map((item, idx) => (
                      <HeroItemRow key={`a-${idx}`} item={item} index={idx} />
                    ))}
                    {/* Duplicate for seamless loop */}
                    {scrollItems.map((item, idx) => (
                      <HeroItemRow key={`b-${idx}`} item={item} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Loading packages…
                  </div>
                )}
              </div>

              {/* Footer: two CTA buttons */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/packages"
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-[#0f3d56] px-3 text-xs font-black text-white transition-colors hover:bg-[#15506a] ${tc}`}
                >
                  <Ship className="h-3.5 w-3.5 shrink-0" />
                  {isTelugu ? 'ప్యాకేజీలు' : 'All Packages'} <ArrowRight className="h-3 w-3 shrink-0" />
                </Link>
                <Link
                  href="/stays"
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-700 transition-colors hover:bg-amber-100 ${tc}`}
                >
                  <BedDouble className="h-3.5 w-3.5 shrink-0" />
                  {isTelugu ? 'వసతులు' : 'All Stays'} <ArrowRight className="h-3 w-3 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOBILE BANNER ─── */}
      <section className="block lg:hidden bg-[#07242c] py-6 border-t border-b border-[#1598a1]/25">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#a7f3f4] ${tc}`}>
                <ShieldCheck className="h-3 w-3 text-[#1598a1]" />
                {t.banner.msme}
              </span>
              <h2 className={`mt-1 text-lg font-black text-white tracking-tight ${tc}`}>
                {t.banner.title}
              </h2>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-teal-400/25 bg-[#021c24] p-1.5 shadow-2xl">
            <img
              src="/images/boat-rides-banner-2026.webp"
              alt="TS Boat Tourism Official HD Banner"
              className="w-full h-auto rounded-lg object-contain"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCES ─── */}
      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.18em] text-[#1598a1] ${tc}`}>
                {t.experience.label}
              </p>
              <h2 className={`mt-2 max-w-3xl text-3xl font-black leading-tight text-[#0f2f3d] md:text-5xl ${tc}`}>
                {t.experience.heading}
              </h2>
            </div>
            <Link
              href="/packages"
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#1598a1] px-5 text-sm font-black text-white transition-colors hover:bg-[#117f87] ${tc}`}
            >
              {t.experience.browsePackages} <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {experienceItems.map((item) => (
              <article key={item.title} className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,61,86,0.06)] md:grid-cols-[42%_1fr]">
                <div className="relative min-h-[18rem] md:min-h-full">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
                </div>
                <div className="p-6 md:p-8">
                  <p className={`text-xs font-black uppercase tracking-[0.16em] text-[#1598a1] ${tc}`}>
                    {t.experience.guide}
                  </p>
                  <h2 className={`mt-2 text-2xl font-black text-[#0f2f3d] md:text-3xl ${tc}`}>
                    {item.title}
                  </h2>
                  <p className={`mt-3 text-sm font-semibold leading-7 text-slate-600 ${tc}`}>
                    {item.desc}
                  </p>
                  <div className="mt-5 grid gap-3">
                    {item.points.map((point) => (
                      <div key={point} className={`flex items-center gap-3 text-sm font-black text-[#0f2f3d] ${tc}`}>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1598a1]" />
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PACKAGES & ROOMS ─── */}
      <section className="bg-[#0f3d56] py-12 text-white md:py-20">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#8eecee] backdrop-blur-md ${tc}`}>
              <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              {t.featured.badge}
            </span>
            <h2 className={`mt-3 text-3xl font-black md:text-5xl tracking-tight ${tc}`}>
              {t.featured.heading}
            </h2>
            <p className={`mt-3 text-sm font-medium leading-relaxed text-white/70 sm:text-base ${tc}`}>
              {t.featured.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-12">
            {/* Featured Packages */}
            <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1598a1] text-white">
                    <Ship className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className={`text-xl font-black text-white ${tc}`}>{t.featured.featuredPackages}</h3>
                    <p className={`text-xs font-semibold text-[#8eecee] ${tc}`}>{t.featured.top3Packages}</p>
                  </div>
                </div>
                <Link
                  href="/packages"
                  className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#8eecee] transition-colors hover:text-white ${tc}`}
                >
                  {t.featured.viewAll} ({featuredPackages?.length || 3}) <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {displayPkgs ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
                  {displayPkgs.map((pkg, index) => (
                    <PackageCard key={pkg.id} pkg={pkg} priority={index < 2} variant="compact" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
                  {FALLBACK_PACKAGES.map((pkg, index) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <PackageCard key={pkg.id} pkg={pkg as any} priority={index < 2} variant="compact" href="/packages" />
                  ))}
                </div>
              )}
            </div>

            {/* Featured Rooms */}
            <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#b45309] text-white">
                    <BedDouble className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className={`text-xl font-black text-white ${tc}`}>{t.featured.hotels}</h3>
                    <p className={`text-xs font-semibold text-amber-300 ${tc}`}>{t.featured.top3Rooms}</p>
                  </div>
                </div>
                <Link
                  href="/stays"
                  className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-300 transition-colors hover:text-white ${tc}`}
                >
                  {t.featured.viewAllRooms} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
                {displayRooms.map((room, index) => {
                  const isLiveFetch = rooms && rooms.length > 0;
                  return (
                    <RoomCard
                      key={room.id}
                      room={room}
                      variant="compact"
                      priority={index < 2}
                      href={isLiveFetch ? undefined : '/stays'}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <GoogleReviewsCarousel
        reviews={GOOGLE_REVIEWS}
        profileUrl={GOOGLE_REVIEW_URL}
        writeReviewUrl={GOOGLE_WRITE_REVIEW_URL}
      />

      {/* ─── CTA ─── */}
      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto grid max-w-[1800px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 xl:px-12">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.18em] text-[#1598a1] ${tc}`}>
              {t.cta.label}
            </p>
            <h2 className={`mt-2 max-w-3xl text-3xl font-black leading-tight text-[#0f2f3d] md:text-5xl ${tc}`}>
              {t.cta.heading}
            </h2>
            <p className={`mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base ${tc}`}>
              {t.cta.desc}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem]">
            <a
              href="tel:+919951369573"
              className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-md bg-[#1598a1] px-6 text-sm font-black text-white transition-colors hover:bg-[#117f87] ${tc}`}
            >
              <Phone className="h-4 w-4 shrink-0" />
              {t.cta.callNow}
            </a>
            <a
              href="https://wa.me/919951369573"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-6 text-sm font-black text-[#0f3d56] transition-colors hover:bg-[#eef8f8] ${tc}`}
            >
              {t.cta.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
