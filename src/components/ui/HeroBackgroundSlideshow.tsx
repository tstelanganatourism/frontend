'use client';

import React from 'react';

// ─── Slide images ─────────────────────────────────────────────────────────
const SLIDES = [
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613510/ts_boat_tourism/packages/aj0lva1rynjpuv6xayzg.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613514/ts_boat_tourism/packages/zkxrdmxykszetgupmi8d.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613511/ts_boat_tourism/packages/ywm9affxxbtriy8szyp2.jpg',
  'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg',
];

// Each slide stays visible for SLIDE_SECS seconds; crossfade lasts FADE_SECS seconds.
const SLIDE_SECS = 6;
const FADE_SECS = 1.5;
const TOTAL_SECS = SLIDES.length * SLIDE_SECS; // 36s full cycle

// Keyframe percentages
const fadeInEnd   = ((FADE_SECS / TOTAL_SECS) * 100).toFixed(2);     // ~4.17%
const holdEnd     = (((SLIDE_SECS - FADE_SECS) / TOTAL_SECS) * 100).toFixed(2); // ~12.5%
const fadeOutEnd  = ((SLIDE_SECS / TOTAL_SECS) * 100).toFixed(2);    // ~16.67%

const KEYFRAMES = `
  @keyframes heroSlide {
    0%              { opacity: 0; transform: scale(1.08); }
    ${fadeInEnd}%   { opacity: 1; transform: scale(1.04); }
    ${holdEnd}%     { opacity: 1; transform: scale(1.01); }
    ${fadeOutEnd}%  { opacity: 0; transform: scale(1.0);  }
    100%            { opacity: 0; transform: scale(1.08); }
  }
`;

export default function HeroBackgroundSlideshow() {
  return (
    <>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Background layer — sits at z-0, below all hero content */}
      <div
        className="absolute inset-0 overflow-hidden bg-[#07242c]"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${src})`,
              /* Pure CSS animation — no JS state involved */
              animation: `heroSlide ${TOTAL_SECS}s ease-in-out ${i * SLIDE_SECS}s infinite both`,
              willChange: 'opacity, transform',
            }}
          />
        ))}

        {/* Gradient overlay — always on top of the images */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#021c24]/85 via-[#021c24]/50 to-[#021c24]/90 lg:bg-gradient-to-r lg:from-[#021c24]/92 lg:via-[#06373f]/60 lg:to-[#021c24]/40"
          style={{ zIndex: 1 }}
        />
      </div>
    </>
  );
}
