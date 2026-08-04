import React from 'react';
import type { Metadata } from 'next';
import HomeContent from '@/components/ui/HomeContent';
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

export type HeroItem = {
  title: string;
  /** Duration for packages, address for rooms */
  desc: string;
  href: string;
  image: string;
  /** Badge label shown under the image */
  meta: string;
  itemType: 'package' | 'room';
};

export type FeaturedPackage = {
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

export type RoomItem = {
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

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchFeaturedPackages(): Promise<FeaturedPackage[] | null> {
  try {
    const res = await apiFetch('/api/v1/packages?is_featured=true&size=3', {
      next: { revalidate: 43200, tags: ['packages'] },
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.items as FeaturedPackage[];
  } catch {
    return null;
  }
}

/** Fetches up to 20 packages for the hero scrolling card */
async function fetchHeroPackages(): Promise<FeaturedPackage[] | null> {
  try {
    const res = await apiFetch('/api/v1/packages?size=20', {
      next: { revalidate: 43200, tags: ['packages'] },
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.items as FeaturedPackage[];
  } catch {
    return null;
  }
}

/** Fetches ALL rooms (up to 20) for the hero scrolling card */
async function fetchAllRooms(): Promise<RoomItem[] | null> {
  try {
    const res = await apiFetch('/api/v1/rooms?size=20', {
      next: { revalidate: 43200, tags: ['rooms'] },
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.items as RoomItem[];
  } catch {
    return null;
  }
}

/** Fetches 3 featured rooms for the "Featured Stays" section */
async function fetchFeaturedRooms(): Promise<RoomItem[] | null> {
  try {
    const res = await apiFetch('/api/v1/rooms?is_featured=true&size=3', {
      next: { revalidate: 43200, tags: ['rooms'] },
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.items as RoomItem[];
  } catch {
    return null;
  }
}

// ─── Fallback data (shown when API is down) ──────────────────────────────────

const HERO_ITEMS_FALLBACK: HeroItem[] = [
  {
    title: 'Papikondalu Boat Cruise',
    desc: 'Godavari river journey through hill valleys with meals and boarding guidance.',
    href: '/packages?place=papikondalu',
    image: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
    meta: 'Boat Tour',
    itemType: 'package',
  },
  {
    title: 'Kolluru Bamboo River Huts',
    desc: 'Kolluru Sandbanks, Papikondalu',
    href: '/stays',
    image: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    meta: 'River Stay',
    itemType: 'room',
  },
  {
    title: 'Bhadrachalam Temple + Boat',
    desc: 'Plan Sri Rama darshan with transport and river timing support.',
    href: '/packages?place=bhadrachalam',
    image: 'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
    meta: 'Sightseeing',
    itemType: 'package',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'TS Boat Tourism',
    description:
      'Book Papikondalu boat tours, Bhadrachalam temple trips, Godavari cruises and Kolluru stays.',
    url: 'https://www.tstelanganatourism.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bhadrachalam',
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
  };

  // Run all fetches in parallel for best performance
  const [heroPackagesRaw, allRoomsRaw, featuredPackages, featuredRooms] =
    await Promise.all([
      fetchHeroPackages(),
      fetchAllRooms(),
      fetchFeaturedPackages(),
      fetchFeaturedRooms(),
    ]);

  // Build unified hero items: packages first, then rooms, interleaved
  let heroItems: HeroItem[] = HERO_ITEMS_FALLBACK;

  const pkgItems: HeroItem[] = (heroPackagesRaw ?? []).map((pkg) => ({
    title: pkg.title,
    desc:
      pkg.duration ||
      (pkg.type === 'TOUR' ? '1 Day (Same Day)' : '2 Days / 1 Night'),
    href: `/packages/${pkg.slug}`,
    image:
      pkg.cover_image_url ||
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
    meta:
      pkg.type === 'TOUR'
        ? 'Boat Tour'
        : pkg.type === 'STAY'
        ? 'River Stay'
        : 'Sightseeing',
    itemType: 'package',
  }));

  const roomItems: HeroItem[] = (allRoomsRaw ?? []).map((room) => ({
    title: room.lodge_name,
    desc: room.address || 'Riverside accommodation',
    href: `/stays/${room.slug}`,
    image:
      room.cover_image_url ||
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    meta: 'River Stay',
    itemType: 'room',
  }));

  // Interleave packages and rooms so both appear in the scroll
  if (pkgItems.length > 0 || roomItems.length > 0) {
    const combined: HeroItem[] = [];
    const maxLen = Math.max(pkgItems.length, roomItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < pkgItems.length) combined.push(pkgItems[i]);
      if (i < roomItems.length) combined.push(roomItems[i]);
    }
    heroItems = combined;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent
        heroItems={heroItems}
        featuredPackages={featuredPackages}
        rooms={featuredRooms}
      />
    </>
  );
}
