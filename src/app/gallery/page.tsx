'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ImageIcon, X, ZoomIn, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

import galleryData from './galleryData.json';

const GALLERY_IMAGES = galleryData;

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % GALLERY_IMAGES.length);
  }, [selectedIndex]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, [selectedIndex]);

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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    setTouchStart(null);
  };

  return (
    <div className="bg-[#F9F9F7]">
      {/* Unique State-of-the-Art Hero Canvas */}
      <div className="relative overflow-hidden bg-slate-950 pb-16 pt-24 sm:pb-20 sm:pt-32">
        {/* Ambient Glow Effects */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        
        {/* Rich Photography Background Image */}
        <Image
          src="/images/gallery_hero_bg.png"
          alt="Gallery Hero"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md shadow-xs">
            <Camera className="h-3.5 w-3.5 text-amber-300" />
            Visual Photography Archive
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-6xl leading-[1.1]">
            <span className="block text-indigo-400 font-extrabold text-xl sm:text-2xl uppercase tracking-widest mb-1.5">Godavari Landscapes & Moments</span>
            <span className="block text-white drop-shadow-sm">The Gallery</span>
          </h1>

          <p className="mb-6 max-w-xl mx-auto text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
            Immerse yourself in the breathtaking landscapes of the Godavari. Every photo tells a story of tranquility, nature, and river adventure.
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-bold text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 backdrop-blur-xs">
              📷 40+ HD Photos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 backdrop-blur-xs">
              🌄 Papikondalu & Maredumilli
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3.5 py-1.5 backdrop-blur-xs">
              🛥️ Authentic Cruises
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {GALLERY_IMAGES.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-3xl cursor-pointer break-inside-avoid shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 bg-slate-200"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={image.url}
                alt={image.title}
                loading="lazy"
                className="w-full h-auto object-cover transform transition-transform duration-1000 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-river)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-white font-bold text-lg mb-1 block">
                    {image.title}
                  </span>
                  <div className="flex items-center gap-2 text-[var(--color-brand-teal)] text-[10px] font-black uppercase tracking-[0.2em]">
                    <ZoomIn className="h-3.5 w-3.5" />
                    View Detail
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button - High Visibility */}
          <button
            className="absolute top-6 right-6 p-4 text-white hover:text-[var(--color-brand-teal)] bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full transition-all z-[1100] group shadow-2xl cursor-pointer"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Navigation Arrows - High Visibility */}
          <button
            className="absolute left-6 p-5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full transition-all hidden md:flex z-[1100] shadow-2xl cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            className="absolute right-6 p-5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full transition-all hidden md:flex z-[1100] shadow-2xl cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          {/* Main Image Container */}
          <div className="w-full h-full flex flex-col items-center justify-center p-4 select-none" onClick={() => setSelectedIndex(null)}>
            <div className="relative w-full h-full max-h-[85vh] max-w-[95vw] flex items-center justify-center group" onClick={(e) => e.stopPropagation()}>
              <img
                key={GALLERY_IMAGES[selectedIndex].url}
                src={GALLERY_IMAGES[selectedIndex].url}
                alt={GALLERY_IMAGES[selectedIndex].title}
                className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-[0_0_150px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-500 min-w-[300px] md:min-w-[65vw]"
              />
            </div>

            {/* Metadata Section */}
            <div className="mt-6 text-center animate-in slide-in-from-top-4 duration-700 delay-200">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">
                {GALLERY_IMAGES[selectedIndex].title}
              </h2>
              <p className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
                Image {selectedIndex + 1} of {GALLERY_IMAGES.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
