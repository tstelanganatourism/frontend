'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Camera } from 'lucide-react';

export type HeroSlide = {
  src: string;
  title: string;
  tag: string;
};

// ─── Curated High-Definition Photos of Boats, Resorts, Stays & River Landscapes ───
// All images use Cloudinary f_auto,q_auto,w_1920 to serve next-gen WebP/AVIF (<100 KB each)
const HERO_SLIDES: HeroSlide[] = [
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786273967/200b2b33-a6c8-474a-b9f1-823c5e0c831a_v9mwdp.jpg',
    title: 'Papikondalu Hilltop Wooden Resort View',
    tag: '🏡 Luxury Hilltop Stay',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786268773/ts_boat_tourism/gallery/boats/ovn5jyixd9i8fqm3fxc2.png',
    title: 'TS Boat Fleet on Godavari River',
    tag: '🚢 Royal Boat Fleet',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786273972/9b475911-9c60-4bf6-9ffb-b9f1802275a2_k6zmkd.jpg',
    title: 'Riverfront Wooden Cottage Bedroom',
    tag: '🛌 Riverfront Cottage',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1785917171/ts_boat_tourism/images/uadyznucdhwm3ti9k6kx.jpg',
    title: 'Golden Sunset on Godavari River',
    tag: '🌅 Sunset Cruise',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    title: 'Kolluru Bamboo Huts Night Camping',
    tag: '🏕️ Bamboo Huts Stay',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786273969/38684131-278f-48aa-8676-49f9dbeb3165_ire1kb.jpg',
    title: 'Scenic Wooden Cottages & Forest Walkway',
    tag: '🌿 Nature Canopy Walkway',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786268845/ts_boat_tourism/gallery/boats/tjhxguxd5wvpw6znkl99.png',
    title: 'Punnami Luxury Double Deck Cruiser',
    tag: '✨ Premium Cruise',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg',
    title: 'Godavari River Campfire & Cultural Night',
    tag: '🔥 Campfire & Dinner',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp',
    title: 'Papikondalu Hill Valley Cruise Journey',
    tag: '🏞️ Papikondalu Valley',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
    title: 'Punnami A/C Passenger Boat Sailing',
    tag: '🚤 Double Deck Boat',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1784613505/ts_boat_tourism/packages/zncuyaavin7cfwtfvkwg.jpg',
    title: 'Deluxe A/C Riverfront Bedroom Interior',
    tag: '⭐ Luxury Resort Stay',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
    title: 'Bhadrachalam to Rajahmundry River Cruise',
    tag: '🌊 Godavari Voyage',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786268819/ts_boat_tourism/gallery/boats/hw0ecntb8tj72hcedixc.png',
    title: 'A/C Luxury Boat — Papikondalu Tour',
    tag: '🚢 A/C Luxury Cruiser',
  },
  {
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1920/v1786268796/ts_boat_tourism/gallery/boats/mztoym0vbry5oy707hbn.png',
    title: 'Boat Boarding at Godavari River Ghat',
    tag: '📍 Boarding Ghat',
  },
];

export default function HeroBackgroundSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mountedIndices, setMountedIndices] = useState<Set<number>>(() => new Set([0, 1]));

  const nextIdx = (currentIdx + 1) % HERO_SLIDES.length;

  // Preload upcoming slide
  useEffect(() => {
    setMountedIndices((prev) => {
      if (prev.has(nextIdx)) return prev;
      const next = new Set(prev);
      next.add(nextIdx);
      return next;
    });
  }, [nextIdx]);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIdx, isPaused]);

  const currentSlide = HERO_SLIDES[currentIdx];

  const handlePrev = () => {
    const prev = (currentIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    setMountedIndices((s) => {
      const n = new Set(s);
      n.add(prev);
      return n;
    });
    setCurrentIdx(prev);
  };

  const handleNext = () => {
    setMountedIndices((s) => {
      const n = new Set(s);
      n.add(nextIdx);
      return n;
    });
    setCurrentIdx(nextIdx);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#021c24] select-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* ── HIGH-RES OPTIMIZED SLIDES (Smooth Cross-Fade & Ken-Burns Zoom) ─── */}
      {HERO_SLIDES.map((slide, i) => {
        if (!mountedIndices.has(i)) return null;
        const isActive = i === currentIdx;
        return (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={isActive ? 'high' : 'low'}
              decoding="async"
              width={1920}
              height={1080}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              className={`h-full w-full object-cover object-center transition-transform duration-[6500ms] ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        );
      })}

      {/* ── GRADIENT OVERLAYS FOR CRISP TEXT READABILITY ──────────────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#021c24]/85 via-[#021c24]/50 to-[#021c24]/90 lg:bg-gradient-to-r lg:from-[#021c24]/90 lg:via-[#021c24]/55 lg:to-[#021c24]/30"
        style={{ zIndex: 20 }}
      />

      {/* ── SLIDE BADGE & INTERACTIVE CAROUSEL CONTROLS ─────────────────── */}
      <div
        className="absolute bottom-6 left-6 z-30 hidden sm:flex items-center gap-3 bg-black/50 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-full text-white text-xs font-extrabold shadow-xl"
        style={{ zIndex: 30 }}
      >
        <span className="px-2.5 py-0.5 rounded-full bg-[#1598a1] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
          {currentSlide.tag}
        </span>
        <span className="text-slate-200 text-xs font-semibold max-w-[240px] truncate">
          {currentSlide.title}
        </span>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5 ml-2 border-l border-white/20 pl-2.5">
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Play Slideshow' : 'Pause Slideshow'}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Counter */}
        <span className="text-[10px] text-slate-400 font-bold ml-1">
          {currentIdx + 1}/{HERO_SLIDES.length}
        </span>
      </div>
    </div>
  );
}
