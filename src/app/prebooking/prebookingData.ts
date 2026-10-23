export interface PreBookingPackage {
  id: string;
  slug: string;
  title: string;
  duration: string;
  place: string;
  cover_image_url: string;
  adult_price: number;
  child_price?: number | null;
  starting_price: number;
  type: string;
  tags: string[];
  description?: string;
}

export const PREBOOKING_PACKAGES: PreBookingPackage[] = [
  {
    id: 'bhadrachalam-to-papikondalu-one-day-package',
    slug: 'bhadrachalam-to-papikondalu-one-day-package',
    title: 'BHADRACHALAM TO PAPIKONDALU ONE DAY PACKAGE',
    duration: '1 Day',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Bhadrachalam',
    adult_price: 1350,
    child_price: 1100,
    starting_price: 1350,
    type: 'TRIP',
    cover_image_url:
      'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp',
    tags: ['1 Day Boat Trip', '₹1,350 Adult · ₹1,100 Child', 'Godavari Boat Ride', 'Breakfast & Lunch'],
    description: 'Complete one day Papikondalu boat tour starting from Bhadrachalam with breakfast, veg/non-veg lunch, and tea snacks included.',
  },
  {
    id: 'bhadrachalam-to-pochavaram-only-boat-point-package',
    slug: 'bhadrachalam-to-pochavaram-only-boat-point-package',
    title: 'BHADRACHALAM TO POCHAVARAM ONLY BOAT POINT PACKAGE',
    duration: '1 Day',
    place: 'Bhadrachalam - Pochavaram Boat Point - Papikondalu - Bhadrachalam',
    adult_price: 1000,
    child_price: 800,
    starting_price: 1000,
    type: 'TRIP',
    cover_image_url:
      'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp',
    tags: ['Boat Point Only', '₹1,000 Adult · ₹800 Child', 'Pochavaram Revu', 'Day Tour'],
    description: 'Direct boat ride package from Pochavaram boat point to Papikondalu and back with boat ride and scenic views.',
  },
  {
    id: 'bhadrachalam-to-papikondalu-maredumilli-resort-package-2days',
    slug: 'bhadrachalam-to-papikondalu-maredumilli-resort-package-2days',
    title: 'BHADRACHALAM TO PAPIKONDALU MAREDUMILLI RESORT PACKAGE 2DAYS',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Maredumilli Forest Resorts - Waterfalls',
    adult_price: 4000,
    child_price: null,
    starting_price: 4000,
    type: 'TOUR',
    cover_image_url:
      'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp',
    tags: ['Maredumilli Resorts', '₹4,000 / Person', '2 Days Stay', 'All Meals Included'],
    description: '2-Day combo package featuring Papikondalu boat trip and overnight stay at Maredumilli forest resort with waterfalls sightseeing.',
  },
  {
    id: 'bhadrachalam-to-papikondalu-resort-package-2days',
    slug: 'bhadrachalam-to-papikondalu-resort-package-2days',
    title: 'BHADRACHALAM TO PAPIKONDALU RESORT PACKAGE 2DAYS',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - River View Resorts - Perantapalli',
    adult_price: 5500,
    child_price: null,
    starting_price: 5500,
    type: 'TOUR',
    cover_image_url:
      'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp',
    tags: ['Papikondalu Resorts', '₹5,500 / Person', 'River View Stay', 'AC / Luxury Cottages'],
    description: '2-Day premium overnight riverside resort stay at Papikondalu with scenic river views, campfire, cultural dance, and all meals.',
  },
];

// Mapping for backward-compatible slugs / aliases
export const PREBOOKING_SLUG_ALIASES: Record<string, string> = {
  'bhadrachalam-to-papikondalu-one-day-tour': 'bhadrachalam-to-papikondalu-one-day-package',
  'bhadrachalam-to-papikondalu-maredumilli-2-days': 'bhadrachalam-to-papikondalu-maredumilli-resort-package-2days',
  'bhadrachalam-to-papikondalu-sirivaka-wooden-cottage-2-days': 'bhadrachalam-to-papikondalu-resort-package-2days',
  'bhadrachalam-to-papikondalu-sirivaka-bamboo-huts-2-days': 'bhadrachalam-to-papikondalu-resort-package-2days',
};

export function getPreBookingPackage(slug: string): PreBookingPackage | undefined {
  const targetSlug = PREBOOKING_SLUG_ALIASES[slug] || slug;
  return PREBOOKING_PACKAGES.find((p) => p.slug === targetSlug || p.id === targetSlug);
}
