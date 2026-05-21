import PackagesList from './PackagesList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "All Papikondalu Tourism Packages & Boat Rides",
  description: "Browse all curated boat rides, scenic pilgrimage tours, and local sightseeing packages in the Bhadrachalam and Papikondalu regions.",
  keywords: ["Papikondalu Packages", "Bhadrachalam Tours", "Boat Rides", "Sightseeing Packages"],
  alternates: { canonical: '/packages' }
};

async function fetchInitialPackages(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const allowedSingleParams = ['page', 'type', 'region', 'is_featured', 'sort', 'q'];

  for (const key of allowedSingleParams) {
    const value = searchParams[key];
    if (!value) continue;
    if (!Array.isArray(value)) {
      params.set(key, value);
    }
  }

  const tags = searchParams.tags;
  if (Array.isArray(tags)) {
    tags.forEach((tag) => params.append('tags', tag));
  } else if (tags) {
    params.append('tags', tags);
  }

  try {
    const query = params.toString();
    const res = await apiFetch(`/api/v1/packages?${query}`, { next: { revalidate: 60, tags: ['packages'] } });
    if (!res.ok) return { query, data: undefined };
    return { query, data: await res.json() };
  } catch {
    return { query: params.toString(), data: undefined };
  }
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { data } = await fetchInitialPackages(params);
  return <PackagesList data={data} pathname="/packages" searchParams={params} />;
}
