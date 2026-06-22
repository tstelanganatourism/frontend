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
export const revalidate = 43200; // 12 hours — admin can bust via /api/revalidate?tag=packages
export const dynamicParams = true;


type Variant = { 
  id: number; 
  title: string; 
  adult_price: number; 
  child_price: number; 
  student_price?: number; 
  weekend_student_price?: number; 
  transport_info?: string | null 
};
type Item = { id: number; title?: string; label?: string; icon?: string | null; sort_order?: number };
type PackageDetail = {
  id: number;
  slug: string;
  title: string;
  type: string;
  duration?: string | null;
  region?: string | null;
  place?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  brochure_pdf_url?: string | null;
  generated_brochure_url?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_active: boolean;
  tags: string[];
  starting_price?: number | null;
  has_transport?: boolean;
  transport_options?: Array<{
    id: number;
    type: 'SHARED' | 'SEPARATE_VEHICLE';
    title: string;
    capacity?: number;
    adult_price?: number | string | null;
    child_price?: number | string | null;
    weekend_adult_price?: number | string | null;
    weekend_child_price?: number | string | null;
    student_price?: number | string | null;
    weekend_student_price?: number | string | null;
    fixed_price?: number | string | null;
    weekend_fixed_price?: number | string | null;
  }>;
  has_refreshments?: boolean;
  refreshment_adult_price?: number | string | null;
  refreshment_child_price?: number | string | null;
  refreshment_student_price?: number | string | null;
  min_passengers?: number;
  is_student_package?: boolean;
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

const SITE_ORIGIN = 'https://www.tsboattourism.org';

const fetchPackageDetail = cache(async (slug: string): Promise<PackageDetail | null> => {
  try {
    const res = await apiFetch(`/api/v1/packages/${slug}`, { next: { revalidate: 30, tags: ['packages', `package:${slug}`] } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

function absUrl(url?: string | null) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${SITE_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

function canonicalForPackage(pkg: PackageDetail) {
  return absUrl(pkg.canonical_url || `/packages/${pkg.slug}`)!;
}

function cleanText(value?: string | null, maxLength = 155) {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function getSeoDescription(pkg: PackageDetail) {
  if (pkg.meta_description) return cleanText(pkg.meta_description, 160);

  const location = pkg.place || pkg.region || 'Bhadrachalam and Papikondalu';
  const duration = pkg.duration ? ` ${pkg.duration}` : '';
  return cleanText(
    `Book ${pkg.title}${duration} with Telangana Boat Tourism. Official Papikondalu boat tour package booking from ${location}, with itinerary, pricing, boarding details, and support.`,
    160
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await fetchPackageDetail(slug);
  if (!pkg) return { title: 'Package Not Found' };

  const description = getSeoDescription(pkg);
  const title = pkg.meta_title || `${pkg.title} - Official Tour Package Booking`;
  const canonical = canonicalForPackage(pkg);
  const image = absUrl(pkg.og_image_url || pkg.cover_image_url);

  return {
    title,
    description,
    alternates: { canonical },
    keywords: [
      pkg.title,
      `${pkg.title} booking`,
      `${pkg.title} tour package`,
      'Papikondalu boat booking',
      'Bhadrachalam tour package',
      'Godavari river cruise booking',
      ...pkg.tags,
    ],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Telangana Boat Tourism',
      images: image ? [{ url: image, width: 1200, height: 630, alt: pkg.title }] : [],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
    .map((variant) => Number((pkg.is_student_package ? variant.student_price : variant.adult_price) || 0))
    .filter((price) => price > 0);

  return variantPrices.length ? Math.min(...variantPrices) : null;
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await fetchPackageDetail(slug);
  if (!pkg) notFound();

  const price = getPositiveStartingPrice(pkg) || 0;
  const absoluteCanonical = canonicalForPackage(pkg);
  const absoluteImage = absUrl(pkg.cover_image_url);
  const seoDescription = getSeoDescription(pkg);
  const durationLabel = getDurationLabel(pkg);

  // Structured schema markup for premium SEO indexability
  const jsonLd: JsonLdObject[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pkg.meta_title || pkg.title,
      description: seoDescription,
      url: absoluteCanonical,
      image: absoluteImage,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Telangana Boat Tourism',
        url: SITE_ORIGIN,
      },
      about: {
        '@type': 'TouristTrip',
        name: pkg.title,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: pkg.title,
      description: seoDescription,
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
      '@type': 'Product',
      name: pkg.title,
      description: seoDescription,
      image: absoluteImage ? [absoluteImage] : undefined,
      url: absoluteCanonical,
      brand: {
        '@type': 'Organization',
        name: 'Telangana Boat Tourism',
        url: SITE_ORIGIN,
      },
      category: 'Travel Package',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Duration', value: durationLabel },
        { '@type': 'PropertyValue', name: 'Region', value: pkg.region || 'Papikondalu' },
        { '@type': 'PropertyValue', name: 'Package Type', value: pkg.type },
      ],
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: absoluteCanonical,
        seller: {
          '@type': 'TravelAgency',
          name: 'Telangana Boat Tourism',
          url: SITE_ORIGIN,
        },
      },
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
    <main className="bg-[#f6fbfa] pb-20 text-slate-800 antialiased lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {pkg.cover_image_url && (
        <link rel="preload" href={pkg.cover_image_url} as="image" type="image/jpeg" fetchPriority="high" />
      )}

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

      {/* Main Content Grid with a wider booking column for long fare and transport rows */}
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-10 lg:py-14 xl:gap-10 xl:px-12">

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
          {(pkg.generated_brochure_url || pkg.brochure_pdf_url) && (
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
                  href={pkg.brochure_pdf_url || pkg.generated_brochure_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a6b7a] hover:bg-[#13505c] text-white px-6 py-3.5 text-xs font-black uppercase tracking-wider shadow-md transition hover:-translate-y-0.5"
                >
                  📥 Download Brochure PDF
                </a>
              </div>
            </section>
          )}

          <PackageGallery gallery={pkg.gallery} />

        </div>

        {/* Right Sticky Booking Sidebar */}
        <aside className="hidden lg:block relative">
          <BookingSidebarV2
            startingPrice={getPositiveStartingPrice(pkg)}
            variants={pkg.variants}
            packageId={pkg.id}
            packageSlug={pkg.slug}
            brochurePdfUrl={pkg.brochure_pdf_url || pkg.generated_brochure_url}
            hasTransport={pkg.has_transport}
            transportOptions={pkg.transport_options}
            hasRefreshments={pkg.has_refreshments}
            refreshmentAdultPrice={pkg.refreshment_adult_price}
            refreshmentChildPrice={pkg.refreshment_child_price}
            refreshmentStudentPrice={pkg.refreshment_student_price}
            minPassengers={pkg.min_passengers}
            isStudentPackage={pkg.is_student_package}
            isActive={pkg.is_active}
          />
        </aside>

      </div>

      {/* Sticky Bottom Sheet Action Trigger for Mobile screen flow */}
      <MobileBookingSheet
        startingPrice={getPositiveStartingPrice(pkg)}
        variants={pkg.variants}
        packageId={pkg.id}
        packageSlug={pkg.slug}
        brochurePdfUrl={pkg.brochure_pdf_url || pkg.generated_brochure_url}
        hasTransport={pkg.has_transport}
        transportOptions={pkg.transport_options}
        hasRefreshments={pkg.has_refreshments}
        refreshmentAdultPrice={pkg.refreshment_adult_price}
        refreshmentChildPrice={pkg.refreshment_child_price}
        refreshmentStudentPrice={pkg.refreshment_student_price}
        minPassengers={pkg.min_passengers}
        isStudentPackage={pkg.is_student_package}
        isActive={pkg.is_active}
      />

      <CouponPopup targetType="PACKAGE" targetId={pkg.id} />
    </main>
  );
}
