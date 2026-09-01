import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import BookingFlowClient from './BookingFlowClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Instant Static Package Definitions (0ms Load Time) ───────────────────────
const PACKAGES_REGISTRY: Record<
  string,
  {
    slug: string;
    title: string;
    duration: string | null;
    place: string | null;
    cover_image_url: string | null;
    starting_price: number | null;
    type: string;
    tags: string[];
  }
> = {
  'bhadrachalam-to-papikondalu-sirivaka-bamboo-huts-2-days': {
    slug: 'bhadrachalam-to-papikondalu-sirivaka-bamboo-huts-2-days',
    title: 'Bhadrachalam to Papikondalu Sirivaka Bamboo Huts (2 Days Package)',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Sirivaka Bamboo Huts - Bhadrachalam',
    starting_price: 5000,
    type: 'TOUR',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    tags: ['Bamboo Huts', 'Godavari Cruise', 'All Meals Included'],
  },
  'bhadrachalam-to-papikondalu-sirivaka-wooden-cottage-2-days': {
    slug: 'bhadrachalam-to-papikondalu-sirivaka-wooden-cottage-2-days',
    title: 'Bhadrachalam to Papikondalu (Sirivaka) Wooden Cottage Package (2 Days)',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Sirivaka Wooden Cottages - Bhadrachalam',
    starting_price: 5500,
    type: 'TOUR',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg',
    tags: ['Wooden Cottages', 'Scenic Hill Stay', 'AC Cottages'],
  },
  'bhadrachalam-to-papikondalu-maredumilli-2-days': {
    slug: 'bhadrachalam-to-papikondalu-maredumilli-2-days',
    title: 'Bhadrachalam to Papikondalu & Maredumilli Forest Resorts (2 Days Package)',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Maredumilli Forest Resorts - Pamuleru Waterfalls',
    starting_price: 5500,
    type: 'TOUR',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
    tags: ['Maredumilli Resorts', 'Waterfalls', 'Jungle Safari'],
  },
  'bhadrachalam-to-papikondalu-one-day-tour': {
    slug: 'bhadrachalam-to-papikondalu-one-day-tour',
    title: 'Bhadrachalam to Papikondalu One Day Boat Tour Package',
    duration: '1 Day',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Bhadrachalam',
    starting_price: 990,
    type: 'TRIP',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp',
    tags: ['Day Cruise', 'Breakfast & Lunch', 'Temple Visit'],
  },
  'bhadrachalam-to-papikondalu-boat-rajahmundry-package': {
    slug: 'bhadrachalam-to-papikondalu-boat-rajahmundry-package',
    title: 'Bhadrachalam to Papikondalu Boat Cruise with Rajahmundry Drop',
    duration: '1 Day',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Purushothapatnam - Rajahmundry',
    starting_price: 2200,
    type: 'TOUR',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
    tags: ['One-Way Cruise', 'Rajahmundry Drop', 'Full Day Trip'],
  },
  'rajahmundry-to-papikondalu-bhadrachalam-package': {
    slug: 'rajahmundry-to-papikondalu-bhadrachalam-package',
    title: 'Rajahmundry to Papikondalu Boat with Bhadrachalam Drop',
    duration: '1 Day',
    place: 'Rajahmundry - Purushothapatnam - Papikondalu - Perantapalli - Pochavaram - Bhadrachalam',
    starting_price: 2200,
    type: 'TOUR',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1786941607/ts_tours/ou4bikypctyozwhizlic.jpg',
    tags: ['River Gorge Cruise', 'Bhadrachalam Drop', 'Temple Darshan'],
  },
};

// Fast API loader with 1.5s timeout fallback
async function fetchPackage(slug: string) {
  if (PACKAGES_REGISTRY[slug]) {
    return PACKAGES_REGISTRY[slug];
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await apiFetch(`/api/v1/packages/${slug}`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = PACKAGES_REGISTRY[slug] || (await fetchPackage(slug));
  if (!pkg) return { title: 'Pre-Book Package | TS Boat Tourism' };
  return {
    title: `Pre-Book ${pkg.title} | TS Boat Tourism`,
    description: `Pre-book your ${pkg.title} for September 2026. Free early access — no payment needed. Helpline: +91 99513 69573`,
  };
}

export default async function PreBookingSlugPage({ params }: Props) {
  const { slug } = await params;

  // Instant lookup from registry
  const pkg = PACKAGES_REGISTRY[slug] || (await fetchPackage(slug));
  if (!pkg) notFound();

  return <BookingFlowClient pkg={pkg} />;
}
