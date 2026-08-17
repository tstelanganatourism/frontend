import { notFound } from 'next/navigation';
import PackagesList from '../../PackagesList';
import { apiFetch } from '@/lib/api';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiFetch(`/api/v1/packages/categories/${slug}`, {
      next: { revalidate: 43200, tags: ['categories', `category:${slug}`] }
    });
    if (!res.ok) return {};
    const cat = await res.json();
    return {
      title: `${cat.name} | TS Boat Tourism Packages`,
      description: cat.description || `Browse ${cat.name} — curated boat tour and travel packages from TS Boat Tourism.`,
      alternates: { canonical: `/packages/categories/${slug}` },
    };
  } catch {
    return {};
  }
}

async function fetchCategoryPackages(slug: string) {
  try {
    const res = await apiFetch(`/api/v1/packages/categories/${slug}`, {
      next: { revalidate: 43200, tags: ['categories', `category:${slug}`] }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PackageCategoryPage({ params }: Props) {
  const { slug } = await params;
  const categoryData = await fetchCategoryPackages(slug);

  if (!categoryData) notFound();

  // Shape the data to match PackagesList's expected format
  const listData = {
    items: categoryData.packages || [],
    total: categoryData.package_count || 0,
    size: (categoryData.packages || []).length,
  };

  return (
    <PackagesList
      data={listData}
      pathname="/packages"
      searchParams={{}}
      categoryName={categoryData.name}
      categorySlug={slug}
      categoryDescription={categoryData.description}
      categoryBackHref="/packages"
    />
  );
}
