import PackagesList from './PackagesList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "All Telangana Boat Tourism Packages & Boat Rides",
  description: "Browse all curated boat rides, scenic pilgrimage tours, and local sightseeing packages in the Bhadrachalam and Papikondalu regions.",
  keywords: ["Papikondalu Packages", "Bhadrachalam Tours", "Boat Rides", "Sightseeing Packages"],
  alternates: { canonical: '/packages' }
};

async function fetchInitialPackages(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const allowedSingleParams = ['page', 'type', 'region', 'place', 'is_featured', 'sort', 'q'];

  for (const key of allowedSingleParams) {
    const value = searchParams[key];
    if (!value) continue;
    if (!Array.isArray(value)) {
      params.set(key, value);
    }
  }

  params.set('size', '20');

  try {
    const query = params.toString();
    const res = await apiFetch(`/api/v1/packages?${query}`, { next: { revalidate: 43200, tags: ['packages'] } }); // 12h
    if (!res.ok) return { query, data: undefined };
    return { query, data: await res.json() };
  } catch {
    return { query: params.toString(), data: undefined };
  }
}

export default async function PackagesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const { data } = await fetchInitialPackages(searchParams);
  return <PackagesList data={data} pathname="/packages" searchParams={searchParams} />;
}
