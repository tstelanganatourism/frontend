'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Image as ImageIcon, ChevronLeft, ChevronRight, Pause } from 'lucide-react';

export type HeroSlide = {
  type: 'video' | 'image';
  src: string;
  poster?: string;
  title: string;
  tag: string;
};

// ─── Hero background slides combining 4K drone videos, cruise clips & luxury resort stays ───
const HERO_SLIDES: HeroSlide[] = [
  {
    type: 'video',
    src: 'https://res.cloudinary.com/r929tquv/video/upload/v1786268917/ts_boat_tourism/videos/gallery/xvoonmz7yc8ncbyzjypv.mp4',
    poster: 'https://res.cloudinary.com/r929tquv/video/upload/so_2,w_1200,c_fill/v1786268917/ts_boat_tourism/videos/gallery/xvoonmz7yc8ncbyzjypv.jpg',
    title: 'Papikondalu Aerial Drone Flight',
    tag: '🛸 4K Aerial View',
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1600/v1786273967/200b2b33-a6c8-474a-b9f1-823c5e0c831a_v9mwdp.jpg',
    title: 'Papikondalu Hilltop Wooden Resort View',
    tag: '🏡 Luxury Hilltop Stay',
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/r929tquv/video/upload/v1786268926/ts_boat_tourism/videos/gallery/vy6edx23zdooas1rwhq6.mp4',
    poster: 'https://res.cloudinary.com/r929tquv/video/upload/so_2,w_1200,c_fill/v1786268926/ts_boat_tourism/videos/gallery/vy6edx23zdooas1rwhq6.jpg',
    title: 'Godavari River Gorges — Drone Shot',
    tag: '🚁 River Gorges',
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1600/v1786268773/ts_boat_tourism/gallery/boats/ovn5jyixd9i8fqm3fxc2.png',
    title: 'TS Luxury Cruise Fleet on Godavari',
    tag: '🚢 Luxury Cruise Fleet',
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/r929tquv/video/upload/v1786268870/ts_boat_tourism/videos/gallery/vvokrkgttqxkwy1zungp.mp4',
    poster: 'https://res.cloudinary.com/r929tquv/video/upload/so_2,w_1200,c_fill/v1786268870/ts_boat_tourism/videos/gallery/vvokrkgttqxkwy1zungp.jpg',
    title: 'Godavari Cruise Voyage Experience',
    tag: '🎬 Live Cruise Voyage',
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1600/v1786273972/9b475911-9c60-4bf6-9ffb-b9f1802275a2_k6zmkd.jpg',
    title: 'Riverfront Wooden Cottage Bedroom',
    tag: '🛌 Riverfront Cottage',
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/r929tquv/video/upload/v1786268937/ts_boat_tourism/videos/gallery/sga9z6mecenep4dmxv5w.mp4',
    poster: 'https://res.cloudinary.com/r929tquv/video/upload/so_2,w_1200,c_fill/v1786268937/ts_boat_tourism/videos/gallery/sga9z6mecenep4dmxv5w.jpg',
    title: 'Papikondalu Mountain Panorama',
    tag: '🏔️ Mountain Sweep',
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1600/v1785917171/ts_boat_tourism/images/uadyznucdhwm3ti9k6kx.jpg',
    title: 'Golden Sunset on Godavari River',
    tag: '🌅 Sunset Scenery',
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/r929tquv/video/upload/v1786268879/ts_boat_tourism/videos/gallery/cwysrwe0ja38viwwgehq.mp4',
    poster: 'https://res.cloudinary.com/r929tquv/video/upload/so_2,w_1200,c_fill/v1786268879/ts_boat_tourism/videos/gallery/cwysrwe0ja38viwwgehq.jpg',
    title: 'Scenic River Voyage Experience',
    tag: '🚤 Scenic Voyage',
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/r929tquv/image/upload/f_auto,q_auto,w_1600/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
    title: 'Kolluru Bamboo Huts Night Stay',
    tag: '🏕️ Bamboo Huts Stay',
  },
];

export default function HeroBackgroundSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Advance slides automatically
  useEffect(() => {
    if (isPaused) return;

    const currentSlide = HERO_SLIDES[currentIdx];
    // Slightly longer duration for videos so user can enjoy the footage
    const slideDuration = currentSlide.type === 'video' ? 8500 : 6500;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [currentIdx, isPaused]);

  // Handle video play/pause sync when slide changes
  useEffect(() => {
    videoRefs.current.forEach((vEl, idx) => {
      if (!vEl) return;
      if (idx === currentIdx) {
        vEl.currentTime = 0;
        const playPromise = vEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy fallback (silent catch)
          });
        }
      } else {
        vEl.pause();
      }
    });
  }, [currentIdx]);

  const currentSlide = HERO_SLIDES[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#021c24] select-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* ── SLIDE MEDIA ITEMS ────────────────────────────────────────────── */}
      {HERO_SLIDES.map((slide, i) => {
        const isActive = i === currentIdx;
        return (
          <div
            key={`${slide.type}-${slide.src}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.type === 'video' ? (
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={slide.src}
                poster={slide.poster}
                autoPlay
                loop
                muted
                playsInline
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={slide.src}
                alt={slide.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                className="h-full w-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
              />
            )}
          </div>
        );
      })}

      {/* ── GRADIENT OVERLAY (BALANCED READABILITY + VISUAL VIBRANCY) ─────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#021c24]/85 via-[#021c24]/50 to-[#021c24]/90 lg:bg-gradient-to-r lg:from-[#021c24]/90 lg:via-[#021c24]/55 lg:to-[#021c24]/30"
        style={{ zIndex: 20 }}
      />

      {/* ── SLIDE BADGE & INDICATORS (BOTTOM LEFT DESKTOP / TOP RIGHT MOBILE) ─ */}
      <div
        className="absolute bottom-6 left-6 z-30 hidden sm:flex items-center gap-3 bg-black/45 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-full text-white text-xs font-extrabold shadow-lg"
        style={{ zIndex: 30 }}
      >
        <span className="px-2 py-0.5 rounded-full bg-[#1598a1] text-white text-[10px] font-black uppercase tracking-wider">
          {currentSlide.tag}
        </span>
        <span className="text-slate-200 text-xs font-semibold max-w-[220px] truncate">
          {currentSlide.title}
        </span>

        {/* Carousel controls */}
        <div className="flex items-center gap-1 ml-2 border-l border-white/20 pl-2">
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
      </div>
    </div>
  );
}
