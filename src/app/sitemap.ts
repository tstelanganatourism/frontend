import { MetadataRoute } from 'next'
import { apiFetch } from '@/lib/api'

type SitemapListItem = {
  slug: string;
};

type SitemapListResponse = {
  items?: SitemapListItem[];
};
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tsboattourism.org';
  
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/boat-rides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sightseeing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/stays`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/brochures`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [packagesRes, roomsRes] = await Promise.all([
      apiFetch('/api/v1/packages?size=100'),
      apiFetch('/api/v1/rooms?size=100')
    ]);

    if (packagesRes.ok) {
      const packagesData = (await packagesRes.json()) as SitemapListResponse;
      const items = packagesData.items || [];
      dynamicRoutes = dynamicRoutes.concat(
        items.map((pkg) => ({
          url: `${baseUrl}/packages/${pkg.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
      );
    }

    if (roomsRes.ok) {
      const roomsData = (await roomsRes.json()) as SitemapListResponse;
      const items = roomsData.items || [];
      dynamicRoutes = dynamicRoutes.concat(
        items.map((room) => ({
          url: `${baseUrl}/stays/${room.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }))
      );
    }
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap routes", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
