'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Home, ArrowRight, Sparkles, LayoutGrid, Star, Tag } from 'lucide-react';
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

export default function RoomCategoriesGrid({ categories }: { categories: RoomCategory[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full min-h-screen bg-slate-50/50">
      {/* State-of-the-Art Hero Canvas (Image 2 Banner Style) */}
      <div className="relative overflow-hidden bg-slate-950 pb-12 pt-20 sm:pb-16 sm:pt-24">
        {/* Ambient Glow Effects */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Photography Background Image */}
        <Image
          src="/images/stays_hero_bg.png"
          alt="Stay Categories Canvas Background"
          fill
          sizes="100vw"
          className="object-cover opacity-75 pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/55 to-emerald-950/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Explore Stay Categories</span>
          </div>

          <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            <span className="block text-emerald-400 font-extrabold text-sm sm:text-base uppercase tracking-widest mb-1.5">
              Riverside Accommodation
            </span>
            <span className="block text-white drop-shadow-md">
              Select Your Stay Type
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Select a category to explore riverfront bamboo huts, eco resorts, and comfortable pilgrim lodges.
          </p>
        </div>
      </div>

      {/* Categories Grid (Clean Light Card Design) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                  {cat.cover_image_url ? (
                    <Image
                      src={cat.cover_image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-emerald-700 flex items-center justify-center">
                      <BedDouble className="w-16 h-16 text-white/40" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 opacity-90" />

                  {/* TOP LEFT BADGES: Price & Rating */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    {/* Price Badge */}
                    {cat.min_price ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-amber-400/40 text-amber-300 font-extrabold text-xs shadow-md">
                        <Tag className="w-3 h-3 text-amber-300" />
                        <span>From ₹{cat.min_price.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 font-bold text-[11px] shadow-xs">
                        <span>Best Value</span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 text-slate-900 text-xs font-black">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-sm font-bold shadow-sm hover:border-emerald-500 hover:text-emerald-700 transition-all"
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
