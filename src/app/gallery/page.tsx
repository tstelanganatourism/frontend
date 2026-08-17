'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImageIcon, X, ZoomIn, Camera, ChevronLeft, ChevronRight, Play, Ship, MapPin, Sparkles, Film, Home } from 'lucide-react';
import galleryData from './galleryData.json';

type GalleryItem = {
  url: string;
  lightboxUrl?: string;
  title: string;
  type: 'image' | 'video';
  category: string;
  poster_url?: string;
  duration?: string;
};

const ALL_ITEMS: GalleryItem[] = galleryData as GalleryItem[];

type Category = 'all' | 'boats' | 'stay' | 'experiences' | 'videos';

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; count: (items: GalleryItem[]) => number }[] = [
  { id: 'all',         label: 'All Media',           icon: Camera,   count: (items) => items.length },
  { id: 'videos',      label: 'Drone & Videos',      icon: Play,     count: (items) => items.filter(i => i.type === 'video').length },
  { id: 'boats',       label: 'Our Boats',           icon: Ship,     count: (items) => items.filter(i => i.category === 'boats').length },
  { id: 'stay',        label: 'Rooms, Huts & Stays', icon: Home,     count: (items) => items.filter(i => i.category === 'stay').length },
  { id: 'experiences', label: 'Experiences & Places',icon: Sparkles, count: (items) => items.filter(i => i.category === 'experiences').length },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const filteredItems = activeCategory === 'all'
    ? ALL_ITEMS
    : activeCategory === 'videos'
    ? ALL_ITEMS.filter(i => i.type === 'video')
    : ALL_ITEMS.filter(i => i.category === activeCategory);

  const selectedItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [selectedIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [selectedIndex, filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  // Pause video on modal close
  useEffect(() => {
    if (selectedIndex === null && videoRef.current) {
      videoRef.current.pause();
    }
  }, [selectedIndex]);

  // Lock body scroll
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedIndex]);

  // Touch Swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    if (diff < -40) handlePrev();
    setTouchStart(null);
  };

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedIndex(null);
  };

  const totalPhotos = ALL_ITEMS.filter(i => i.type === 'image').length;
  const totalVideos = ALL_ITEMS.filter(i => i.type === 'video').length;

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-slate-900 font-sans selection:bg-[#1598a1] selection:text-white pb-20">

      {/* ── ORIGINAL BRAND HERO ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0f3d56] pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-slate-200">
        {/* Background Image Overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1600/v1785917171/ts_boat_tourism/images/uadyznucdhwm3ti9k6kx.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d56]/85 via-[#0f3d56]/75 to-[#0f3d56]/95" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-teal-300 backdrop-blur-md mb-4 shadow-sm">
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            Official Visual Archive — Godavari Tourism
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4">
            <span className="block text-teal-300 font-bold text-lg sm:text-2xl uppercase tracking-widest mb-1">
              Landscapes, Moments &amp; Tours
            </span>
            <span className="block text-white">Photo &amp; Drone Video Gallery</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-200 text-sm sm:text-base font-medium leading-relaxed mb-6">
            Explore high-definition photos and 4K aerial drone videos of Papikondalu gorges, Godavari river cruises, Kolluru bamboo huts, and sacred shrines.
          </p>

          {/* Stat Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-200">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-1.5 backdrop-blur-sm">
              📷 {totalPhotos}+ HD Photos
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-teal-500/20 border border-teal-400/30 px-3.5 py-1.5 backdrop-blur-sm text-teal-200">
              🎬 {totalVideos} Drone &amp; Tour Videos
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-1.5 backdrop-blur-sm">
              🛥️ Verified Cruise Fleet
            </span>
          </div>
        </div>
      </div>

      {/* ── STICKY CATEGORY TABS (LIGHT BRAND PATTERN) ────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(({ id, label, icon: Icon, count }) => {
            const n = count(ALL_ITEMS);
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                id={`gallery-tab-${id}`}
                onClick={() => handleCategoryChange(id)}
                className={`inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1598a1] text-white shadow-sm scale-[1.02]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GALLERY GRID (CLEAN LIGHT CARDS) ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeCategory === 'videos' ? (
          /* Structured Grid for Videos (16:9 Aspect Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <VideoCard
                key={`video-${item.url}-${index}`}
                item={item}
                index={index}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        ) : (
          /* Responsive Clean Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => (
              item.type === 'video' ? (
                <VideoCard
                  key={`mixed-v-${item.url}-${index}`}
                  item={item}
                  index={index}
                  onClick={() => setSelectedIndex(index)}
                />
              ) : (
                <PhotoCard
                  key={`mixed-p-${item.url}-${index}`}
                  item={item}
                  index={index}
                  isAboveFold={index < 8}
                  onClick={() => setSelectedIndex(index)}
                  onLoad={() => setImgLoaded(prev => ({ ...prev, [item.url]: true }))}
                  loaded={!!imgLoaded[item.url]}
                />
              )
            ))}
          </div>
        )}
      </div>

      {/* ── RESPONSIVE LIGHTBOX (VERTICAL MOBILE FILL) ───────────────────── */}
      {selectedIndex !== null && selectedItem && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setSelectedIndex(null)}
          aria-modal
          role="dialog"
          aria-label={`Viewing: ${selectedItem.title}`}
        >

          {/* 1. TOP HEADER BAR */}
          <div
            className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${
                selectedItem.type === 'video' ? 'bg-[#1598a1] text-white shadow-sm' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {selectedItem.type === 'video' ? '🎬 Drone Video' : '📷 Photo'}
              </span>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-base font-extrabold text-white truncate leading-tight">
                  {selectedItem.title}
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider">
                  {selectedIndex + 1} of {filteredItems.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                className="p-2 sm:p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="p-2 sm:p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                id="gallery-lightbox-close"
                className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer group"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* 2. MEDIA CANVAS (FILLS VERTICAL SPACE ON MOBILE PERFECTLY) */}
          <div
            className="flex-1 w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden relative"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Desktop Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  className="absolute left-4 z-30 p-4 text-white/70 hover:text-white bg-slate-900/70 hover:bg-slate-800 backdrop-blur-xl border border-white/10 rounded-full transition-all cursor-pointer hidden sm:flex shadow-2xl"
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  aria-label="Previous Media"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  className="absolute right-4 z-30 p-4 text-white/70 hover:text-white bg-slate-900/70 hover:bg-slate-800 backdrop-blur-xl border border-white/10 rounded-full transition-all cursor-pointer hidden sm:flex shadow-2xl"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  aria-label="Next Media"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            {/* Video / Photo Element */}
            <div
              className="relative w-full h-full flex items-center justify-center max-w-5xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' ? (
                /* Video Player - Fills available vertical space on mobile up to 85vh */
                <video
                  ref={videoRef}
                  key={selectedItem.url}
                  src={selectedItem.url}
                  poster={selectedItem.poster_url}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-auto max-h-[85vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-slate-800 bg-black"
                >
                  <track kind="captions" />
                </video>
              ) : (
                /* High-Res Photo */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={selectedItem.lightboxUrl || selectedItem.url}
                  src={selectedItem.lightboxUrl || selectedItem.url}
                  alt={selectedItem.title}
                  className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              )}
            </div>
          </div>

          {/* 3. BOTTOM CAPTION & MOBILE NAVIGATION */}
          <div
            className="w-full px-4 py-3 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-extrabold text-white leading-tight">
                {selectedItem.title}
              </h3>
              <p className="text-[10px] text-[#1598a1] font-bold uppercase tracking-widest">
                TS Boat Tourism Official Collection
              </p>
            </div>

            {/* Mobile Touch Swipe Controls */}
            {filteredItems.length > 1 && (
              <div className="flex sm:hidden items-center gap-3 w-full justify-between pt-1 border-t border-slate-800/80">
                <button
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-1 active:bg-slate-700"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-[10px] font-black text-slate-400">
                  {selectedIndex + 1} / {filteredItems.length}
                </span>
                <button
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-1 active:bg-slate-700"
                  onClick={handleNext}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── VIDEO CARD (16:9 CLEAN BRAND CARD) ────────────────────────────────────
function VideoCard({
  item,
  index,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}) {
  return (
    <div
      className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${item.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Poster Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.poster_url || item.url}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1598a1] text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
          <Play className="w-3 h-3 fill-current" />
          VIDEO
        </span>
        <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold">
          {index + 1}
        </span>
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#1598a1] transition-all duration-300">
          <Play className="w-6 h-6 text-[#1598a1] group-hover:text-white fill-current ml-0.5 transition-colors" />
        </div>
      </div>

      {/* Bottom Title */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10">
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-teal-200 transition-colors drop-shadow-sm">
          {item.title}
        </h3>
        <p className="text-[10px] font-bold text-teal-300 uppercase tracking-wider mt-0.5">
          Tap to play video
        </p>
      </div>
    </div>
  );
}

// ── PHOTO CARD (CLEAN LIGHT CARD) ──────────────────────────────────────────
function PhotoCard({
  item,
  index,
  isAboveFold,
  onClick,
  onLoad,
  loaded,
}: {
  item: GalleryItem;
  index: number;
  isAboveFold: boolean;
  onClick: () => void;
  onLoad: () => void;
  loaded: boolean;
}) {
  return (
    <div
      className="relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer group border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View photo: ${item.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Skeleton shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.title}
        loading={isAboveFold ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={onLoad}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <span className="text-white font-bold text-xs line-clamp-1">{item.title}</span>
        <span className="text-teal-300 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
          <ZoomIn className="w-3 h-3" /> View Photo
        </span>
      </div>
    </div>
  );
}
