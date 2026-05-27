import BrochuresList, { type BrochurePackage } from './BrochuresList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Tour Brochures & Package PDFs',
  description: 'Download official Papikondalu, Bhadrachalam, boat ride, and sightseeing package brochures with fares, timings, reporting points, and itinerary details.',
  keywords: ['Papikondalu brochures', 'Bhadrachalam package PDF', 'tour brochure download', 'boat ride brochure'],
  alternates: { canonical: '/brochures' },
};

async function fetchBrochurePackages() {
  const items: BrochurePackage[] = [];
  let page = 1;
  let hasNext = true;

  try {
    while (hasNext && page <= 20) {
      const res = await apiFetch(`/api/v1/packages?page=${page}&size=100`, {
        next: { revalidate: 60, tags: ['packages', 'brochures'] },
      });

      if (!res.ok) break;

      const data = await res.json();
      items.push(...(data.items || []));
      hasNext = Boolean(data.has_next);
      page += 1;
    }

    return { items, total: items.length };
  } catch {
    return undefined;
  }
}

export default async function BrochuresPage() {
  const data = await fetchBrochurePackages();
  return <BrochuresList data={data} />;
}
