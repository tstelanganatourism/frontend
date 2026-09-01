'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Users,
  ArrowRight,
  Tag,
  Clock,
  MapPin,
  ChevronRight,
  Phone,
  Mail,
  Building,
  Navigation,
  ShieldCheck,
  Globe,
} from 'lucide-react';

// ─── Static fallback packages if API is down ──────────────────────────────────
const FALLBACK_PACKAGES = [
  {
    id: 'bhadrachalam-to-papikondalu-sirivaka-bamboo-huts-2-days',
    slug: 'bhadrachalam-to-papikondalu-sirivaka-bamboo-huts-2-days',
    title: 'Bhadrachalam to Papikondalu Sirivaka Bamboo Huts (2 Days Package)',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Sirivaka Bamboo Huts',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    starting_price: 5000,
    type: 'TOUR',
    tags: ['Bamboo Huts', 'Godavari Cruise', 'All Meals Included'],
  },
  {
    id: 'bhadrachalam-to-papikondalu-sirivaka-wooden-cottage-2-days',
    slug: 'bhadrachalam-to-papikondalu-sirivaka-wooden-cottage-2-days',
    title: 'Bhadrachalam to Papikondalu (Sirivaka) Wooden Cottage Package (2 Days)',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Sirivaka Wooden Cottages',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg',
    starting_price: 5500,
    type: 'TOUR',
    tags: ['Wooden Cottages', 'Scenic Hill Stay', 'AC Cottages'],
  },
  {
    id: 'bhadrachalam-to-papikondalu-maredumilli-2-days',
    slug: 'bhadrachalam-to-papikondalu-maredumilli-2-days',
    title: 'Bhadrachalam to Papikondalu & Maredumilli Forest Resorts (2 Days Package)',
    duration: '2 Days / 1 Night',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Maredumilli Forest Resorts - Pamuleru Waterfalls',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
    starting_price: 5500,
    type: 'TOUR',
    tags: ['Maredumilli Resorts', 'Waterfalls', 'Jungle Safari'],
  },
  {
    id: 'bhadrachalam-to-papikondalu-one-day-tour',
    slug: 'bhadrachalam-to-papikondalu-one-day-tour',
    title: 'Bhadrachalam to Papikondalu One Day Boat Tour Package',
    duration: '1 Day',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Bhadrachalam',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp',
    starting_price: 990,
    type: 'TRIP',
    tags: ['Day Cruise', 'Breakfast & Lunch', 'Temple Visit'],
  },
  {
    id: 'bhadrachalam-to-papikondalu-boat-rajahmundry-package',
    slug: 'bhadrachalam-to-papikondalu-boat-rajahmundry-package',
    title: 'Bhadrachalam to Papikondalu Boat Cruise with Rajahmundry Drop',
    duration: '1 Day',
    place: 'Bhadrachalam - Pochavaram - Papikondalu - Perantapalli - Purushothapatnam - Rajahmundry',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
    starting_price: 2200,
    type: 'TOUR',
    tags: ['One-Way Cruise', 'Rajahmundry Drop', 'Full Day Trip'],
  },
  {
    id: 'rajahmundry-to-papikondalu-bhadrachalam-package',
    slug: 'rajahmundry-to-papikondalu-bhadrachalam-package',
    title: 'Rajahmundry to Papikondalu Boat with Bhadrachalam Drop',
    duration: '1 Day',
    place: 'Rajahmundry - Purushothapatnam - Papikondalu - Perantapalli - Pochavaram - Bhadrachalam',
    cover_image_url:
      'https://res.cloudinary.com/r929tquv/image/upload/v1786941607/ts_tours/ou4bikypctyozwhizlic.jpg',
    starting_price: 2200,
    type: 'TOUR',
    tags: ['River Gorge Cruise', 'Bhadrachalam Drop', 'Temple Darshan'],
  },
];

interface Package {
  id: string | number;
  slug: string;
  title: string;
  duration?: string | null;
  place?: string | null;
  cover_image_url?: string | null;
  starting_price?: number | null;
  type?: string;
  tags?: string[];
}

interface Props {
  packages: Package[] | null;
}

const SEASON_LABEL = 'Sep 2026 Season';

const CLOUDINARY_FALLBACKS: Record<string, string> = {
  'bhadrachalam-to-papikondalu-sirivaka-bamboo-huts-2-days':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
  'bhadrachalam-to-papikondalu-sirivaka-wooden-cottage-2-days':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg',
  'bhadrachalam-to-papikondalu-maredumilli-2-days':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
  'bhadrachalam-to-papikondalu-one-day-tour':
    'https://res.cloudinary.com/r929tquv/image/upload/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp',
  'bhadrachalam-to-papikondalu-boat-rajahmundry-package':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
  'rajahmundry-to-papikondalu-bhadrachalam-package':
    'https://res.cloudinary.com/r929tquv/image/upload/v1786941607/ts_tours/ou4bikypctyozwhizlic.jpg',
  'papikondalu-cruise':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
  'bhadrachalam-tour':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
  'kolluru-bamboo-huts':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
  'maredumilli-combo':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
  'bhadrachalam-rooms':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
  'godavari-sightseeing':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
};

const DEFAULT_TOUR_IMAGE =
  'https://res.cloudinary.com/r929tquv/image/upload/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp';

function getPackageImage(pkg: Package): string {
  if (pkg.cover_image_url && pkg.cover_image_url.trim() && pkg.cover_image_url.startsWith('http')) {
    return pkg.cover_image_url;
  }
  if (CLOUDINARY_FALLBACKS[pkg.slug]) {
    return CLOUDINARY_FALLBACKS[pkg.slug];
  }
  const slug = (pkg.slug || '').toLowerCase();
  const title = (pkg.title || '').toLowerCase();
  if (slug.includes('bamboo') || title.includes('bamboo') || slug.includes('huts') || title.includes('huts')) {
    return 'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg';
  }
  if (slug.includes('wooden') || title.includes('wooden') || slug.includes('cottage') || title.includes('cottage')) {
    return 'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg';
  }
  if (slug.includes('maredumilli') || title.includes('maredumilli') || slug.includes('resort') || title.includes('forest')) {
    return 'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg';
  }
  if (slug.includes('bhadrachalam') || title.includes('bhadrachalam') || title.includes('temple')) {
    return 'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg';
  }
  return DEFAULT_TOUR_IMAGE;
}

function getTypeLabel(type?: string) {
  if (type === 'TOUR') return 'Day Tour';
  if (type === 'STAY') return 'Overnight Stay';
  if (type === 'TRIP') return 'Multi-Day Trip';
  return 'Package';
}

export default function PreBookingLandingClient({ packages }: Props) {
  const displayPackages: Package[] =
    packages && packages.length > 0 ? packages : FALLBACK_PACKAGES;

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#0F3D56]">
      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-[#f0faf9] border border-[#1598a1]/30 text-[#1598a1] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-[#1598a1] animate-pulse" />
                Early Pre-Booking · {SEASON_LABEL} · Free
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F3D56] tracking-tight leading-tight">
                Pre-Book Your September 2026 Tour
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                Reserve your preferred tour package and travel date for the September 2026 season <strong>absolutely free</strong>. No payment or deposit required now. Limited slots available — click on any package below to choose your date and tickets.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 shadow-2xs">
                <Calendar className="w-4 h-4 text-[#1598a1]" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Booking Period</p>
                  <p className="font-bold text-xs text-[#0F3D56]">Sep 1 – Sep 30, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 shadow-2xs">
                <Users className="w-4 h-4 text-[#1598a1]" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Availability</p>
                  <p className="font-bold text-xs text-[#0F3D56]">100 Seats / Day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PACKAGES GRID ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F3D56]">Available Packages for Pre-Booking</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a package to view details, choose dates, and submit your free pre-booking
            </p>
          </div>
          <div className="text-xs text-[#1598a1] font-bold hidden sm:flex items-center gap-1">
            <span>Click any package to pre-book</span>
            <span>→</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPackages.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/prebooking/${pkg.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#1598a1] hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  src={getPackageImage(pkg)}
                  alt={pkg.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-white/95 text-[#1598a1] text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-[#1598a1]/20">
                    {getTypeLabel(pkg.type)}
                  </span>
                </div>
                {/* Booking open badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 bg-[#1598a1] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    {SEASON_LABEL}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-bold text-[#0F3D56] text-base leading-snug mb-2 group-hover:text-[#1598a1] transition-colors">
                  {pkg.title}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
                  {pkg.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-[#1598a1]" />
                      {pkg.duration}
                    </div>
                  )}
                  {pkg.place && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-[#1598a1]" />
                      {pkg.place}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {pkg.tags && pkg.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pkg.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                      >
                        <Tag className="w-2.5 h-2.5 text-gray-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div>
                    {pkg.starting_price && pkg.starting_price > 0 ? (
                      <>
                        <p className="text-[11px] text-gray-400">Starting from</p>
                        <p className="text-base font-black text-[#0F3D56]">
                          ₹{pkg.starting_price.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-gray-400 ml-1">/ person</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-[#1598a1]">Free Pre-Booking</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#1598a1] text-white text-xs font-bold px-3 py-2 rounded-lg group-hover:bg-[#0F3D56] transition-colors">
                    Pre-Book
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── 3 STEP EXPLANATION ─────────────────────────────────────────── */}
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-base text-[#0F3D56] mb-4">How Early Pre-Booking Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#f0faf9] border border-[#1598a1]/30 text-[#1598a1] font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <p className="font-bold text-sm text-[#0F3D56]">Select Package & Date</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Click on any package above, pick your preferred September 2026 date, and enter ticket counts.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#f0faf9] border border-[#1598a1]/30 text-[#1598a1] font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <p className="font-bold text-sm text-[#0F3D56]">Instant Email & WhatsApp</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Get a reference number and confirmation email immediately. Connect with us on WhatsApp with one click.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#f0faf9] border border-[#1598a1]/30 text-[#1598a1] font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <p className="font-bold text-sm text-[#0F3D56]">24h Team Confirmation</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Our team calls or messages you within 24 hours to confirm date availability and assist with final plans.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── OFFICE ADDRESS & CONTACT DETAILS SECTION ────────────────────── */}
        <section className="mt-10 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-gray-200 pb-5 mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-white shrink-0 p-0.5">
                <Image
                  src="/ts-boat-tourism-logo.png"
                  alt="TS Boat Tourism Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-[#0F3D56]">
                    TS Boat Tourism
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#1598a1]/10 text-[#1598a1] text-[10px] font-bold px-2 py-0.5 rounded">
                    Official Head Office
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Authorized Godavari Cruises & Temple Tourism Booking Center
                </p>
              </div>
            </div>
            <a
              href="https://g.page/r/CcdqZmyXuAhxEAI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-[#0F3D56] px-3.5 py-2 rounded-xl transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#1598a1]" />
              Open in Google Maps
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Address */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1598a1] uppercase tracking-wider mb-2">
                <Building className="w-4 h-4 text-[#1598a1]" />
                Office Address
              </div>
              <p className="text-sm font-bold text-[#0F3D56] leading-snug">
                Door No. 10-1-2/1, Ground Floor
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Om Shanthi Building Sataram,<br />
                Kalyana Mandapam Road,<br />
                Bhadrachalam, Telangana — 507111, India.
              </p>
              <div className="mt-auto pt-3 border-t border-gray-200 flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                Near Bhadrachalam Temple & River Ghat
              </div>
            </div>

            {/* Direct Contact Numbers & Email */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1598a1] uppercase tracking-wider mb-2">
                <Phone className="w-4 h-4 text-[#1598a1]" />
                Direct Contact Numbers
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Primary Booking Helpline</p>
                  <a
                    href="tel:+919951369573"
                    className="text-base font-black text-[#0F3D56] hover:text-[#1598a1] transition-colors"
                  >
                    +91 99513 69573
                  </a>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Secondary Contact</p>
                  <a
                    href="tel:+917780119268"
                    className="text-sm font-bold text-[#0F3D56] hover:text-[#1598a1] transition-colors"
                  >
                    +91 77801 19268
                  </a>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Official Email</p>
                  <a
                    href="mailto:tstelanganatourism@gmail.com"
                    className="text-xs font-semibold text-[#1598a1] hover:underline break-all"
                  >
                    tstelanganatourism@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Timings & Cruise Reporting */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1598a1] uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-[#1598a1]" />
                Timings & Reporting
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Office Working Hours</p>
                  <p className="text-sm font-bold text-[#0F3D56]">7:00 AM – 9:00 PM IST</p>
                  <p className="text-xs text-gray-500">Open 7 Days a Week</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Boat Cruise Reporting Time</p>
                  <p className="text-sm font-bold text-[#1598a1]">7:00 AM to 7:30 AM IST</p>
                  <p className="text-xs text-gray-500">Pochavaram / Bhadrachalam Boat Dock</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © 2026 <strong>TS Boat Tourism</strong> (tstelanganatourism.com). All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/919951369573?text=Hello%20TS%20Boat%20Tourism!%20I%20want%20to%20visit%20your%20Bhadrachalam%20office%20for%20pre-booking."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <span>💬</span>
                Chat on WhatsApp
              </a>
              <a
                href="tel:+919951369573"
                className="inline-flex items-center gap-1.5 bg-[#0F3D56] hover:bg-[#1e468a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Helpline
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
