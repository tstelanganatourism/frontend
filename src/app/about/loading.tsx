import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-300">
      {/* Cinematic Hero Skeleton — matches h-[35vh] min-h-[500px] */}
      <div className="relative h-[35vh] min-h-[500px] bg-[#0F3D56] flex items-end pb-10 overflow-hidden">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071b2a] via-[#0d3247] to-[#0F3D56]">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255,255,255,0.06) 50%,
                transparent 100%
              )`,
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 2.2s ease-in-out infinite',
            }}
          />
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes skeleton-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          {/* Badge skeleton */}
          <div className="mx-auto mb-8 h-8 w-28 rounded-full bg-white/10 animate-pulse" />
          {/* Title skeleton */}
          <div className="mx-auto mb-6 h-14 w-[55%] rounded-2xl bg-white/12 animate-pulse" />
          {/* Subtitle skeleton */}
          <div className="mx-auto h-5 w-[40%] rounded-full bg-white/8 animate-pulse" />
        </div>
      </div>

      {/* Our Legacy Section Skeleton */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div className="space-y-5">
              <div className="h-3 w-20 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-10 w-64 rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-1.5 w-20 rounded-full bg-slate-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="flex gap-8 pt-4">
                {[1,2,3].map(i => (
                  <div key={i} className="text-center space-y-1">
                    <div className="h-8 w-16 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-2 w-16 rounded-full bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            {/* Image side */}
            <div className="relative">
              <div className="absolute -inset-4 bg-slate-100 rounded-[3rem] -rotate-3" />
              <div className="relative h-72 w-full rounded-[2.5rem] bg-slate-200 animate-pulse overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section Skeleton */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <div className="mx-auto h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="mx-auto h-10 w-64 rounded-xl bg-slate-200 animate-pulse" />
            <div className="mx-auto h-4 w-80 rounded-full bg-slate-200 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-3 w-28 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-6 w-40 rounded-lg bg-slate-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-4/5 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
