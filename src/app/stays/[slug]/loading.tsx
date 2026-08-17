import React from 'react';

export default function StayDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[50vh] min-h-[350px] bg-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-300/80 to-slate-200/50" />
        <div className="absolute bottom-8 left-0 right-0 px-4 sm:px-8 max-w-5xl mx-auto space-y-3">
          <div className="h-4 w-28 rounded-full bg-white/30" />
          <div className="h-10 w-2/3 rounded-xl bg-white/30" />
          <div className="h-6 w-1/3 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-40 rounded-lg bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-32 rounded-lg bg-slate-200" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-28 rounded-lg bg-slate-200" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
