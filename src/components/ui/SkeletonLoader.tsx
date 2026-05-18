import React from 'react';

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe8e2] bg-white shadow-sm">
      <div className="shimmer-surface h-56 w-full bg-slate-100" />
      <div className="p-5">
        <div className="shimmer-surface mb-3 h-3 w-1/4 rounded bg-slate-100" />
        <div className="shimmer-surface mb-2 h-5 w-4/5 rounded bg-slate-100" />
        <div className="shimmer-surface mb-4 h-5 w-2/3 rounded bg-slate-100" />
        <div className="flex gap-2 mb-6">
          <div className="shimmer-surface h-6 w-16 rounded-full bg-slate-100" />
          <div className="shimmer-surface h-6 w-16 rounded-full bg-slate-100" />
          <div className="shimmer-surface h-6 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
          <div>
            <div className="shimmer-surface mb-1 h-3 w-16 rounded bg-slate-100" />
            <div className="shimmer-surface h-6 w-24 rounded bg-slate-100" />
          </div>
          <div className="shimmer-surface h-10 w-10 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
