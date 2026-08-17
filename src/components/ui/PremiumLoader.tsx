'use client';

import React from 'react';
import Image from 'next/image';

interface PremiumLoaderProps {
  text?: string;
  blurBackdrop?: boolean;
}

/**
 * PremiumLoader — TS Boat Tourism
 * Enhanced, aesthetic, floating dynamic island glassmorphic loader.
 * Features rotating multi-gradient shimmer ring, breathing logo, crisp typography & glowing dots.
 */
export default function PremiumLoader({
  text = 'TS Boat Tourism',
  blurBackdrop = false,
}: PremiumLoaderProps) {
  return (
    <>
      {/* Optional Frosted Glass Backdrop Blur */}
      {blurBackdrop && (
        <div
          className="fixed inset-0 z-[99990] bg-slate-950/20 backdrop-blur-md transition-all duration-300 pointer-events-none animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Floating Dynamic Island Badge */}
      <div
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none flex items-center gap-3 rounded-full border border-white/20 bg-slate-950/90 px-4.5 py-2 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(20,184,166,0.25)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        role="status"
        aria-label={text}
      >
        {/* Spinning Multi-Gradient Ring + Logo */}
        <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal-400 border-r-amber-400 border-b-cyan-300"
            style={{ animationDuration: '0.75s' }}
          />
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-white/10 overflow-hidden ring-1 ring-white/20 shadow-inner">
            <Image
              src="/ts-boat-tourism-logo.png"
              alt="TS Boat Tourism"
              width={26}
              height={26}
              priority
              className="h-6 w-6 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Label + Glowing Animated Wave Dots */}
        <div className="flex items-center gap-2 pr-1.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-100 whitespace-nowrap drop-shadow-xs">
            {text}
          </span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.75s' }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
