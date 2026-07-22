import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Landmark,
  Phone,
  ShieldCheck,
  Ship,
  Sparkles,
  Waves,
} from 'lucide-react';
import PackageCard from '@/components/ui/PackageCard';
import RoomCard from '@/components/ui/RoomCard';
import GoogleReviewsCarousel from '@/components/ui/GoogleReviewsCarousel';
import { ShimmerGrid } from '@/components/ui/SkeletonLoader';
import { apiFetch } from '@/lib/api';

export const metadata: Metadata = {
  title: 'TS Boat Tourism | Papikondalu Tours, Bhadrachalam & Godavari River Packages',
  description:
    'Book Papikondalu boat tours, Bhadrachalam temple packages, Godavari river cruises, and Kolluru bamboo hut stays with TS Boat Tourism.',
  alternates: { canonical: '/' },
  keywords: [
    'TS Boat Tourism',
    'Papikondalu boat booking',
    'Bhadrachalam temple packages',
    'Godavari river cruise',
    'Papikondalu packages from Hyderabad',
    'Bhadrachalam to Papikondalu boat ride',
    'Kolluru bamboo huts booking',
    'boat rides Telangana',
  ],
};

const HERO_PACKAGES = [
  {
    title: 'Papikondalu Boat Cruise',
    desc: 'Godavari river journey through hill valleys with meals and boarding guidance.',
    href: '/packages?place=papikondalu',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431926/papikondalu-3_jg6thw.png',
    meta: 'Same day and 2D options',
    icon: Ship,
  },
  {
    title: 'Bhadrachalam Temple + Boat',
    desc: 'Plan Sri Rama darshan with transport, river timing support and family packages.',
    href: '/packages?place=bhadrachalam',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432477/temple_0ciG4xn9_202402271449110_bck96x.jpg',
    meta: 'Pilgrimage friendly',
    icon: Landmark,
  },
  {
    title: 'Kolluru Riverside Stay',
    desc: 'Bamboo hut stays, nature views and relaxed overnight Godavari experiences.',
    href: '/packages?place=kolluru',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg',
    meta: '2 days / 1 night',
    icon: Waves,
  },
];

const EXPERIENCE_INFO = [
  {
    title: 'Boat Experience',
    desc: 'Scenic Godavari sailing, Papikondalu hill views, clean boarding guidance, meal-inclusive options and AC / Non-AC choices.',
    image: '/home/hero-boat.jpg',
    points: ['Papikondalu valley route', 'Family seating options', 'Meals and timing support'],
  },
  {
    title: 'Bhadrachalam Temple Experience',
    desc: 'Plan Sri Sita Ramachandra Swamy temple darshan with a smooth travel route, nearby stays and Godavari river extensions.',
    image: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432477/temple_0ciG4xn9_202402271449110_bck96x.jpg',
    points: ['Temple-first itinerary', 'Pilgrim group support', 'Stay and transport add-ons'],
  },
];

const TRUST_ITEMS = [
  { value: '20+', label: 'Years of Service' },
  { value: '1L+', label: 'Happy Travellers' },
  { value: '10,000+', label: 'Bookings Served' },
  { value: '100%', label: 'Secure Payments' },
];

const GOOGLE_REVIEW_URL = 'https://share.google/QH1HqWMDXerEUGu3N';
const GOOGLE_WRITE_REVIEW_URL = 'https://g.page/r/CckJDR74rmzBEAI/review';

const GOOGLE_REVIEWS = [
  {
    text: 'One of the best boat journey. Each and every one has to be ride this journey their life atleast.thanks ts boat tourism',
    name: 'Bhanu Kumar',
    time: '3 months ago',
    rating: 5,
  },
  {
    text: 'One of the best boat journey. Thanks TS Boat Tourism. I have small suggestion for boat tourism team, kindly update on website daily how many boats are travelled by every day.',
    name: 'I Am Hari',
    time: 'a year ago',
    rating: 5,
  },
  {
    text: 'Papikodal boating very good experience.boatig so excited.ts boat tourism services good.',
    name: 'Bagula Srinivas',
    time: 'a year ago',
    rating: 5,
  },
  {
    text: 'Ts boat tourism papikondalu good service food',
    name: 'Akkineni Srikanth',
    time: 'a year ago',
    rating: 5,
  },
  {
    text: 'This responsibility office in boarding office number One',
    name: 'guguloth bhima',
    time: '3 months ago',
    rating: 5,
  },
  {
    text: 'Its was soo good, i enjoyed thoroughly, booking, food, transport and boating everything super',
    name: 'Raghu Lee',
    time: '8 months ago',
    rating: 5,
  },
  {
    text: 'Best friend journey Papikondalu',
    name: 'Chinnapareddy 5081',
    time: 'a year ago',
    rating: 5,
  },
];

const FALLBACK_PACKAGES = [
  {
    id: 1,
    slug: 'hyderabad-kolluru-huts-3-days',
    title: 'Hyderabad To Kolluru Huts 3 Days Tour',
    type: 'PACKAGE',
    duration: '3 Days / 2 Nights',
    place: 'Kolluru Huts',
    region: 'AP',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431926/papikondalu-3_jg6thw.png',
    is_featured: true,
    tags: ['Cruise + Stay', 'Best Seller'],
    starting_price: 4500,
    transport_info: 'Train Sleeper / AC Coach',
    variants: [
      { id: 101, title: 'Standard Train Sleeper Package', adult_price: 4500, child_price: 4000, weekend_adult_price: 4800, weekend_child_price: 4200, is_active: true }
    ]
  },
  {
    id: 2,
    slug: 'bhadrachalam-rajahmundry-1-day',
    title: 'Bhadrachalam To Rajahmundry 1Day Tour',
    type: 'PACKAGE',
    duration: '1 Day',
    place: 'Rajahmundry',
    region: 'AP',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432477/temple_0ciG4xn9_202402271449110_bck96x.jpg',
    is_featured: true,
    tags: ['Sightseeing', 'Popular'],
    starting_price: 2500,
    transport_info: 'Luxury Boat Cruise',
    variants: [
      { id: 102, title: 'Day Cruise Package', adult_price: 2500, child_price: 2200, is_active: true }
    ]
  },
  {
    id: 3,
    slug: 'bhadrachalam-kolluru-huts-2-days',
    title: 'Bhadrachalam To Kolluru Huts 2 Days Tour',
    type: 'PACKAGE',
    duration: '2 Days / 1 Night',
    place: 'Kolluru Huts',
    region: 'AP',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg',
    is_featured: true,
    tags: ['Cruise + Stay', 'Nature Huts'],
    starting_price: 4000,
    transport_info: 'Boat Cruise + Bamboo Stay',
    variants: [
      { id: 103, title: 'Bamboo Hut Stay Package', adult_price: 4000, child_price: 3500, is_active: true }
    ]
  },
];

const FALLBACK_ROOMS = [
  {
    id: 1,
    slug: 'bhadrachalam-riverside-lodge',
    lodge_name: 'Bhadrachalam Temple View Lodge',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg',
    is_featured: true,
    starting_price: 1800,
    starting_weekend_price: 2200,
    address: 'Near Temple Road, Bhadrachalam',
    facilities: ['A/C', 'Wi-Fi', 'Hot Water', 'Room Service'],
  },
  {
    id: 2,
    slug: 'kolluru-river-huts',
    lodge_name: 'Kolluru Bamboo River Huts',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431926/papikondalu-3_jg6thw.png',
    is_featured: true,
    starting_price: 2500,
    starting_weekend_price: 3000,
    address: 'Kolluru Sandbanks, Papikondalu',
    facilities: ['Meals Included', 'River View', 'Hot Water'],
  },
  {
    id: 3,
    slug: 'rajahmundry-deluxe-stay',
    lodge_name: 'Godavari View Deluxe Stay',
    cover_image_url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432477/temple_0ciG4xn9_202402271449110_bck96x.jpg',
    is_featured: true,
    starting_price: 1500,
    starting_weekend_price: 1800,
    address: 'Rajahmundry Pushkar Ghat Road',
    facilities: ['A/C', 'Car Parking', 'Wi-Fi'],
  },
];

type FeaturedPackage = {
  id: number;
  slug: string;
  title: string;
  type: string;
  duration?: string | null;
  place?: string | null;
  region: string;
  cover_image_url: string | null;
  is_featured: boolean;
  is_student_package?: boolean;
  tags: string[];
  starting_price: number | null;
  variants?: Array<{
    id: number;
    title: string;
    adult_price: number;
    child_price: number;
    weekend_adult_price?: number;
    weekend_child_price?: number;
    student_price?: number;
    weekend_student_price?: number;
    transport_info?: string | null;
    is_active: boolean;
  }>;
};

type RoomItem = {
  id: number;
  slug: string;
  lodge_name: string;
  cover_image_url: string | null;
  is_featured: boolean;
  starting_price: number | null | string;
  starting_weekend_price?: number | null | string;
  address: string | null;
  facilities: string[];
};

async function fetchFeaturedPackages() {
  try {
    const res = await apiFetch('/api/v1/packages?is_featured=true&size=3', {
      next: { revalidate: 43200, tags: ['packages'] },
    });
    if (!res.ok) throw new Error('Failed to fetch packages');
    const data = await res.json();
    return data.items as FeaturedPackage[];
  } catch (err) {
    console.error('Backend unreachable:', err);
    return null;
  }
}

async function fetchFeaturedRooms() {
  try {
    const res = await apiFetch('/api/v1/rooms?is_featured=true&size=3', {
      next: { revalidate: 43200, tags: ['rooms'] },
    });
    if (!res.ok) throw new Error('Failed to fetch rooms');
    const data = await res.json();
    return data.items as RoomItem[];
  } catch (err) {
    console.error('Backend unreachable for rooms:', err);
    return null;
  }
}

async function fetchHeroPackages() {
  try {
    const res = await apiFetch('/api/v1/packages?size=15', {
      next: { revalidate: 43200, tags: ['packages'] },
    });
    if (!res.ok) throw new Error('Failed to fetch packages');
    const data = await res.json();
    return data.items as FeaturedPackage[];
  } catch (err) {
    console.error('Backend unreachable:', err);
    return null;
  }
}

export default async function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'TS Boat Tourism',
    description: 'Book Papikondalu boat tours, Bhadrachalam temple trips, Godavari cruises and Kolluru stays.',
    url: 'https://www.tstelanganatourism.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bhadrachalam',
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
  };

  const packages = await fetchHeroPackages();
  const displayPackages = (packages && packages.length > 0)
    ? packages.map(pkg => ({
        title: pkg.title,
        desc: pkg.duration || (pkg.type === 'TOUR' ? '1 Day (Same Day)' : '2 Days / 1 Night'),
        href: `/packages/${pkg.slug}`,
        image: pkg.cover_image_url || 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431926/papikondalu-3_jg6thw.png',
        meta: pkg.type === 'TOUR' ? 'Boat Tour' : pkg.type === 'STAY' ? 'River Stay' : 'Sightseeing',
      }))
    : HERO_PACKAGES;

  return (
    <main className="w-full overflow-x-clip bg-[#f6faf8] text-[#0f2f3d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative isolate overflow-hidden bg-[#eaf7f6]">
        <Image
          src="/home/godavari-hero-banner.jpg"
          alt="Godavari boat experience in Papikondalu"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,28,36,0.88)_0%,rgba(6,55,63,0.68)_48%,rgba(232,247,247,0.24)_100%)]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-92px)] lg:h-[calc(100dvh-92px)] w-full max-w-[1800px] items-center gap-8 px-4 py-4 lg:py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:px-8 xl:px-12">
          <div className="max-w-4xl py-4 text-white lg:py-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#35c6ca]/45 bg-[#1598a1]/18 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a7f3f4] backdrop-blur-md sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Since 2004 · Papikondalu &amp; Bhadrachalam river cruises
            </div>

            <h1 className="max-w-4xl text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[2.75rem] xl:text-[3.5rem] 2xl:text-[4.2rem]">
              TS Boat Tourism river cruises for Papikondalu and Bhadrachalam.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              TS BOAT TOURISM is a pioneer in providing tourism and travel services to highly popular tourist destinations in and around Rajahmundry. Started in the year 2004, we have been providing services to Papikondalu and Bhadrachalam by River Cruises.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#1598a1] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(21,152,161,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#117f87] sm:text-base"
              >
                View Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+919542069573"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/28 bg-white/12 px-7 text-sm font-black text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/18 sm:text-base"
              >
                <Phone className="h-4 w-4" /> Talk to Booking Team
              </a>
            </div>

            <div className="mt-6 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-md border border-white/18 bg-white/18 sm:grid-cols-4">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="bg-[#06333c]/66 p-3 backdrop-blur">
                  <p className="text-xl font-black text-[#8eecee] sm:text-2xl">{item.value}</p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/58">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-6 lg:pb-0">
            <div className="rounded-xl border border-white/10 bg-white p-4 shadow-[0_24px_70px_rgba(15,61,86,0.16)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-1 pb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1598a1]">Start Here</p>
                  <h2 className="mt-0.5 text-lg font-black text-[#0f2f3d]">Find your package</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-md bg-[#eef8f8] text-[#1598a1]">
                  <Ship className="h-4 w-4" />
                </span>
              </div>

              <div className="relative h-[256px] overflow-hidden mt-3 [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]">
                <div 
                  className="marquee-container animate-marquee-vertical flex flex-col gap-2.5"
                  style={{ animationDuration: `${displayPackages.length * 6.5}s` }}
                >
                  {/* First iteration */}
                  {displayPackages.map((item, idx) => (
                    <Link key={`hero-pkg-${idx}`} href={item.href} className="group grid grid-cols-[4.5rem_minmax(0,1fr)_1.25rem] items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2 pr-3 transition-all hover:scale-[1.01] hover:border-[#1598a1] hover:bg-[#f6fbfb] shadow-sm">
                      <span className="relative h-14 w-18 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </span>
                      <span className="min-w-0 pr-1">
                        <span className="mb-0.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#1598a1]">
                          <Ship className="h-3 w-3 shrink-0" />
                          {item.meta}
                        </span>
                        <span className="block text-xs font-black leading-4 text-[#0f2f3d] line-clamp-1">{item.title}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[10px] font-semibold leading-3 text-slate-500">{item.desc}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1598a1]" />
                    </Link>
                  ))}
                  
                  {/* Second iteration for seamless looping */}
                  {displayPackages.map((item, idx) => (
                    <Link key={`hero-pkg-loop-${idx}`} href={item.href} className="group grid grid-cols-[4.5rem_minmax(0,1fr)_1.25rem] items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2 pr-3 transition-all hover:scale-[1.01] hover:border-[#1598a1] hover:bg-[#f6fbfb] shadow-sm" aria-hidden="true">
                      <span className="relative h-14 w-18 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </span>
                      <span className="min-w-0 pr-1">
                        <span className="mb-0.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#1598a1]">
                          <Ship className="h-3 w-3 shrink-0" />
                          {item.meta}
                        </span>
                        <span className="block text-xs font-black leading-4 text-[#0f2f3d] line-clamp-1">{item.title}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[10px] font-semibold leading-3 text-slate-500">{item.desc}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1598a1]" />
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/packages" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0f3d56] px-4 text-sm font-black text-white transition-colors hover:bg-[#15506a]">
                Browse All Packages <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1598a1]">Packages and experiences</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-[#0f2f3d] md:text-5xl">Boat rides, temple plans and river stays in one clean booking flow.</h2>
            </div>
            <Link href="/packages" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#1598a1] px-5 text-sm font-black text-white transition-colors hover:bg-[#117f87]">
              Browse Packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {EXPERIENCE_INFO.map((item) => (
              <article key={item.title} className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,61,86,0.06)] md:grid-cols-[42%_1fr]">
                <div className="relative min-h-[18rem] md:min-h-full">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1598a1]">Experience Guide</p>
                  <h2 className="mt-2 text-2xl font-black text-[#0f2f3d] md:text-3xl">{item.title}</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{item.desc}</p>
                  <div className="mt-5 grid gap-3">
                    {item.points.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-sm font-black text-[#0f2f3d]">
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

      {/* Split Section: Featured Packages (Left) & Featured Stays/Rooms (Right) */}
      <section className="bg-[#0f3d56] py-12 text-white md:py-20">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12">
          
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#8eecee] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Handpicked Destinations &amp; Stays
            </span>
            <h2 className="mt-3 text-3xl font-black md:text-5xl tracking-tight">
              Top Tour Packages &amp; Riverside Accommodations
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/70 sm:text-base">
              Choose from our popular Godavari river cruise packages or book comfortable hotel rooms and riverside bamboo huts.
            </p>
          </div>

          <Suspense fallback={<ShimmerGrid count={6} />}>
            <FeaturedPackagesAndRooms />
          </Suspense>

        </div>
      </section>

      <GoogleReviewsCarousel
        reviews={GOOGLE_REVIEWS}
        profileUrl={GOOGLE_REVIEW_URL}
        writeReviewUrl={GOOGLE_WRITE_REVIEW_URL}
      />

      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto grid max-w-[1800px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 xl:px-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1598a1]">Need help choosing?</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-[#0f2f3d] md:text-5xl">Call us before you book. We will help you pick the right package.</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
              Tell us your travel date, family size, pickup needs and temple plan. We will guide you to the best available boat or package.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem]">
            <a href="tel:+919542069573" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-md bg-[#1598a1] px-6 text-sm font-black text-white transition-colors hover:bg-[#117f87]">
              <Phone className="h-4 w-4" />
              Call Now
            </a>
            <a href="https://wa.me/919542069573" target="_blank" rel="noreferrer" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-6 text-sm font-black text-[#0f3d56] transition-colors hover:bg-[#eef8f8]">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

async function FeaturedPackagesAndRooms() {
  const [packages, rooms] = await Promise.all([
    fetchFeaturedPackages(),
    fetchFeaturedRooms(),
  ]);

  const displayPkgs = (packages && packages.length > 0) ? packages.slice(0, 3) : null;
  const displayRooms = (rooms && rooms.length > 0) ? rooms.slice(0, 3) : FALLBACK_ROOMS;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-12">
      {/* LEFT COLUMN: Featured Tour Packages (3 Items) */}
      <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1598a1] text-white">
              <Ship className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-black text-white">Featured Packages</h3>
              <p className="text-xs font-semibold text-[#8eecee]">Top 3 Godavari Tour Packages</p>
            </div>
          </div>
          <Link
            href="/packages"
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#8eecee] transition-colors hover:text-white"
          >
            View All ({packages?.length || 3}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {displayPkgs ? (
          <div className="grid grid-cols-3 gap-3">
            {displayPkgs.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} priority={index < 2} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {FALLBACK_PACKAGES.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg as any} priority={index < 2} variant="compact" />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Featured Rooms & Accommodations (3 Items) */}
      <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#b45309] text-white">
              <BedDouble className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-black text-white">Hotels &amp; Bamboo Stays</h3>
              <p className="text-xs font-semibold text-amber-300">Top 3 Accommodations</p>
            </div>
          </div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-300 transition-colors hover:text-white"
          >
            View All Rooms <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {displayRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} variant="compact" priority={index < 2} />
          ))}
        </div>
      </div>
    </div>
  );
}

