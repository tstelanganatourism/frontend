'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ImageIcon, X, ZoomIn, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_IMAGES = [
  // Newly uploaded Papikondalu and Maredumilli photos
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431995/papikondalu-tour-packages-ap-15_adycoe.jpg", title: "Papikondalu Tour Package" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431993/papikondalu-tour-packages-ap-14_ipdsvc.jpg", title: "Papikondalu Adventure" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431964/Papikondalu_1_Day_Tour_65a1_uw2490.jpg", title: "Papikondalu 1 Day Tour" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431961/Papikondalu_1_Day_Tour_5cc6_eet9fd.jpg", title: "Papikondalu River View" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431956/papikondalu-tour-packages-ap-7_cfwphr.jpg", title: "Godavari Riverside" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431952/papikondalu-tour-packages-ap-2_s9wrav.jpg", title: "Scenic Papikondalu" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431946/papikondalu-tour-packages-ap-11_h1s0y9.jpg", title: "Papikondalu Landscape" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431943/papikondalu-tour-packages-ap-1_hje1jh.jpg", title: "Boat Tour Experience" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431938/papikondalu-5_f8jdvq.png", title: "Papikondalu Cruise" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431929/papikondalu-4_xjvjro.png", title: "Papikondalu Beauty" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431926/papikondalu-3_jg6thw.png", title: "Godavari Waters" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431922/papikondalu-sunset_bmvm1e.jpg", title: "Papikondalu Sunset" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431919/papikondalu-1_wvjks3.png", title: "Papikondalu Nature" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431906/maredumilli-2_zjweff.jpg", title: "Maredumilli Forest" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431903/maredumilli-1_lkxuot.jpg", title: "Maredumilli Nature Camp" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431900/maredumilli-5_tdeltk.jpg", title: "Maredumilli Waterfall" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431897/maredumilli-4_kptvk6.jpg", title: "Maredumilli Jungle Safari" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431895/maredumilli-6_zst608.jpg", title: "Maredumilli Streams" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431893/maredumilli-8_hvwiun.jpg", title: "Maredumilli Greenery" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431890/maredumilli-7_zm0kzz.jpg", title: "Maredumilli Resort View" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431887/maredumilli-11_zluh4b.jpg", title: "Maredumilli Eco Tourism" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431884/maredumilli-10_ctlppk.jpg", title: "Maredumilli Trees" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431881/maredumilli-14_urkstf.jpg", title: "Maredumilli Scenic Spot" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431879/maredumilli-9_crcjml.jpg", title: "Maredumilli Wilderness" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431877/maredumilli-12_isygta.jpg", title: "Maredumilli Viewpoint" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431874/maredumilli-15_dg5pjn.jpg", title: "Maredumilli Exploration" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431872/maredumilli-13_mdqgmv.jpg", title: "Maredumilli Deep Woods" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779431871/maredumilli-16_sgs35x.jpg", title: "Maredumilli Photography" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779391908/ts_tours/eudxii55l3uutjif2jgn.png", title: "TS Tours Moment" },
  { url: "https://res.cloudinary.com/dpdab3e97/image/upload/v1779391905/ts_tours/dzlmnm6zmhqmnveornyp.png", title: "TS Tours Memory" },

  // Keep a few legacy hero images
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432996/5bbee6a1-5edf-46c0-92b5-00b11612644b.png', title: 'Breathtaking Godavari Horizon' },
  { url: 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779432924/papikondalu-tour-packages-ap-8_w5qssm.jpg', title: 'River Sunset Glow' }
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
    <div className="bg-[#F9F9F7]">
      {/* Premium Hero Header */}
      <div className="relative h-[45vh] min-h-[320px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779433086/50a543e0-c479-4770-aeff-c6148fc985cb.png"
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
