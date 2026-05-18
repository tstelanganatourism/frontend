import RoomsList from '../rooms/RoomsList';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "Premium Riverside Huts & Stays in Bhadrachalam & Kolluru",
  description: "Book authentic Godavari riverside bamboo huts, luxury forest resorts, and comfortable pilgrimage stays in Bhadrachalam and Kolluru. Instant online booking.",
  keywords: ["Papikondalu Bamboo Huts", "Bhadrachalam Stays", "Kolluru Huts Booking", "Riverside Resorts Bhadrachalam", "Bhadrachalam Pilgrim Stays"],
  alternates: { canonical: '/stays' }
};

async function fetchInitialRooms(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const allowedSingleParams = ['page', 'is_featured', 'sort', 'q'];

  for (const key of allowedSingleParams) {
    const value = searchParams[key];
    if (!value) continue;
    if (!Array.isArray(value)) {
      params.set(key, value);
    }
  }

  const facilities = searchParams.facilities;
  if (Array.isArray(facilities)) {
    facilities.forEach((facility) => params.append('facilities', facility));
  } else if (facilities) {
    params.append('facilities', facilities);
  }

  try {
    const query = params.toString();
    const res = await apiFetch(`/api/v1/rooms${query ? `?${query}` : ''}`, { next: { revalidate: 60 } });
    if (!res.ok) return { query, data: undefined };
    return { query, data: await res.json() };
  } catch {
    return { query: params.toString(), data: undefined };
  }
}

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { query, data } = await fetchInitialRooms(params);
  return <RoomsList data={data} query={query} searchParams={params} />;
}
