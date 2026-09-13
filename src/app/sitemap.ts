import { MetadataRoute } from 'next'
import { apiFetch } from '@/lib/api'

export const revalidate = 86400; // Rebuild sitemap once per day max


type SitemapListItem = {
  slug: string;
};

type SitemapListResponse = {
  items?: SitemapListItem[];
  has_next?: boolean;
  page?: number;
};

async function fetchAllSlugs(endpoint: string) {
  const slugs: string[] = [];
  let page = 1;

  while (page <= 20) {
    const res = await apiFetch(`${endpoint}?page=${page}&size=100`);
    if (!res.ok) break;

    const data = (await res.json()) as SitemapListResponse;
    const items = data.items || [];
    slugs.push(...items.map((item) => item.slug).filter(Boolean));

    if (!data.has_next || items.length === 0) break;
    page += 1;
  }

  return slugs;
}
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tstelanganatourism.com';
  
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/prebooking`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/boat-rides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sightseeing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/stays`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/brochures`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/cancellation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/shipping-delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [packageSlugs, roomSlugs, pkgCategoriesRes, roomCategoriesRes] = await Promise.all([
      fetchAllSlugs('/api/v1/packages'),
      fetchAllSlugs('/api/v1/rooms'),
      apiFetch('/api/v1/packages/categories').catch(() => null),
      apiFetch('/api/v1/rooms/categories').catch(() => null),
    ]);

    // 1. Packages
    dynamicRoutes = dynamicRoutes.concat(
      packageSlugs
        .filter((slug) => !slug.toLowerCase().includes('test') && !slug.includes('agent-'))
        .map((slug) => ({
          url: `${baseUrl}/packages/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        }))
    );

    // 2. Package Categories
    if (pkgCategoriesRes && pkgCategoriesRes.ok) {
      try {
        const cats = await pkgCategoriesRes.json();
        if (Array.isArray(cats)) {
          dynamicRoutes = dynamicRoutes.concat(
            cats.map((cat: { slug: string }) => ({
              url: `${baseUrl}/packages/categories/${cat.slug}`,
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.85,
            }))
          );
        }
      } catch { }
    }

    // 3. Stays / Rooms (excluding test lodges)
    dynamicRoutes = dynamicRoutes.concat(
      roomSlugs
        .filter((slug) => !slug.toLowerCase().includes('test') && !slug.includes('agent-'))
        .map((slug) => ({
          url: `${baseUrl}/stays/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.75,
        }))
    );

    // 4. Room Categories
    if (roomCategoriesRes && roomCategoriesRes.ok) {
      try {
        const roomCats = await roomCategoriesRes.json();
        if (Array.isArray(roomCats)) {
          dynamicRoutes = dynamicRoutes.concat(
            roomCats.map((cat: { slug: string }) => ({
              url: `${baseUrl}/stays/categories/${cat.slug}`,
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.75,
            }))
          );
        }
      } catch { }
    }
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap routes", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
