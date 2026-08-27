import { notFound } from 'next/navigation';
import { cache } from 'react';
import { apiFetch } from '@/lib/api';
import { RoomDetailExperience } from '@/components/rooms/detail/RoomDetailExperience';
import CouponPopup from '@/components/ui/CouponPopup';

// ISR: revalidate every 12 hours OR instantly when admin triggers /api/revalidate
export const revalidate = 43200;
export const dynamicParams = true;

/**
 * Pre-build all published room/stay pages at compile time.
 * Without this, the first visitor to any stay URL waits for a full SSR round-trip.
 */
export async function generateStaticParams() {
  try {
    const res = await apiFetch('/api/v1/rooms?size=200&page=1', {
      next: { revalidate: 43200, tags: ['rooms'] }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: Array<{ slug: string }> = data?.items ?? [];
    return items
      .filter((r) => typeof r.slug === 'string' && r.slug.length > 0)
      .map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}


type RoomVariant = { id: number; variant_name: string; weekday_price: number; weekend_price: number; capacity_per_room?: number };
type RoomDetail = {
  id: number;
  slug: string;
  lodge_name: string;
  description?: string | null;
  address?: string | null;
  cover_image_url?: string | null;
  video_url?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_featured: boolean;
  starting_price?: number | null;
  total_rooms?: number | null;
  slot_start?: string | null;
  slot_end?: string | null;
  booking_slots?: Array<{ title: string; slot_start: string; slot_end: string }>;
  facilities: string[];
  variants: RoomVariant[];
  gallery: Array<{ id: number; image_url: string; alt_text?: string | null; is_cover: boolean }>;
  highlights: Array<{ id: number; title: string; icon?: string | null; sort_order: number }>;
  faqs: Array<{ id: number; question: string; answer: string; sort_order: number }>;
  policies: Array<{ id: number; type: string; title: string; description: string; sort_order: number }>;
};

const fetchRoomDetail = cache(async (slug: string): Promise<RoomDetail | null> => {
  try {
    const res = await apiFetch(`/api/v1/rooms/${slug}`, {
      next: { revalidate: 43200, tags: ['rooms', `room:${slug}`] }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await fetchRoomDetail(slug);
  if (!room) return { title: 'Stay Not Found' };
  const description = room.meta_description || room.description?.replace(/<[^>]+>/g, '').slice(0, 160) || `${room.lodge_name} stay booking in Bhadrachalam with modern amenities, policies, and verified tourism lodging support.`;

  const image = room.og_image_url || room.cover_image_url;
  const absImage = image ? (image.startsWith('http') ? image : `https://www.tstelanganatourism.com${image}`) : undefined;

  return {
    title: room.meta_title || `${room.lodge_name} | Premium Riverside Stay`,
    description,
    alternates: { canonical: room.canonical_url || `/stays/${room.slug}` },
    openGraph: {
      title: room.meta_title || room.lodge_name,
      description,
      images: absImage ? [{ url: absImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: room.meta_title || room.lodge_name,
      description,
      images: absImage ? [absImage] : [],
    },
  };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await fetchRoomDetail(slug);
  if (!room) notFound();

  const gallery = room.gallery || [];
  const heroImage = room.cover_image_url || gallery.find((image) => image?.is_cover)?.image_url || gallery[0]?.image_url;
  const variants = room.variants || [];
  const price = Number(room.starting_price || variants[0]?.weekday_price || 0);
  const canonical = room.canonical_url || `/stays/${room.slug}`;

  // Ensure all JSON-LD URLs are absolute — schema.org mandates fully-qualified URLs.
  const SITE_ORIGIN = 'https://www.tstelanganatourism.com';
  const abs = (url?: string | null) =>
    url ? (url.startsWith('http') ? url : `${SITE_ORIGIN}${url}`) : undefined;

  const absoluteCanonical = abs(canonical)!;
  const absoluteHeroImage = abs(heroImage);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: room.lodge_name,
      description: room.description,
      image: absoluteHeroImage,
      url: absoluteCanonical,
      // priceRange is a recommended property that helps Google display pricing in rich results.
      priceRange: price > 0 ? `₹${price}+` : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: room.address || '',
        addressLocality: 'Bhadrachalam',
        addressRegion: 'Telangana',
        addressCountry: 'IN',
      },
      amenityFeature: (room.facilities || []).map((facility) => ({
        '@type': 'LocationFeatureSpecification',
        name: facility,
        value: true,
      })),
      makesOffer: {
        '@type': 'Offer',
        price,
        priceCurrency: 'INR',
        url: absoluteCanonical,
      },
    },
    // BreadcrumbList was missing entirely — required for rich breadcrumb display in SERPs.
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Stays', item: `${SITE_ORIGIN}/stays` },
        { '@type': 'ListItem', position: 3, name: room.lodge_name, item: absoluteCanonical },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {heroImage && (
        <link rel="preload" href={heroImage} as="image" type="image/jpeg" fetchPriority="high" />
      )}
      <RoomDetailExperience room={room} />
      <CouponPopup targetType="ROOM" targetId={room.id} />
    </>
  );
}
