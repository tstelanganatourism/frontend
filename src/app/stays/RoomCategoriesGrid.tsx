'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Home, ArrowRight, Sparkles, LayoutGrid, Star, Tag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

type RoomCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  icon?: string | null;
  sort_order: number;
  room_count: number;
  min_price?: number | null;
  rating?: number;
};

const DEFAULT_ROOM_CATEGORY_IMAGES: Record<string, string> = {
  'bhadrachalam-accommodations': 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1200/v1786273972/9b475911-9c60-4bf6-9ffb-b9f1802275a2_k6zmkd.jpg',
  'papikondalu-forest-huts': 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1200/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
};

function getRoomCategoryCoverImage(cat: RoomCategory): string {
  if (cat.cover_image_url && cat.cover_image_url.trim().length > 0) {
    return cat.cover_image_url;
  }
  if (cat.slug && DEFAULT_ROOM_CATEGORY_IMAGES[cat.slug]) {
    return DEFAULT_ROOM_CATEGORY_IMAGES[cat.slug];
  }
  const low = (cat.name || '').toLowerCase();
  if (low.includes('papikondalu') || low.includes('hut') || low.includes('forest')) {
    return 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1200/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg';
  }
  return 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1200/v1786273972/9b475911-9c60-4bf6-9ffb-b9f1802275a2_k6zmkd.jpg';
}

function RoomCategoryCoverImage({ cat }: { cat: RoomCategory }) {
  const resolved = getRoomCategoryCoverImage(cat);
  const [imgSrc, setImgSrc] = React.useState<string>(resolved);

  return (
    <Image
      src={imgSrc}
      alt={cat.name}
      fill
      priority
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => {
        setImgSrc('https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1200/v1786273972/9b475911-9c60-4bf6-9ffb-b9f1802275a2_k6zmkd.jpg');
      }}
    />
  );
}

type RoomItem = {
  id: number;
  slug: string;
  lodge_name: string;
  address?: string | null;
  starting_price?: number | string | null;
  cover_image_url?: string | null;
  is_featured?: boolean;
};

type StayMarqueeItem = {
  id: string | number;
  type: 'category' | 'room';
  name: string;
  badge: string;
  badgeClass: string;
  dotClass: string;
  subtitle: string;
  href: string;
};

/* ──────────────────────────────────────────────
   INFINITE MARQUEE CAROUSEL (Stays & Rooms)
────────────────────────────────────────────── */
function InfiniteMarqueeStays({ categories, rooms = [] }: { categories: RoomCategory[]; rooms?: RoomItem[] }) {
  // Construct dynamic stay marquee items
  const categoryItems: StayMarqueeItem[] = categories.map((cat) => ({
    id: `cat-${cat.slug}`,
    type: 'category',
    name: cat.name,
    badge: 'Stay Category',
    badgeClass: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    dotClass: 'bg-amber-400 shadow-[0_0_6px_1px_rgba(251,191,36,0.6)]',
    subtitle: `${cat.room_count} ${cat.room_count === 1 ? 'Stay' : 'Stays'}${cat.min_price ? ` · from ₹${cat.min_price.toLocaleString('en-IN')}` : ''}`,
    href: `/stays/categories/${cat.slug}`,
  }));

  const roomItems: StayMarqueeItem[] = rooms.map((r) => ({
    id: `room-${r.slug}`,
    type: 'room',
    name: r.lodge_name,
    badge: 'Bamboo Hut / Stay',
    badgeClass: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    dotClass: 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)]',
    subtitle: `${r.address || 'Riverside Stay'}${r.starting_price ? ` · ₹${Number(r.starting_price).toLocaleString('en-IN')}/night` : ''}`,
    href: `/stays/${r.slug}`,
  }));

  // Combine categories and rooms: category pills first, then all individual rooms
  const combinedList = [...categoryItems, ...roomItems];
  const listToUse = combinedList.length > 0 ? combinedList : categoryItems;
  // Duplicate 3x for seamless infinite looping
  const items = [...listToUse, ...listToUse, ...listToUse];

  // Turtle-slow, calm drifting speed (approx 8.5s per item, min 90s)
  const slowDuration = Math.max(90, listToUse.length * 8.5);

  return (
    <div className="relative w-full overflow-hidden py-3 group/marquee" aria-label="Stay categories and rooms carousel">
      <style>{`
        @keyframes stayMarqueeDrift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333333%, 0, 0); }
        }
        .stay-marquee-track {
          animation: stayMarqueeDrift ${slowDuration}s linear infinite;
        }
        .group\\/marquee:hover .stay-marquee-track,
        .stay-marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Left fade edge */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#0d1f1a] to-transparent sm:w-28" />
      {/* Right fade edge */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#0d1f1a] to-transparent sm:w-28" />

      <div
        className="stay-marquee-track flex gap-2.5 sm:gap-3 w-max will-change-transform"
      >
        {items.map((item, idx) => (
          <Link
            key={`${item.id}-marqueestay-${idx}`}
            href={item.href}
            id={idx < listToUse.length ? `marquee-${item.type}-${item.id}` : undefined}
            className="group flex-shrink-0"
            tabIndex={idx < listToUse.length ? 0 : -1}
            aria-hidden={idx >= listToUse.length ? 'true' : undefined}
          >
            <div className="relative flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md ring-1 ring-inset ring-white/5 hover:border-emerald-500/60 hover:bg-emerald-500/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer min-w-[170px] sm:min-w-[220px]">
              {/* Glow dot */}
              <div className={`flex-shrink-0 w-2 h-2 rounded-full ${item.dotClass}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-white font-bold text-[12px] sm:text-[13px] truncate leading-tight group-hover:text-emerald-300 transition-colors">
                  {item.name}
                </p>
                <p className="text-slate-400 text-[10px] mt-0.5 font-medium truncate">
                  {item.subtitle}
                </p>
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                <ChevronRight className="w-3 h-3 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function RoomCategoriesGrid({ categories, rooms = [] }: { categories: RoomCategory[]; rooms?: RoomItem[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full min-h-screen bg-slate-50/50">

      {/* ── HERO SECTION ── */}
      <div className="relative overflow-hidden bg-[#0d1f1a] pb-0 pt-14 sm:pt-16">
        {/* Ambient Glow Effects */}
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 h-24 w-72 -translate-x-1/2 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />

        {/* Photography Background Image */}
        <Image
          src="https://res.cloudinary.com/r929tquv/image/upload/v1785917195/ts_boat_tourism/images/apggofcaijeekofdotpa.jpg"
          alt="Stay Categories Canvas Background"
          fill
          sizes="100vw"
          className="object-cover opacity-25 pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f1a]/90 via-[#0d1f1a]/60 to-[#0d1f1a]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f1a] via-transparent to-[#0d1f1a]/50 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-2 pb-3 sm:pb-4">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-[#f5b016]" />
            <span>Explore Stay Categories</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mb-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight"
          >
            <span className="block text-emerald-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mb-1.5">
              Riverside Accommodation
            </span>
            <span className="block text-white">Select Your Stay Type</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mb-4"
          >
            Riverfront bamboo huts, eco resorts, and comfortable pilgrim lodges.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {[
              { label: 'Categories', value: categories.length },
              { label: 'Stays', value: categories.reduce((s, c) => s + c.room_count, 0) },
              { label: 'Rating', value: '4.8 ★' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/6 border border-white/12 backdrop-blur-sm">
                <span className="text-sm sm:text-base font-black text-white">{stat.value}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Divider */}
        <div className="relative z-10 px-8 sm:px-16 mb-1">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Marquee Carousel Strip */}
        <div className="relative z-10 pt-3 pb-5 sm:pb-6">
          <p className="text-center text-[9px] uppercase tracking-[0.18em] text-slate-500 mb-3 font-bold px-4">
            ✦ EXPLORE ALL ROOMS, HUTS &amp; STAY TYPES ✦
          </p>
          <InfiniteMarqueeStays categories={categories} rooms={rooms} />
        </div>

        {/* Fade to light bg */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none" />
      </div>

      {/* ── STAYS GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Section heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">All Stay Categories</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">{categories.length} categories · Tap any to explore</p>
          </div>
          <BedDouble className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/stays/categories/${cat.slug}`}
              className="group block"
              id={`room-category-card-${cat.slug}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-900">
                  <RoomCategoryCoverImage cat={cat} />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/30 opacity-90" />

                  {/* TOP LEFT BADGES: Price & Rating */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    {cat.min_price ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-[#f5b016]/40 text-[#f5b016] font-extrabold text-xs shadow-md">
                        <Tag className="w-3 h-3" />
                        <span>From ₹{cat.min_price.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 font-bold text-[11px] shadow-xs">
                        <span>Best Value</span>
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 text-slate-900 text-xs font-black">
                      <Star className="w-3 h-3 fill-[#f5b016] text-[#f5b016]" />
                      <span>{cat.rating || 4.8}</span>
                    </div>
                  </div>

                  {/* TOP RIGHT BADGE: Room Count */}
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/60 z-10">
                    <Home className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-800 text-xs font-bold">
                      {cat.room_count} {cat.room_count === 1 ? 'Stay' : 'Stays'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-200 mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4">
                      {cat.description || 'Authentic riverside accommodation and hotel suites.'}
                    </p>
                  </div>

                  {/* Footer Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900 transition-colors">
                    <span>Browse Stays</span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* View All Stays button */}
        <div className="mt-12 text-center">
          <Link
            href="/stays?view=all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-sm font-bold shadow-sm hover:border-emerald-500 hover:text-emerald-700 hover:shadow-md transition-all"
            id="view-all-stays-link"
          >
            <LayoutGrid className="w-4 h-4" />
            View All Stays List
          </Link>
        </div>
      </div>
    </div>
  );
}
