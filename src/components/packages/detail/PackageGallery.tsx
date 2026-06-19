'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getHdImageUrl } from '@/lib/utils';
import { useLightbox } from '@/hooks/useLightbox';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text?: string | null;
  is_cover: boolean;
}

interface PackageGalleryProps {
  gallery: GalleryImage[];
}

export function PackageGallery({ gallery }: PackageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!gallery || gallery.length === 0) return null;

  const moveSlide = (direction: 'left' | 'right') => {
    setActiveIdx((prev) => {
      if (direction === 'left') return (prev - 1 + gallery.length) % gallery.length;
      return (prev + 1) % gallery.length;
    });
  };

  const { handlers: lightboxHandlers } = useLightbox({
    isOpen: lightboxOpen,
    onClose: () => setLightboxOpen(false),
    onNext: () => moveSlide('right'),
    onPrev: () => moveSlide('left'),
  });

  const activeSlide = gallery[activeIdx];

  return (
    <>
      <section id="gallery" className="scroll-mt-[170px]">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#1a6b7a]">
            <Camera className="h-3.5 w-3.5" />
            Experience Visualised
          </span>
          <h2 className="mt-2 text-3xl font-black text-[#0f3d56] tracking-tight md:text-4xl">Tour Gallery</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Browse photographs from this route, stopovers, and scenic river stretches.</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {gallery.filter(slide => slide.image_url).map((slide, index) => (
            <button
              key={slide.id || index}
              type="button"
              onClick={() => {
                setActiveIdx(gallery.indexOf(slide));
                setLightboxOpen(true);
              }}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:scale-[1.03] hover:shadow-lg hover:border-[#0f8d7d]/30 focus:outline-none focus:ring-2 focus:ring-[#0f8d7d]"
              aria-label={`View photo ${index + 1}`}
            >
              <Image src={getHdImageUrl(slide.image_url)} alt={slide.alt_text || `Gallery photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-300 hover:scale-105" quality={85} />
            </button>
          ))}
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm" {...lightboxHandlers}>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-white/70">
              {activeIdx + 1} of {gallery.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close gallery"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center p-2 md:p-8">
            {gallery.length > 1 && (
              <button
                onClick={() => moveSlide('left')}
                className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:left-8"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            )}
            <div className="relative w-full max-w-6xl" style={{ height: '70vh' }}>
              {getHdImageUrl(activeSlide.image_url) ? (
                <Image src={getHdImageUrl(activeSlide.image_url)} alt={activeSlide.alt_text || 'Tour Photo'} fill sizes="100vw" className="object-contain" quality={85} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/40">
                  <Camera className="h-16 w-16" />
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <button
                onClick={() => moveSlide('right')}
                className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:right-8"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
