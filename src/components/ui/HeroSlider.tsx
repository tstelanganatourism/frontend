'use client';

import Image from 'next/image';

const HERO_SLIDES = [
  {
    src: '/home/godavari-hero-banner.png',
    alt: 'Godavari river cruise through forested hills',
  },
];

export default function HeroSlider() {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_SLIDES[0].src}
          alt={HERO_SLIDES[0].alt}
          fill
          priority
          fetchPriority="high"
          // Responsive sizes: mobile gets 640px-wide image, tablet 1080px, desktop full-width.
          // This prevents the browser from downloading a 3840px desktop image on a 390px phone.
          sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 100vw"
          className="object-cover"
          // 75 is perceptually indistinguishable from 85 for a full-bleed scenic photo,
          // but reduces file size by ~25-30%, directly cutting mobile LCP byte weight.
          quality={75}
        />
      </div>
    </>
  );
}
