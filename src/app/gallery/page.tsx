'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ImageIcon, X, ZoomIn, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_IMAGES = [
  // User provided new images
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915621/download_pbhj2g.jpg', title: 'Breathtaking Godavari Horizon' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915618/download_p2otqu.jpg', title: 'Serene Sunset at Bhadrachalam' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915616/download_ethlqv.jpg', title: 'Morning Boat Expedition' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915614/download_cwmdx5.jpg', title: 'Traditional Temple Architecture' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915602/download_vwq2qz.jpg', title: 'Majestic Papikondalu Hills' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915596/download_hwvdag.jpg', title: 'Luxury River Cruise' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915592/download_nli1hu.jpg', title: 'Lush Green Riverside' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915586/download_r2yxu1.jpg', title: 'Calm Godavari Waters' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915577/download_sba73y.jpg', title: 'Nature\'s Riverside Escape' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915477/455c0ca2-d017-4399-bf8d-b7abbefd4d6b.png', title: 'Bhadrachalam Ghat View' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778915516/download_tkimtx.jpg', title: 'Godavari River Bank' },

  // Trip/Slider Images
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912157/slider1_p9iape.jpg', title: 'Golden Morning Cruise' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912203/slider4_rikfsq.jpg', title: 'Cinematic Mountain Vista' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg', title: 'River Sunset Glow' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912248/slider2_souyzb.jpg', title: 'Misty River Trail' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912273/slider3_bx3qsu.jpg', title: 'Endless Godavari Horizon' },

  // Package Images
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912633/telpkg11_jlak8x.jpg', title: 'Cultural Tour Experience' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912635/telpkg21_qgjrl1.jpg', title: 'Weekend Adventure Trip' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912638/telpkg31_l5z0jc.jpg', title: 'Premium Luxury Boat' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912641/telpkg41_mblbra.jpg', title: 'Deep Forest Expedition' },
];

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
    <div className="bg-[#F9F9F7] min-h-screen">
      {/* Premium Hero Header */}
      <div className="relative h-[45vh] min-h-[320px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg"
          alt="Gallery Hero"
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-river)]/80 via-[var(--color-brand-river)]/60 to-[var(--color-brand-river)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] font-bold tracking-[0.2em] uppercase mb-4 animate-in slide-in-from-bottom duration-700">
            <Camera className="h-3.5 w-3.5 text-[var(--color-brand-teal)]" />
            Visual Archive
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight animate-in slide-in-from-bottom duration-1000 delay-100">
            The <span className="text-[var(--color-brand-sand)]">Gallery</span>
          </h1>
          <p className="text-white/70 text-base max-w-xl mx-auto animate-in slide-in-from-bottom duration-1000 delay-200">
            Immerse yourself in the breathtaking landscapes of the Godavari.
            Every photo tells a story of tranquility and adventure.
          </p>
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
