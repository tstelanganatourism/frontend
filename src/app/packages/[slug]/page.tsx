import { notFound } from 'next/navigation';
import { cache } from 'react';
import { apiFetch } from '@/lib/api';

// Experiential Rebuilt Components
import { PackageHeroV2 } from '@/components/packages/detail/PackageHeroV2';
import { SectionNav } from '@/components/packages/detail/SectionNav';
import { ExperienceOverview } from '@/components/packages/detail/ExperienceOverview';
import { PackageGallery } from '@/components/packages/detail/PackageGallery';
import { VisitingPlaces } from '@/components/packages/detail/VisitingPlaces';
import { ItineraryTimeline } from '@/components/packages/detail/ItineraryTimeline';
import { FacilitiesInclusions } from '@/components/packages/detail/FacilitiesInclusions';
import { ReportingInfo } from '@/components/packages/detail/ReportingInfo';
import { PackageFaqs } from '@/components/packages/detail/PackageFaqs';
import { PackagePolicies } from '@/components/packages/detail/PackagePolicies';
import { BookingSidebarV2 } from '@/components/packages/detail/BookingSidebarV2';
import { MobileBookingSheet } from '@/components/packages/detail/MobileBookingSheet';
import CouponPopup from '@/components/ui/CouponPopup';

// ISR: revalidate every 60 seconds OR instantly when admin triggers /api/revalidate
export const revalidate = 60;
export const dynamicParams = true;


type Variant = { id: number; title: string; adult_price: number; child_price: number; transport_info?: string | null };
type Item = { id: number; title?: string; label?: string; icon?: string | null; sort_order?: number };
type PackageDetail = {
  id: number;
  slug: string;
  title: string;
  type: string;
  duration?: string | null;
  region?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  brochure_pdf_url?: string | null;
  generated_brochure_url?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tags: string[];
  starting_price?: number | null;
  variants: Variant[];
  gallery: Array<{ id: number; image_url: string; alt_text?: string | null; is_cover: boolean }>;
  itinerary: Array<{ id: number; day_number: number; title: string; description?: string | null; icon?: string | null; sort_order: number }>;
  highlights: Item[];
  inclusions: Item[];
  exclusions: Item[];
  boarding_points: Array<{ id: number; title: string; address?: string | null; map_url?: string | null; departure_time?: string | null; sort_order: number }>;
  faqs: Array<{ id: number; question: string; answer: string; sort_order: number }>;
  policies: Array<{ id: number; type: string; title: string; description: string; sort_order: number }>;
};
type JsonLdObject = Record<string, unknown>;

const fetchPackageDetail = cache(async (slug: string): Promise<PackageDetail | null> => {
  try {
    const res = await apiFetch(`/api/v1/packages/${slug}`, { next: { revalidate: 30, tags: ['packages', `package:${slug}`] } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await fetchPackageDetail(slug);
  if (!pkg) return { title: 'Package Not Found' };

  const description = pkg.meta_description || pkg.description?.slice(0, 160) || `${pkg.title} tour booking with itinerary, inclusions, FAQs, and verified operator support.`;

  return {
    title: pkg.meta_title || `${pkg.title} | Premium Papikondalu Tour Booking`,
    description,
    alternates: { canonical: pkg.canonical_url || `/packages/${pkg.slug}` },
    openGraph: {
      title: pkg.meta_title || pkg.title,
      description,
      images: pkg.og_image_url || pkg.cover_image_url ? [{ url: pkg.og_image_url || pkg.cover_image_url! }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pkg.meta_title || pkg.title,
      description,
      images: pkg.og_image_url || pkg.cover_image_url ? [pkg.og_image_url || pkg.cover_image_url!] : [],
    },
  };
}

function getDurationLabel(pkg: PackageDetail) {
  if (pkg.duration) return pkg.duration;
  if (pkg.itinerary.length > 1) return `${pkg.itinerary.length} days`;
  const text = `${pkg.title} ${pkg.slug}`.toLowerCase();
  const dayMatch = text.match(/(\d+)[-\s]*(day|days|d)\b/);
  if (dayMatch) return `${dayMatch[1]} day${dayMatch[1] === '1' ? '' : 's'}`;
  const nightMatch = text.match(/(\d+)[-\s]*(night|nights|n)\b/);
  if (nightMatch) return `${nightMatch[1]} night${nightMatch[1] === '1' ? '' : 's'}`;
  return 'Same day / flexible';
}

function getPositiveStartingPrice(pkg: PackageDetail) {
  const explicit = Number(pkg.starting_price || 0);
  if (explicit > 0) return explicit;

  const variantPrices = pkg.variants
    .map((variant) => Number(variant.adult_price || 0))
    .filter((price) => price > 0);

  return variantPrices.length ? Math.min(...variantPrices) : null;
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await fetchPackageDetail(slug);
  if (!pkg) notFound();

  const price = getPositiveStartingPrice(pkg) || 0;
  const canonical = pkg.canonical_url || `/packages/${pkg.slug}`;

  // Ensure all JSON-LD URLs are absolute — schema.org mandates fully-qualified URLs.
  const SITE_ORIGIN = 'https://www.tsboattourism.org';
  const abs = (url?: string | null) =>
    url ? (url.startsWith('http') ? url : `${SITE_ORIGIN}${url}`) : undefined;

  const absoluteCanonical = abs(canonical)!;
  const absoluteImage = abs(pkg.cover_image_url);

  // Structured schema markup for premium SEO indexability
  const jsonLd: JsonLdObject[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: pkg.title,
      description: pkg.description,
      image: absoluteImage,
      url: absoluteCanonical,
      touristType: ['Family travelers', 'Nature travelers', 'Pilgrimage travelers'],
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: absoluteCanonical,
      },
      itinerary: pkg.itinerary.map((day) => ({
        '@type': 'ItemList',
        name: `Day ${day.day_number}: ${day.title}`,
        description: day.description,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        {
          '@type': 'ListItem',
          position: 2,
          name: pkg.type === 'TOUR' ? 'Boat Rides' : 'Sightseeing',
          item: pkg.type === 'TOUR' ? `${SITE_ORIGIN}/boat-rides` : `${SITE_ORIGIN}/sightseeing`,
        },
        { '@type': 'ListItem', position: 3, name: pkg.title, item: absoluteCanonical },
      ],
    },
  ];

  if (pkg.faqs.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pkg.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return (
    <main className="min-h-screen bg-[#f6fbfa] pb-28 text-slate-800 antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Clean Header Grid */}
      <PackageHeroV2
        title={pkg.title}
        coverImage={pkg.cover_image_url}
        region={pkg.region}
        type={pkg.type}
        tags={pkg.tags}
        durationLabel={getDurationLabel(pkg)}
        boardingPoint={pkg.boarding_points[0]?.title}
        description={pkg.description}
        startingPrice={getPositiveStartingPrice(pkg)}
        variantCount={pkg.variants.length}
        gallery={pkg.gallery}
      />

      {/* Tabbed Navigation */}
      <SectionNav />

      {/* Main Content Grid with Majestic Width & Spacious 420px Sidebar Column */}
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-12 lg:py-14">

        {/* Left Content Column */}
        <div className="space-y-10">

          <ExperienceOverview pkg={pkg} durationLabel={getDurationLabel(pkg)} />

          <VisitingPlaces highlights={pkg.highlights} />

          <ItineraryTimeline
            days={pkg.itinerary}
            packageTitle={pkg.title}
            packageType={pkg.type}
            durationLabel={getDurationLabel(pkg)}
            boardingPoint={pkg.boarding_points[0]?.title}
            transportInfo={pkg.variants[0]?.transport_info}
            departureTime={pkg.boarding_points[0]?.departure_time}
          />

          <FacilitiesInclusions inclusions={pkg.inclusions} exclusions={pkg.exclusions} />

          <ReportingInfo boardingPoints={pkg.boarding_points} />

          <PackageFaqs faqs={pkg.faqs} />

          <PackagePolicies policies={pkg.policies} primaryBoarding={pkg.boarding_points?.[0]} />

          {/* Visual Brochure Download Panel */}
          {/* {(pkg.generated_brochure_url || pkg.brochure_pdf_url) && (
            <section id="brochure" className="scroll-mt-32">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0f8d7d]">Offline Planning</p>
              <h2 className="mt-2 text-2xl font-black text-[#102231] sm:text-3xl">Official Tour Brochure</h2>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition hover:shadow-md">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#0f3d56]">Download PDF Brochure</h3>
                  <p className="text-xs font-semibold leading-relaxed text-slate-500 max-w-xl">
                    Get the complete verified travel itinerary, detailed package variants pricing structure, boarding instructions, and rules in a beautifully structured, high-resolution PDF brochure for offline viewing.
                  </p>
                </div>
                <a
                  href={pkg.generated_brochure_url || pkg.brochure_pdf_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a6b7a] hover:bg-[#13505c] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-md transition hover:-translate-y-0.5"
                >
                  📥 Download Brochure PDF
                </a>
              </div>
            </section>
          )} */}

          <PackageGallery gallery={pkg.gallery} />

        </div>

        {/* Right Sticky Booking Sidebar */}
        <aside className="hidden lg:block relative">
          <BookingSidebarV2
            startingPrice={getPositiveStartingPrice(pkg)}
            variants={pkg.variants}
            packageId={pkg.id}
            packageSlug={pkg.slug}
            brochurePdfUrl={pkg.generated_brochure_url || pkg.brochure_pdf_url}
          />
        </aside>

      </div>

      {/* Sticky Bottom Sheet Action Trigger for Mobile screen flow */}
      <MobileBookingSheet
        startingPrice={getPositiveStartingPrice(pkg)}
        variants={pkg.variants}
        packageId={pkg.id}
        packageSlug={pkg.slug}
        brochurePdfUrl={pkg.generated_brochure_url || pkg.brochure_pdf_url}
      />

      <CouponPopup targetType="PACKAGE" targetId={pkg.id} />
    </main>
  );
}
