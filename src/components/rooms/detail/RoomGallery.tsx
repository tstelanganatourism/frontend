'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface GalleryImage {
  id: number;
  image_url: string;
  alt_text?: string | null;
  is_cover: boolean;
}

interface RoomGalleryProps {
  images: GalleryImage[];
}

export const RoomGallery = ({ images }: RoomGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setSelectedImage((prev) => (prev === null ? 0 : (prev + 1) % images.length));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
  };

  return (
    <section>
      <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[220px]">
        {images.slice(0, 5).map((img, idx) => (
          <button
            type="button"
            key={img.id}
            className={`group relative overflow-hidden rounded-2xl bg-slate-200 text-left shadow-[0_22px_70px_rgba(23,34,50,0.10)] ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            onClick={() => setSelectedImage(idx)}
          >
            <Image
              src={img.image_url}
              alt={img.alt_text || "Room Detail"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[#0b1720]/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Maximize2 className="h-8 w-8 text-white" />
            </div>
          </button>
        ))}
        {images.length > 5 && (
          <button
            type="button"
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white/80 transition duration-300 hover:-translate-y-1 hover:border-[#087f6d]"
            onClick={() => setSelectedImage(5)}
          >
            <span className="text-3xl font-black text-[#172232]">+{images.length - 5}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">More Photos</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl md:p-12">
            <button
              className="absolute right-8 top-8 text-white/50 transition-colors hover:text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-10 w-10" />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-4 text-white/50 transition-colors hover:text-white md:left-8"
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-4 text-white/50 transition-colors hover:text-white md:right-8"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div key={selectedImage} className="relative h-full max-h-[80vh] w-full max-w-6xl">
              <Image
                src={images[selectedImage].image_url}
                alt={images[selectedImage].alt_text || "Lodge Detail"}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        )}
    </section>
  );
};
