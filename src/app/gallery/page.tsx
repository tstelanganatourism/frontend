'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  ImageIcon, 
  X, 
  ZoomIn, 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Ship, 
  MapPin, 
  Sparkles, 
  Film, 
  Home, 
  Star, 
  ShieldCheck, 
  Utensils, 
  Music, 
  ArrowRight, 
  Phone 
} from 'lucide-react';
import { getOptimizedCloudinaryVideoUrl, getCloudinaryVideoPosterUrl, getYouTubeEmbedUrl } from '@/lib/utils';
import galleryData from './galleryData.json';

type GalleryItem = {
  url: string;
  lightboxUrl?: string;
  title: string;
  type: 'image' | 'video';
  category: string;
  poster_url?: string;
  duration?: string;
  is_featured?: boolean;
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

      {/* ── COMPACT HERO ── */}
      <div className="relative overflow-hidden bg-[#0f3d56] pt-14 pb-4 sm:pt-16 sm:pb-5 border-b border-slate-200">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d56]/85 via-[#0f3d56]/75 to-[#0f3d56]/95" />

        <div className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center pt-1">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1598a1]/40 bg-[#1598a1]/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#62d5da] backdrop-blur-md mb-4 shadow-sm">
            <Camera className="w-3 h-3 text-[#f5b016]" />
            Official Visual Archive — Godavari Tourism
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mb-3">
            <span className="block text-[#1598a1] font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mb-1.5">
              Landscapes, Moments &amp; Tours
            </span>
            Photo &amp; Drone Video Gallery
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-4">
            High-definition photos and 4K videos of Papikondalu, Godavari trips, bamboo huts, and temples.
          </p>

          {/* Stat Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-200">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 backdrop-blur-sm">
              📷 {totalPhotos}+ HD Photos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1598a1]/20 border border-[#1598a1]/30 px-2.5 py-1 backdrop-blur-sm text-[#62d5da]">
              🎬 {totalVideos} Tour Videos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/15 px-2.5 py-1 backdrop-blur-sm">
              🛥️ Verified Boat Fleet
            </span>
          </div>

        </div>
      </div>

      {/* ── STICKY CATEGORY TABS (LIGHT BRAND PATTERN) ────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm py-3 px-4">
        <div className="max-w-[1700px] mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-none">
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
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* ── FEATURED TOURIST EXPERIENCE & BOAT REVIEW HIGHLIGHT CARD ── */}
        {(activeCategory === 'all' || activeCategory === 'videos') && (
          <div className="mb-10 rounded-3xl overflow-hidden border border-[#1598a1]/30 bg-gradient-to-br from-[#0a2f44] via-[#0e3c54] to-[#072435] shadow-2xl text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-5 sm:p-8">
              
              {/* Media Preview Column (order-1 on mobile, right on desktop) */}
              <div className="lg:col-span-5 lg:order-2">
                <div
                  onClick={() => {
                    const idx = filteredItems.findIndex(i => i.is_featured);
                    setSelectedIndex(idx !== -1 ? idx : 0);
                  }}
                  className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group border border-white/15 shadow-2xl ring-1 ring-cyan-400/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://img.youtube.com/vi/6aSLKxEDli4/hqdefault.jpg"
                    alt="Papikondalu Boat Vihara Yathra Tourist Review"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://media.tstelanganatourism.com/gallery/photos/2T9A7854.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Tourist Review
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10">
                      4K Ultra HD
                    </span>
                  </div>

                  {/* Center Pulsing Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-[#1598a1]/30 animate-ping opacity-75" />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#1598a1] to-[#25c4cf] text-white flex items-center justify-center shadow-[0_0_30px_rgba(21,152,161,0.6)] group-hover:scale-110 transition-all duration-300">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[11px] font-bold text-white z-10 pointer-events-none">
                    <span className="flex items-center gap-1.5 drop-shadow">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Real Customer Feedback
                    </span>
                    <span className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] text-cyan-200">
                      Tap to Watch
                    </span>
                  </div>
                </div>
              </div>

              {/* Text & Content Column (order-2 on mobile, left on desktop) */}
              <div className="lg:col-span-7 lg:order-1 flex flex-col justify-center space-y-4">
                {/* Header Rating & Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 backdrop-blur-md">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    4.9 / 5.0 Rating (1,200+ Reviews)
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#62d5da] bg-[#1598a1]/20 border border-[#1598a1]/40 px-2.5 py-1 rounded-full">
                    Official Highlight
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                    Papikondalu Boat Vihara Yathra
                  </h2>
                  <p className="text-sm sm:text-base font-extrabold text-[#62d5da] mt-1">
                    పాపికొండల బోట్ విహార యాత్ర — Real Tourist Experience &amp; Boat Review
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Experience the true magic of Godavari river cruising through real tourist eyes. See the breathtaking Papikondalu gorges, spacious AC deck seating, delicious Andhra meals, live folk music, and Pochavaram ghat boarding.
                </p>

                {/* Amenities Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-200">
                    <Ship className="w-3.5 h-3.5 text-[#62d5da] shrink-0" />
                    <span>AC Luxury Deck</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-200">
                    <Utensils className="w-3.5 h-3.5 text-[#f5b016] shrink-0" />
                    <span>Andhra Meals</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-200">
                    <Music className="w-3.5 h-3.5 text-[#62d5da] shrink-0" />
                    <span>Music &amp; Dance</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>100% Certified</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const idx = filteredItems.findIndex(i => i.is_featured);
                      setSelectedIndex(idx !== -1 ? idx : 0);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1598a1] hover:bg-[#117f87] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-[#1598a1]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch Video Review
                  </button>
                  <Link
                    href="/packages"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black uppercase tracking-wider border border-white/20 backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Book Tour Package
                    <ArrowRight className="w-4 h-4 text-[#62d5da]" />
                  </Link>
                  <a
                    href="tel:+919951369573"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#f5b016]" />
                    <span>+91 99513 69573</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Camera className="w-8 h-8 text-[#1598a1]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No photos in this category yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Drop your photos into the <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-[#1598a1]">my_gallery_photos</code> folder and run <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono text-[#1598a1]">upload_photos.bat</code> to upload them in bulk!
            </p>
          </div>
        ) : activeCategory === 'videos' ? (
          /* Structured Grid for Videos (16:9 Aspect Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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
          /* Responsive Clean Grid — Curated Photos & Videos */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
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
                getYouTubeEmbedUrl(selectedItem.url, true) ? (
                  /* YouTube Embed Player — Zero Ads, Rel=0, Modestbranding */
                  <div className="w-full max-w-5xl aspect-video max-h-[85vh] sm:max-h-[82vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedItem.url, true)!}
                      title={selectedItem.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  /* Standard Video Player fallback */
                  <video
                    ref={videoRef}
                    key={selectedItem.url}
                    src={getOptimizedCloudinaryVideoUrl(selectedItem.url)}
                    poster={selectedItem.poster_url || getCloudinaryVideoPosterUrl(selectedItem.url) || undefined}
                    controls
                    preload="none"
                    playsInline
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-auto max-h-[85vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-slate-800 bg-black"
                  >
                    <track kind="captions" />
                  </video>
                )
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
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = 'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp';
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {item.is_featured ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest shadow-md">
            ⭐ REVIEW HIGHLIGHT
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1598a1] text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
            <Play className="w-3 h-3 fill-current" />
            VIDEO
          </span>
        )}
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
      className="relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer group border border-slate-200 bg-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View photo: ${item.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.title}
        loading={isAboveFold ? 'eager' : 'lazy'}
        decoding="async"
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = 'https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp';
        }}
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
