import PackagesList from '../packages/PackagesList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "Bhadrachalam & Papikondalu Sightseeing Packages",
  description: "Curated local sightseeing trips, pilgrimage tours, and scenic guided travel experiences around Bhadrachalam and the Papikondalu region. Local guide included.",
  keywords: ["Bhadrachalam Sightseeing", "Bhadrachalam Temple Tours", "Papi Hills Sightseeing", "Bhadrachalam Pilgrimage Packages"]
};

async function fetchInitialPackages(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const allowedSingleParams = ['page', 'region', 'place', 'is_featured', 'sort', 'q'];

  for (const key of allowedSingleParams) {
    const value = searchParams[key];
    if (!value) continue;
    if (!Array.isArray(value)) {
      params.set(key, value);
    }
  }

  params.set('type', 'TRIP');
  params.set('size', '20');

  try {
    const query = params.toString();
    const res = await apiFetch(`/api/v1/packages?${query}`, { next: { revalidate: 30, tags: ['packages'] } });
    if (!res.ok) return { query, data: undefined };
    return { query, data: await res.json() };
  } catch {
    return { query: params.toString(), data: undefined };
  }
}

export default async function SightseeingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { data } = await fetchInitialPackages(params);
  return (
    <>
      <link rel="preload" href="/images/sightseeing-banner-2026.webp" as="image" type="image/webp" fetchPriority="high" />
      <PackagesList data={data} pathname="/sightseeing" searchParams={params} />
    </>
  );
}
