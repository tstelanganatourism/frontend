import PackagesList from './PackagesList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "All Packages | TS Boat Tourism — Papikondalu, Bhadrachalam & Godavari Tours",
  description: "Browse all curated boat tours, scenic pilgrimage packages, and riverside stays in the Bhadrachalam and Papikondalu regions. Book online with TS Boat Tourism.",
  keywords: ["Papikondalu Packages", "Bhadrachalam Tours", "Godavari Boat Rides", "Papikondalu tour packages", "TS Boat Tourism"],
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
