'use client';

import React, { useState, useEffect } from 'react';

// ─── Local instant WebP slides + Cloudinary CDN images ───────────────────────
const SLIDES = [
  '/images/boat-rides-banner-2026.webp',
  '/images/stays-banner-2026.webp',
  '/images/sightseeing-banner-2026.webp',
  'https://res.cloudinary.com/r929tquv/image/upload/q_auto,f_auto,w_1920/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/q_auto,f_auto,w_1920/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/q_auto,f_auto,w_1920/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
];

export default function HeroBackgroundSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#07242c]"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {SLIDES.map((src, i) => {
        const isActive = i === currentIdx;
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={src}
              alt="Papikondalu Godavari River Cruise Hero Background"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
            />
          </div>
        );
      })}

      {/* Balanced, elegant gradient overlay — readable text, clear background imagery */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#021c24]/75 via-[#021c24]/40 to-[#021c24]/80 lg:bg-gradient-to-r lg:from-[#021c24]/85 lg:via-[#021c24]/45 lg:to-transparent"
        style={{ zIndex: 20 }}
      />
    </div>
  );
}


