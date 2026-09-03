import BrochuresList, { type BrochurePackage } from './BrochuresList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Tour Brochures & Package PDFs',
  description: 'Download official Papikondalu, Bhadrachalam, boat ride, and sightseeing package brochures with fares, timings, reporting points, and itinerary details.',
  keywords: ['Papikondalu brochures', 'Bhadrachalam package PDF', 'tour brochure download', 'boat ride brochure'],
  alternates: { canonical: '/brochures' },
};

async function fetchBrochurePackages() {
  try {
    const res = await apiFetch(`/api/v1/packages?size=100`, {
      next: { revalidate: 43200, tags: ['packages', 'brochures'] },
    });

    if (!res.ok) return undefined;

    const data = await res.json();
    return { items: data.items || [], total: data.total || data.items?.length || 0 };
  } catch {
    return undefined;
  }
}

export default async function BrochuresPage() {
  const data = await fetchBrochurePackages();
  return <BrochuresList data={data} />;
}
