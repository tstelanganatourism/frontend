import React from 'react';
import { ShimmerGrid } from '@/components/ui/SkeletonLoader';

export default function PackagesLoading() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <div className="bg-[var(--color-brand-river)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-5">
            <div className="shimmer-surface h-8 w-56 rounded-full bg-white/10" />
            <div className="shimmer-surface h-14 w-full max-w-xl rounded-2xl bg-white/10" />
            <div className="shimmer-surface h-6 w-4/5 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-6">
              <div className="shimmer-surface mb-8 h-7 w-28 rounded bg-slate-100" />
              <div className="space-y-3">
                <div className="shimmer-surface h-11 rounded-lg bg-slate-100" />
                <div className="shimmer-surface h-11 rounded-lg bg-slate-100" />
                <div className="shimmer-surface h-11 rounded-lg bg-slate-100" />
              </div>
            </div>
          </aside>
          <main className="lg:col-span-3">
            <div className="shimmer-surface mb-6 h-5 w-56 rounded-full bg-slate-100" />
            <ShimmerGrid count={6} />
          </main>
        </div>
      </div>
    </div>
  );
}
