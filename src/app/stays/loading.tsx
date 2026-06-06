import React from 'react';
import { ShimmerGrid } from '@/components/ui/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Structural Header Skeleton */}
      <div className="bg-[var(--color-brand-river)] pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="shimmer-surface h-12 w-64 rounded-2xl bg-white/10" />
            <div className="shimmer-surface h-6 w-full max-w-xl rounded-full bg-white/5" />
            <div className="shimmer-surface h-6 w-4/5 rounded-full bg-white/5" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block">
            <div className="rounded-3xl border border-border bg-white p-6 space-y-6">
              <div className="shimmer-surface h-6 w-24 rounded" />
              <div className="shimmer-surface h-12 w-full rounded-xl" />
              <div className="shimmer-surface h-12 w-full rounded-xl" />
              <div className="shimmer-surface h-12 w-full rounded-xl" />
            </div>
          </aside>
          <div className="lg:col-span-3">
            <div className="mb-10 flex items-center justify-between">
              <div className="shimmer-surface h-6 w-48 rounded-full" />
              <div className="shimmer-surface h-10 w-32 rounded-xl" />
            </div>
            <ShimmerGrid count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
