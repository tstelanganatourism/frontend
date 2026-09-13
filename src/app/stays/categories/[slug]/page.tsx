import { notFound } from 'next/navigation';
import RoomsList from '../../../rooms/RoomsList';
import { apiFetch } from '@/lib/api';
import { Metadata } from 'next';

export const revalidate = 43200;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await apiFetch('/api/v1/rooms/categories', {
      next: { revalidate: 43200, tags: ['categories'] }
    });
    if (!res.ok) return [];
    const categories = await res.json();
    if (!Array.isArray(categories)) return [];
    return categories
      .filter((c: { slug?: string }) => typeof c.slug === 'string' && c.slug.length > 0)
      .map((c: { slug: string }) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiFetch(`/api/v1/rooms/categories/${slug}`, {
      next: { revalidate: 43200, tags: ['categories', `room-category:${slug}`] }
    });
    if (!res.ok) {
      return {
        title: 'Accommodations | TS Boat Tourism',
        robots: { index: false, follow: false },
      };
    }
    const cat = await res.json();
    return {
      title: `${cat.name} | TS Boat Tourism Accommodations`,
      description: cat.description || `Explore ${cat.name} — authentic stays, bamboo huts and resort lodges.`,
      alternates: { canonical: `/stays/categories/${slug}` },
    };
  } catch {
    return {
      title: 'Accommodations | TS Boat Tourism',
    };
  }
}

async function fetchRoomCategoryData(slug: string) {
  try {
    const res = await apiFetch(`/api/v1/rooms/categories/${slug}`, {
      next: { revalidate: 43200, tags: ['categories', `room-category:${slug}`] }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch room category: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('HTTP 404')) return null;
    throw err;
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
