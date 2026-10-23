'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Flame,
  MapPin,
  Ship,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import type { FeaturedPackage } from '@/app/page';

interface FlipkartPackageAdsProps {
  packages?: FeaturedPackage[] | null;
}

const FALLBACK_DEALS: FeaturedPackage[] = [
  {
    id: 991,
    slug: 'papikondalu-premium-tour',
    title: 'Pochavaram to Papikondalu Deluxe AC Cruise',
    type: 'TOUR',
    duration: '1 Day',
    place: 'Papikondalu',
    region: 'TS',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/v1781201339/ts_tours/knzicxkdeqxnm3ewlhii.jpg',
    is_featured: true,
    tags: ['Meals included', 'AC cruise'],
    starting_price: 1050,
  },
  {
    id: 992,
    slug: 'bhadrachalam-to-papikondalu-1-day-tour-package',
    title: 'Bhadrachalam Temple & Godavari Cruise',
    type: 'TOUR',
    duration: '1 Day',
    place: 'Bhadrachalam',
    region: 'TS',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/v1781203112/ts_tours/bw6oj3az4c8b5ishs0gm.jpg',
    is_featured: true,
    tags: ['Temple darshan', 'Lunch included'],
    starting_price: 1150,
  },
  {
    id: 993,
    slug: 'kolluru-bamboo-river-huts-stay',
    title: 'Kolluru Bamboo River Huts Adventure',
    type: 'STAY',
    duration: '2 Days / 1 Night',
    place: 'Kolluru Sandbanks',
    region: 'AP',
    cover_image_url: 'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp',
    is_featured: true,
    tags: ['Stay + cruise', 'Campfire'],
    starting_price: 2500,
  },
];

const CARD_THEMES = [
  {
    surface: 'from-[#046c99] via-[#0a86b8] to-[#075a83]',
    accent: 'bg-[#ffe768] text-[#12364a]',
    label: 'River favourite',
  },
  {
    surface: 'from-[#621b9c] via-[#8a27d4] to-[#50177c]',
    accent: 'bg-[#ffed90] text-[#542061]',
    label: 'Top pick',
  },
  {
    surface: 'from-[#b24616] via-[#dd651d] to-[#91320e]',
    accent: 'bg-[#ffec9b] text-[#72290d]',
    label: 'Family choice',
  },
];

function formatInr(value: number | null | undefined): string {
  return Number(value || 0).toLocaleString('en-IN');
}

/**
 * A high-intent offer dialog for the home hero.  It is deliberately kept
 * separate from the page flow so the carousel remains the homepage backdrop.
 */
export default function FlipkartPackageAds({ packages }: FlipkartPackageAdsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const deals = useMemo(() => {
    const rawList = Array.isArray(packages) ? packages.filter((item) => item?.slug) : [];
    // Prioritize explicitly featured packages first
    const featured = rawList.filter((item) => item.is_featured);
    const nonFeatured = rawList.filter((item) => !item.is_featured);
    const available = [...featured, ...nonFeatured];
    const uniqueDeals = [...available];

    for (const fallback of FALLBACK_DEALS) {
      if (!uniqueDeals.some((item) => item.slug === fallback.slug)) uniqueDeals.push(fallback);
    }

    return uniqueDeals.slice(0, 3);
  }, [packages]);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setIsOpen(true), 700);
    return () => window.clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const dismiss = () => {
    setIsOpen(false);
  };

  if (!isOpen || deals.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#041a24]/75 px-3 py-4 pt-[5.35rem] backdrop-blur-[3px] sm:p-6 sm:pt-24"
      role="presentation"
      onMouseDown={dismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="featured-deals-title"
        className="relative my-auto w-full max-w-[1030px] overflow-hidden rounded-[1.5rem] border border-white/30 bg-[#f7fbfb] shadow-[0_24px_90px_rgba(0,0,0,0.48)] animate-in fade-in zoom-in-95 duration-300"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_-40%,rgba(82,225,220,0.36),transparent_35%),linear-gradient(116deg,#063a50_0%,#075f6f_54%,#0f827e_100%)] px-5 pb-5 pt-5 text-white sm:px-7 sm:pb-6 sm:pt-6">
          <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border-[18px] border-white/10" />
          <div className="absolute bottom-0 left-[45%] h-24 w-24 rounded-full bg-amber-300/15 blur-3xl" />

          <button
            type="button"
            onClick={dismiss}
            aria-label="Close featured offers"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-slate-950/20 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:right-5 sm:top-5"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative pr-9 sm:pr-12">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/45 bg-amber-100/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">
              <Flame className="h-3.5 w-3.5 fill-current" /> Featured today
            </p>
            <h2 id="featured-deals-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Make your next river journey special.
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-medium leading-5 text-white/80 sm:text-base">
              A few handpicked cruises, temple tours and stays — choose one and book in just a few clicks.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {deals.map((pkg, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const price = Number(pkg.starting_price) || 1050;
              const imageSrc = pkg.cover_image_url || '/placeholder-tourism.jpg';

              return (
                <article
                  key={`${pkg.id}-${pkg.slug}`}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.surface} p-2.5 text-white shadow-[0_9px_20px_rgba(15,61,86,0.17)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,61,86,0.28)]`}
                >
                  <div className="flex items-center justify-between gap-2 px-1 pb-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/85">
                      <Ship className="h-3 w-3" /> {theme.label}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${theme.accent}`}>
                      Featured
                    </span>
                  </div>

                  <Link
                    href={`/packages/${pkg.slug}`}
                    onClick={dismiss}
                    className="block overflow-hidden rounded-xl border border-white/25 bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={`View ${pkg.title}`}
                  >
                    <div className="relative h-32 sm:h-36">
                      <Image
                        src={imageSrc}
                        alt={pkg.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 310px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-2 inline-flex max-w-[calc(100%-1rem)] items-center gap-1 truncate rounded-full bg-black/60 px-2 py-1 text-[9px] font-bold backdrop-blur-sm">
                        <MapPin className="h-3 w-3 shrink-0 text-amber-300" /> {pkg.place || pkg.region || 'Godavari'}
                      </span>
                    </div>
                  </Link>

                  <Link href={`/packages/${pkg.slug}`} onClick={dismiss} className="mt-2 block px-1 focus:outline-none focus:ring-2 focus:ring-white">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 tracking-tight">
                      {pkg.title}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[10px] font-semibold text-white/75">
                    <span className="inline-flex min-w-0 items-center gap-1 truncate">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" /> {pkg.duration || 'Flexible departure'}
                    </span>
                    <span className="shrink-0">From ₹{formatInr(price)}</span>
                  </div>

                  <Link
                    href={`/packages/${pkg.slug}?restore_pkg_checkout=true`}
                    onClick={dismiss}
                    className={`mt-3 flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white ${theme.accent}`}
                  >
                    Book this journey <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-bold text-slate-500 underline-offset-4 transition hover:text-[#0d8590] hover:underline"
            >
              Not now, continue exploring
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1 text-[11px] font-semibold text-slate-500 sm:inline-flex">
                <BadgeCheck className="h-4 w-4 text-[#1598a1]" /> Instant booking confirmation
              </span>
              <Link
                href="/packages"
                onClick={dismiss}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0f3d56] px-4 text-xs font-black text-white transition hover:bg-[#155b78] focus:outline-none focus:ring-2 focus:ring-[#1598a1] focus:ring-offset-2"
              >
                Explore all packages <Zap className="h-3.5 w-3.5 fill-current text-amber-300" />
              </Link>
            </div>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Verified operators, clear prices and support when you need it.
          </p>
        </div>
      </section>
    </div>
  );
}
