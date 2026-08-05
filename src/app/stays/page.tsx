import RoomsList from '../rooms/RoomsList';
import RoomCategoriesGrid from './RoomCategoriesGrid';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: "Premium Riverside Huts & Stays in Bhadrachalam & Kolluru",
  description: "Book authentic Godavari riverside bamboo huts, luxury forest resorts, and comfortable pilgrimage stays in Bhadrachalam and Kolluru. Instant online booking.",
  keywords: ["Papikondalu Bamboo Huts", "Bhadrachalam Stays", "Kolluru Huts Booking", "Riverside Resorts Bhadrachalam", "Bhadrachalam Pilgrim Stays"],
  alternates: { canonical: '/stays' }
};

async function fetchRoomCategories() {
  try {
    const res = await apiFetch('/api/v1/rooms/categories', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

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

  params.set('size', '6');

  try {
    const query = params.toString();
    const res = await apiFetch(`/api/v1/rooms${query ? `?${query}` : ''}`, { next: { revalidate: 43200, tags: ['stays'] } }); // 12h
    if (!res.ok) return { query, data: undefined };
    return { query, data: await res.json() };
  } catch {
    return { query: params.toString(), data: undefined };
  }
}

export default async function StaysPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;

  const viewAll = searchParams['view'] === 'all';
  const hasActiveFilter = Boolean(
    searchParams['q'] || searchParams['facilities'] || searchParams['is_featured'] || searchParams['sort']
  );

  const [categories, { data }] = await Promise.all([
    fetchRoomCategories(),
    fetchInitialRooms(searchParams),
  ]);

  const showCategories = categories.length > 0 && !hasActiveFilter && !viewAll;

  if (showCategories) {
    return <RoomCategoriesGrid categories={categories} />;
  }

  return (
    <>
      <link rel="preload" href="https://res.cloudinary.com/r929tquv/image/upload/v1785917189/ts_boat_tourism/images/kk1enmetydnvtwall1aw.webp" as="image" type="image/webp" fetchPriority="high" />
      <RoomsList data={data} searchParams={searchParams} />
    </>
  );
}
