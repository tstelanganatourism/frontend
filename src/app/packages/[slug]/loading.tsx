import React from 'react';

export default function PackageDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[55vh] min-h-[380px] bg-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-300/80 to-slate-200/50" />
        <div className="absolute bottom-8 left-0 right-0 px-4 sm:px-8 max-w-5xl mx-auto space-y-3">
          <div className="h-4 w-24 rounded-full bg-white/30" />
          <div className="h-10 w-3/4 rounded-xl bg-white/30" />
          <div className="h-6 w-1/2 rounded-full bg-white/20" />
          <div className="flex gap-3 mt-4">
            <div className="h-10 w-32 rounded-xl bg-white/20" />
            <div className="h-10 w-28 rounded-xl bg-white/15" />
          </div>
        </div>
      </div>

      {/* Section nav skeleton */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex gap-6 py-3 overflow-x-auto">
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div key={i} className={`h-5 w-${w === 100 ? '24' : w === 80 ? '20' : w === 90 ? '22' : w === 70 ? '18' : '20'} rounded-full bg-slate-200 shrink-0`} />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-40 rounded-lg bg-slate-200" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-xl bg-slate-100 p-4 space-y-2">
                  <div className="h-4 w-16 rounded bg-slate-200" />
                  <div className="h-5 w-24 rounded bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
              <div className="h-4 w-4/6 rounded bg-slate-100" />
            </div>
          </div>

          {/* Gallery skeleton */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-32 rounded-lg bg-slate-200" />
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-video rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>

          {/* Itinerary skeleton */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-36 rounded-lg bg-slate-200" />
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar skeleton */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 sticky top-[130px]">
            <div className="h-6 w-28 rounded-lg bg-slate-200" />
            <div className="h-14 w-full rounded-xl bg-slate-100" />
            <div className="h-14 w-full rounded-xl bg-slate-100" />
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-16 rounded bg-slate-200" />
                </div>
              ))}
            </div>
            <div className="h-12 w-full rounded-xl bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
