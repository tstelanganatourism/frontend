import { notFound } from 'next/navigation';
import RoomsList from '../../../rooms/RoomsList';
import { apiFetch } from '@/lib/api';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiFetch(`/api/v1/rooms/categories/${slug}`, { cache: 'no-store' });
    if (!res.ok) return {};
    const cat = await res.json();
    return {
      title: `${cat.name} | TS Boat Tourism Accommodations`,
      description: cat.description || `Explore ${cat.name} — authentic stays, bamboo huts and resort lodges.`,
      alternates: { canonical: `/stays/categories/${slug}` },
    };
  } catch {
    return {};
  }
}

async function fetchRoomCategoryData(slug: string) {
  try {
    const res = await apiFetch(`/api/v1/rooms/categories/${slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function RoomCategoryPage({ params }: Props) {
  const { slug } = await params;
  const categoryData = await fetchRoomCategoryData(slug);

  if (!categoryData) notFound();

  const listData = {
    items: categoryData.rooms || [],
    total: categoryData.room_count || 0,
    size: (categoryData.rooms || []).length,
  };

  return (
    <RoomsList
      data={listData}
      searchParams={{}}
      categoryName={categoryData.name}
      categorySlug={slug}
      categoryDescription={categoryData.description}
    />
  );
}
