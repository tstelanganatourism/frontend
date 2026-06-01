import React from 'react';
import HeroCarouselClient from './HeroCarouselClient';
import { apiFetch } from '@/lib/api';

export default async function HeroBody() {
  let apiSlides = [];
  try {
    const res = await apiFetch('/api/v1/carousel', { next: { revalidate: 60, tags: ['carousel'] } });
    if (res.ok) {
      apiSlides = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch carousel slides:", err);
  }

  return <HeroCarouselClient apiSlides={apiSlides} />;
}
