import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, CalendarCheck, Compass, Mountain, Navigation, Quote, ShieldCheck, Ship, Sparkles, Star, Waves } from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import RoomCard from '@/components/ui/RoomCard';
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

const HERO_SLIDES = [
  {
    src: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912203/slider4_rikfsq.jpg',
    alt: 'Godavari river flowing through Papikondalu hills',
  },
  {
    src: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg',
    alt: 'Scenic boat journey through Papikondalu',
  },
  {
    src: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912248/slider2_souyzb.jpg',
    alt: 'Papikondalu tourism landscape',
  },
  {
    src: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912273/slider3_bx3qsu.jpg',
    alt: 'Bhadrachalam and Godavari travel view',
  },
  {
    src: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912157/slider1_p9iape.jpg',
    alt: 'Papikondalu river cruise at sunrise',
  },
];

const DESTINATION_HIGHLIGHTS = [
  {
    title: 'Godavari River Cruise',
    copy: 'Slow water, green folds of Papikondalu and a route designed for families, pilgrims and first-time travellers.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg',
    icon: Waves,
  },
  {
    title: 'Bhadrachalam Darshan',
    copy: 'Temple-first itineraries with clean pickup planning, local timing support and room options close to the journey.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912273/slider3_bx3qsu.jpg',
    icon: Sparkles,
  },
  {
    title: 'Papikondalu Nature Escape',
    copy: 'Hill views, bamboo stay extensions and camera-ready river stretches curated into simple package choices.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912248/slider2_souyzb.jpg',
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
      next: { revalidate: 60, tags: ['packages'] } // Revalidate every minute
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
    url: 'https://telanganaboattourism.com', // Update with actual domain
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
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[calc(100svh-4rem)] w-full overflow-hidden bg-[var(--color-brand-river)]">
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.src}
              className="hero-cinema-slide absolute inset-0 opacity-0"
              style={{ animationDelay: `${index * 6}s` }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index <= 1}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,22,34,0.92),rgba(15,61,86,0.66)_43%,rgba(15,61,86,0.22)_70%),linear-gradient(0deg,rgba(3,22,34,0.82),rgba(3,22,34,0.04)_54%,rgba(3,22,34,0.42))]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08293d] to-transparent" />
          <div className="hero-light-sweep absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white shadow-xl backdrop-blur-md sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand-sand)]" />
                Official Papikondalu & Bhadrachalam Booking
              </span>
              <h1 className="mt-5 text-4xl font-black leading-[1.02] text-white drop-shadow-xl sm:text-5xl md:text-6xl xl:text-7xl">
                Premium Pappikondalu Boat Rides & Stays
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/88 drop-shadow-md sm:text-lg md:text-xl md:leading-8">
                Experience scenic Godavari river cruises, exciting sightseeing journeys, and authentic riverside bamboo huts with official booking support from Telangana Boat Tourism.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/boat-rides"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-sand)] px-6 py-3.5 text-sm font-bold text-[#0a3147] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-1 hover:bg-white sm:text-base"
                >
                  <Ship className="h-5 w-5" />
                  Explore Boat Rides
                </Link>
                <Link
                  href="/stays"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a6b7a] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:text-[#1a6b7a] sm:text-base"
                >
                  <CalendarCheck className="h-5 w-5" />
                  Book Riverside Stays
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/85">
                {['Godavari boat rides', 'Riverside stays', 'Sightseeing cruises', 'Family package options', 'Aadhaar verified booking'].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="ml-auto max-w-sm border-l border-white/20 pl-8 text-white">
                <div className="flex items-center gap-2 text-[var(--color-brand-sand)]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-xl font-semibold leading-snug xl:text-2xl">
                  A polished Godavari journey with quick booking help, clean itinerary choices and local expertise.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-brand-sand)]">20+</div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-white/60">Years</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[var(--color-brand-sand)]">100k+</div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-white/60">Travellers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 rounded-[1.75rem] border border-white/50 bg-white/90 p-4 text-center shadow-[0_24px_70px_rgba(15,61,86,0.16)] backdrop-blur-xl md:grid-cols-3 md:p-5">
            <div className="flex flex-col items-center rounded-[1.25rem] bg-[#f8fbfa] px-4 py-6">
              <ShieldCheck className="h-10 w-10 text-[var(--color-brand-teal)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-brand-river)] mb-2">Verified & Secure</h3>
              <p className="text-muted-foreground text-sm">Official government-approved tourism boats and lodges.</p>
            </div>
            <div className="flex flex-col items-center rounded-[1.25rem] bg-[#f8fbfa] px-4 py-6">
              <Ship className="h-10 w-10 text-[var(--color-brand-teal)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-brand-river)] mb-2">Premium Experience</h3>
              <p className="text-muted-foreground text-sm">A/C luxury boats, delicious food, and comfortable stays.</p>
            </div>
            <div className="flex flex-col items-center rounded-[1.25rem] bg-[#f8fbfa] px-4 py-6">
              <Navigation className="h-10 w-10 text-[var(--color-brand-teal)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-brand-river)] mb-2">Seamless Booking</h3>
              <p className="text-muted-foreground text-sm">Instant confirmation, digital tickets, and 24/7 support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="relative py-14 md:py-24">
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
