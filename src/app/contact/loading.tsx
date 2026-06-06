import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <div className="bg-[var(--color-brand-river)] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <div className="mx-auto h-6 w-32 rounded-full bg-white/10 animate-pulse" />
          <div className="mx-auto h-12 w-[60%] rounded-2xl bg-white/10 animate-pulse" />
          <div className="mx-auto h-6 w-[45%] rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
