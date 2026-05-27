import PackagesList from '../packages/PackagesList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "Papikondalu Boat Rides & Godavari River Cruises",
  description: "Book official government-approved boat rides, luxury cruises, and day tours through the scenic Papikondalu hills on the Godavari River. Safe and family-friendly.",
  keywords: ["Papikondalu Boat Rides", "Godavari Cruises", "Papi Hills Boat Booking", "Bhadrachalam Boating", "Rajahmundry Boat Trips"]
};

async function fetchInitialPackages(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const allowedSingleParams = ['page', 'region', 'is_featured', 'sort', 'q'];

  for (const key of allowedSingleParams) {
    const value = searchParams[key];
    if (!value) continue;
    if (!Array.isArray(value)) {
      params.set(key, value);
    }
  }

  params.set('type', 'TOUR');

  const tags = searchParams.tags;
  if (Array.isArray(tags)) {
    tags.forEach((tag) => params.append('tags', tag));
  } else if (tags) {
    params.append('tags', tags);
  }

  try {
    const query = params.toString();
    const res = await apiFetch(`/api/v1/packages?${query}`, { next: { revalidate: 30, tags: ['packages'] } });
    if (!res.ok) return { query, data: undefined };
    return { query, data: await res.json() };
  } catch {
    return { query: params.toString(), data: undefined };
  }
}

export default async function BoatRidesPage() {
  const { data } = await fetchInitialPackages({});
  return <PackagesList data={data} pathname="/boat-rides" />;
}
