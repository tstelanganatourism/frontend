'use client';

import React, { useState, useEffect } from 'react';

// ─── Local high-resolution hero background slides ───────────────────────
const SLIDES = [
  'https://res.cloudinary.com/r929tquv/image/upload/w_1600,f_auto,q_auto/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png',
  'https://res.cloudinary.com/r929tquv/image/upload/w_1600,f_auto,q_auto/v1785917189/ts_boat_tourism/images/kk1enmetydnvtwall1aw.webp',
  'https://res.cloudinary.com/r929tquv/image/upload/w_1600,f_auto,q_auto/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp',
  '/home/godavari-hero-banner.jpg',
  '/home/hero-boat.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/w_1600,f_auto,q_auto/v1785917160/ts_boat_tourism/images/qtfotnjzc08vf9qji54f.webp',
  'https://res.cloudinary.com/r929tquv/image/upload/w_1600,f_auto,q_auto/v1785917193/ts_boat_tourism/images/tvyoclvxd9gjgvdxwu0i.webp',
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
              fetchPriority={i === 0 ? 'high' : 'low'}
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


