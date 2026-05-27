import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, CalendarCheck, Compass, Mountain, Navigation, Quote, ShieldCheck, Ship, Sparkles, Star, Waves } from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import RoomCard from '@/components/ui/RoomCard';
import HeroSlider from '@/components/ui/HeroSlider';
import HeroBody from '@/components/ui/HeroBody';
import { ShimmerGrid } from '@/components/ui/SkeletonLoader';
import { apiFetch } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Best Papikondalu Tours & Bhadrachalam Travel Packages',
  description:
    'Book trusted Papikondalu boat tours, Godavari river cruises, Kolluru bamboo huts and Bhadrachalam travel packages with Telangana Boat Tourism.',
  alternates: { canonical: '/' },
  keywords: [
    'best Papikondalu tours',
    'best Papikondalu travels',
    'Papikondalu boat booking',
    'Bhadrachalam tours',
    'best tours in TS Bhadrachalam',
    'Godavari river cruise',
    'Telangana Boat Tourism',
  ],
};


const DESTINATION_HIGHLIGHTS = [
  {
    title: 'Godavari River Cruise',
    copy: 'Slow water, green folds of Papikondalu and a route designed for families, pilgrims and first-time travellers.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/v1779431926/papikondalu-3_jg6thw.png',
    icon: Waves,
  },
  {
    title: 'Bhadrachalam Darshan',
    copy: 'Temple-first itineraries with clean pickup planning, local timing support and room options close to the journey.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432477/temple_0ciG4xn9_202402271449110_bck96x.jpg',
    icon: Sparkles,
  },
  {
    title: 'Papikondalu Nature Escape',
    copy: 'Hill views, bamboo stay extensions and camera-ready river stretches curated into simple package choices.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/v1779431872/maredumilli-13_mdqgmv.jpg',
    icon: Mountain,
  },
];

const TESTIMONIALS = [
  'The boat journey felt calm, organised and genuinely memorable for our family.',
  'Booking support was quick, reporting time was clear, and the Bhadrachalam plan was easy to follow.',
  'The rooms and cruise package felt thoughtfully matched for a weekend trip.',
];

type FeaturedPackage = {
  id: number;
  slug: string;
  title: string;
  type: string;
  region: string;
  cover_image_url: string | null;
  is_featured: boolean;
  tags: string[];
  starting_price: number | null;
};

type FeaturedRoom = {
  id: number;
  slug: string;
  lodge_name: string;
  cover_image_url: string | null;
  is_featured: boolean;
  starting_price: number | null;
  address: string | null;
  facilities: string[];
};

async function fetchFeaturedPackages() {
  try {
    const res = await apiFetch('/api/v1/packages?is_featured=true&size=3', {
      next: { revalidate: 30, tags: ['packages'] } 
    });
    if (!res.ok) throw new Error('Failed to fetch packages');
    const data = await res.json();
    return data.items as FeaturedPackage[];
  } catch (err) {
    console.error("Backend Server is unreachable or failed:", err);
    return null;
  }
}

async function fetchFeaturedRooms() {
  try {
    const res = await apiFetch('/api/v1/rooms?is_featured=true&size=3', {
      next: { revalidate: 60, tags: ['stays'] }
    });
    if (!res.ok) throw new Error('Failed to fetch rooms');
    const data = await res.json();
    return data.items as FeaturedRoom[];
  } catch (err) {
    console.error("Backend Server is unreachable or failed:", err);
    return null;
  }
}

export default async function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Telangana Boat Tourism',
    description: 'Book trusted Papikondalu boat tours, Godavari river cruises, Kolluru bamboo huts and Bhadrachalam travel packages.',
    url: 'https://www.tsboattourism.org',
    logo: 'https://res.cloudinary.com/dpdab3e97/image/upload/v1778912203/slider4_rikfsq.jpg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bhadrachalam',
      addressRegion: 'Telangana',
      addressCountry: 'IN'
    }
  };

  return (
    <div className="flex w-full flex-col overflow-hidden bg-[#f7f4ed]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ─── Cinematic Hero Section ─────────────────────────────────────── */}
      <section className="sticky top-0 w-full overflow-hidden bg-slate-950">
        {/* Background slider */}
        <div className="absolute inset-0 z-0">
          <HeroSlider />
        </div>
        {/* Foreground hero content */}
        <div className="relative z-10">
          <HeroBody />
        </div>
      </section>

      {/* Featured Packages */}
      <section className="relative z-20 rounded-t-[3rem] bg-[#f7f4ed] py-14 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] md:py-24">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-[#bdebf1]/35 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#f1d58a]/28 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[var(--color-brand-teal)] font-bold tracking-wider uppercase text-sm mb-2 block">Top Rated</span>
              <h2 className="text-3xl md:text-5xl font-black text-[var(--color-brand-river)]">Featured River Experiences</h2>
            </div>
            <Link href="/boat-rides" prefetch={false} className="hidden sm:flex items-center gap-1 text-[var(--color-brand-teal)] font-medium hover:gap-2 transition-all">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Suspense fallback={<ShimmerGrid count={3} />}>
            <FeaturedPackages />
          </Suspense>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/boat-rides" prefetch={false} className="inline-flex items-center gap-2 bg-white border border-border px-6 py-3 rounded-full font-medium text-[var(--color-brand-river)]">
              View All Experience Packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative bg-[var(--color-brand-river)] py-14 text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(90,196,215,0.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(229,218,197,0.22),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--color-brand-sand)]">Destination Highlights</span>
            <h2 className="text-3xl font-black md:text-5xl">A journey that moves from river calm to temple light.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {DESTINATION_HIGHLIGHTS.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={`group relative min-h-[25rem] overflow-hidden rounded-[1.75rem] ${index === 1 ? 'md:translate-y-8' : ''}`}>
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,22,34,0.05),rgba(4,22,34,0.82))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md">
                      <Icon className="h-5 w-5 text-[var(--color-brand-sand)]" />
                    </div>
                    <h3 className="text-2xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/78">{item.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="relative py-14 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[var(--color-brand-green)] font-bold tracking-wider uppercase text-sm mb-2 block">Where to Stay</span>
              <h2 className="text-3xl md:text-5xl font-black text-[var(--color-brand-river)]">Verified Riverside Stays</h2>
            </div>
            <Link href="/stays" prefetch={false} className="hidden sm:flex items-center gap-1 text-[var(--color-brand-teal)] font-medium hover:gap-2 transition-all">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Suspense fallback={<ShimmerGrid count={3} />}>
            <FeaturedRooms />
          </Suspense>
        </div>
      </section>

      <section className="bg-white py-14 pb-28 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <span className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-brand-teal)]">
              <Compass className="h-4 w-4" />
              Traveller Notes
            </span>
            <h2 className="text-3xl font-black text-[var(--color-brand-river)] md:text-5xl">Stories from quiet water, full days and better stays.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((text) => (
              <figure key={text} className="rounded-[1.35rem] border border-[#e7eee9] bg-[#f8fbfa] p-5 shadow-[0_14px_40px_rgba(15,61,86,0.08)]">
                <Quote className="mb-5 h-6 w-6 text-[var(--color-brand-teal)]" />
                <blockquote className="text-sm font-semibold leading-6 text-[var(--color-brand-river)]">{text}</blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

async function FeaturedPackages() {
  const packages = await fetchFeaturedPackages();

  return packages ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  ) : (
    <ShimmerGrid count={3} />
  );
}

async function FeaturedRooms() {
  const rooms = await fetchFeaturedRooms();

  return rooms ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} variant="grid" />
      ))}
    </div>
  ) : (
    <ShimmerGrid count={3} />
  );
}
