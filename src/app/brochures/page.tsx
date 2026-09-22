import BrochuresList, { type BrochurePackage } from './BrochuresList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Tour Brochures & Package PDFs',
  description: 'Download official Papikondalu, Bhadrachalam, boat ride, and sightseeing package brochures with fares, timings, reporting points, and itinerary details.',
  keywords: ['Papikondalu brochures', 'Bhadrachalam package PDF', 'tour brochure download', 'boat ride brochure'],
  alternates: { canonical: '/brochures' },
};

// Always fetch fresh so brochure availability is never stale
export const dynamic = 'force-dynamic';

async function fetchBrochurePackages() {
  try {
    const res = await apiFetch(`/api/v1/packages?size=100`, {
      cache: 'no-store',
    });

    if (!res.ok) return undefined;

    const data = await res.json();
    const items: BrochurePackage[] = data.items || [];
    return { items, total: data.total || items.length };
  } catch {
    return undefined;
  }
}

export default async function BrochuresPage() {
  const data = await fetchBrochurePackages();
  return <BrochuresList data={data} />;
}
