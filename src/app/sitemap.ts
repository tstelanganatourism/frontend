import { MetadataRoute } from 'next'
import { apiFetch } from '@/lib/api'

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tsboattourism.org';
  
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/boat-rides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sightseeing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/stays`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/brochures`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [packageSlugs, roomSlugs] = await Promise.all([
      fetchAllSlugs('/api/v1/packages'),
      fetchAllSlugs('/api/v1/rooms')
    ]);

    dynamicRoutes = dynamicRoutes.concat(
      packageSlugs.map((slug) => ({
        url: `${baseUrl}/packages/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      }))
    );

    dynamicRoutes = dynamicRoutes.concat(
      roomSlugs.map((slug) => ({
        url: `${baseUrl}/stays/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap routes", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
