import React from 'react';
import Image from 'next/image';

/**
 * PremiumLoader — TS Boat Tourism
 * Compact, aesthetic, floating logo loading badge.
 * Non-blocking, glassmorphic pill loader.
 */
export default function PremiumLoader() {
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none flex items-center gap-3 rounded-full border border-white/20 bg-slate-950/85 px-4 py-2 text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300"
      role="status"
      aria-label="Loading TS Boat Tourism"
    >
      {/* Spinning Ring + Logo */}
      <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal-400 border-r-amber-400"
          style={{ animationDuration: '0.8s' }}
        />
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-white/10 overflow-hidden">
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

      {/* Label + Dots */}
      <div className="flex items-center gap-2 pr-1">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-100 whitespace-nowrap">
          TS Boat Tourism
        </span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
