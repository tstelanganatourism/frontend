'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

type GoogleReview = {
  name: string;
  time: string;
  rating: number;
  text: string;
  reviewUrl?: string;
};

type GoogleReviewsCarouselProps = {
  reviews: GoogleReview[];
  profileUrl: string;
  writeReviewUrl: string;
};

export default function GoogleReviewsCarousel({
  reviews,
  profileUrl,
  writeReviewUrl,
}: GoogleReviewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const cards = [
    ...reviews.map((review) => ({ type: 'review' as const, review })),
    { type: 'cta' as const },
  ];

  // Auto scroll logic (runs every 4.5 seconds unless paused by hover)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = prev + 1 >= cards.length ? 0 : prev + 1;
        const track = trackRef.current;
        if (track) {
          const card = track.children[nextIndex] as HTMLElement | undefined;
          if (card) {
            track.scrollTo({
              left: card.offsetLeft,
              behavior: 'smooth'
            });
          }
        }
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, cards.length]);

  const scrollToCard = (direction: 'previous' | 'next') => {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex =
      direction === 'next'
        ? Math.min(activeIndex + 1, cards.length - 1)
        : Math.max(activeIndex - 1, 0);

    setActiveIndex(nextIndex);
    const card = track.children[nextIndex] as HTMLElement | undefined;
    if (card) {
      track.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    const children = Array.from(track.children) as HTMLElement[];
    const closestIndex = children.reduce((closest, child, index) => {
      const distance = Math.abs(child.offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(children[closest].offsetLeft - track.scrollLeft);
      return distance < closestDistance ? index : closest;
    }, 0);

    setActiveIndex(closestIndex);
  };

  return (
    <section className="bg-[#f6faf8] py-10 md:py-16">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="relative overflow-hidden rounded-md bg-white p-5 shadow-[0_22px_70px_rgba(15,61,86,0.08)] md:p-8">
          <p className="text-center text-sm font-black uppercase tracking-[0.24em] text-[#0f3d56]">
            Bhadrachalam & TS Tourism
          </p>

          <div 
            className="mt-8 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <aside className="text-center lg:text-left">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm lg:mx-0">
                <Image
                  src="/ts-boat-tourism-logo.png"
                  alt="TS Boat Tourism"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-black leading-tight text-[#0f2f3d]">
                TS Boat Tourism
              </h3>
              <p className="mt-1 text-xs font-black uppercase tracking-wider text-[#1598a1]">
                Telangana & Andhra Pradesh Authorized
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 lg:justify-start">
                <span className="text-2xl font-black text-slate-800">4.4</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-5 w-5 fill-[#1598a1] text-[#1598a1]" />
                  <Star className="h-5 w-5 fill-[#1598a1] text-[#1598a1]" />
                  <Star className="h-5 w-5 fill-[#1598a1] text-[#1598a1]" />
                  <Star className="h-5 w-5 fill-[#1598a1] text-[#1598a1]" />
                  <div className="relative h-5 w-5">
                    <Star className="absolute inset-0 h-5 w-5 text-slate-300" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: '40%' }}>
                      <Star className="h-5 w-5 fill-[#1598a1] text-[#1598a1]" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-600">
                Based on 33 Google reviews
              </p>
              <p className="mt-3 text-sm font-bold text-slate-500">
                powered by <span className="text-[#4285f4]">G</span><span className="text-[#db4437]">o</span><span className="text-[#f4b400]">o</span><span className="text-[#4285f4]">g</span><span className="text-[#0f9d58]">l</span><span className="text-[#db4437]">e</span>
              </p>
              <div className="mt-5 grid gap-3">
                <a
                  href={writeReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#4285f4] px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(66,133,244,0.22)]"
                >
                  review us on Google
                </a>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-black text-[#0f3d56]"
                >
                  View Google profile
                </a>
              </div>
            </aside>

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => scrollToCard('previous')}
                disabled={activeIndex === 0}
                className="absolute -left-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition disabled:opacity-40 lg:grid"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollToCard('next')}
                disabled={activeIndex === cards.length - 1}
                className="absolute -right-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition disabled:opacity-40 lg:grid"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div
                ref={trackRef}
                onScroll={handleScroll}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {cards.map((card, index) =>
                  card.type === 'review' ? (
                    <a
                      key={card.review.name}
                      href={card.review.reviewUrl || profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-[18rem] snap-start rounded-md border border-slate-100 bg-white p-5 sm:min-w-[21rem] lg:min-w-[23rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-300 block group/card"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#1598a1]/10 text-lg font-black text-[#1598a1]">
                            {card.review.name.charAt(0)}
                          </span>
                          <span>
                            <span className="block text-sm font-black text-[#0f2f3d]">
                              {card.review.name}
                            </span>
                            <span className="block text-xs font-semibold text-slate-400">
                              {card.review.time}
                            </span>
                          </span>
                        </div>
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-4 w-4 ${starIndex < card.review.rating ? 'fill-[#1598a1] text-[#1598a1]' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <blockquote className="max-h-36 overflow-y-auto pr-2 text-sm font-semibold leading-7 text-[#0f2f3d] transition-colors group-hover/card:text-slate-900">
                        &ldquo;{card.review.text}&rdquo;
                      </blockquote>
                    </a>
                  ) : (
                    <div
                      key={`cta-${index}`}
                      className="flex min-w-[18rem] snap-start flex-col items-center justify-center rounded-md border border-dashed border-[#1598a1]/35 bg-white p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:min-w-[21rem] lg:min-w-[23rem]"
                    >
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e8f7f7] text-[#1598a1]">
                        <Star className="h-5 w-5 fill-[#1598a1]" />
                      </div>
                      <h4 className="mt-4 text-xl font-black text-[#0f2f3d]">
                        Share your journey
                      </h4>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        Travelled with TS Boat Tourism? Add your experience directly on Google.
                      </p>
                      <a
                        href={writeReviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#1598a1] px-5 text-sm font-black text-white hover:bg-[#117f87] transition-colors"
                      >
                        Write a Review
                      </a>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      const card = trackRef.current?.children[index] as HTMLElement | undefined;
                      if (card) {
                        trackRef.current?.scrollTo({
                          left: card.offsetLeft,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-[#1598a1]' : 'w-2 bg-slate-300'}`}
                    aria-label={`Go to review slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
