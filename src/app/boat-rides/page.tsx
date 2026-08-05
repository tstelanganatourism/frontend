import PackagesList from '../packages/PackagesList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "Papikondalu Boat Rides & Godavari River Cruises",
  description: "Book government-approved boat rides, luxury cruises, and day tours through the scenic Papikondalu hills on the Godavari River. Safe and family-friendly.",
  keywords: ["Papikondalu Boat Rides", "Godavari Cruises", "Papi Hills Boat Booking", "Bhadrachalam Boating", "Rajahmundry Boat Trips"]
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

  params.set('type', 'TOUR');
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

export default async function BoatRidesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const { data } = await fetchInitialPackages(searchParams);
  return (
    <>
      <link rel="preload" href="https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png" as="image" type="image/png" fetchPriority="high" />
      <PackagesList data={data} pathname="/boat-rides" searchParams={searchParams} />
    </>
  );
}
