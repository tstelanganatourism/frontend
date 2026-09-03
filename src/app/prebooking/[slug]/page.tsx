import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingFlowClient from './BookingFlowClient';
import { PREBOOKING_PACKAGES, getPreBookingPackage, PREBOOKING_SLUG_ALIASES } from '../prebookingData';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = PREBOOKING_PACKAGES.map((p) => ({ slug: p.slug }));
  const aliasSlugs = Object.keys(PREBOOKING_SLUG_ALIASES).map((slug) => ({ slug }));
  return [...slugs, ...aliasSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPreBookingPackage(slug);
  if (!pkg) return { title: 'Pre-Book Package | TS Boat Tourism' };
  return {
    title: `Pre-Book ${pkg.title} | TS Boat Tourism`,
    description: `Pre-book your ${pkg.title} for September 2026. Free early access — no payment needed. Helpline: +91 99513 69573`,
  };
}

export default async function PreBookingSlugPage({ params }: Props) {
  const { slug } = await params;
  const pkg = getPreBookingPackage(slug);
  if (!pkg) notFound();

  return <BookingFlowClient pkg={pkg} />;
}
