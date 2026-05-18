'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function RoomListPagination({ total, size }: { total: number; size: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total <= size) return null;

  const setRoomsPage = (pageNum: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('page', String(pageNum));
    return `${pathname}?${nextParams.toString()}`;
  };

  return (
    <div className="mt-12 flex justify-center gap-2">
      {Array.from({ length: Math.ceil(total / size) }).map((_, i) => {
        const pageNum = i + 1;
        const isActive = (Number(searchParams.get('page')) || 1) === pageNum;

        return (
          <button
            type="button"
            key={pageNum}
            onClick={() => router.replace(setRoomsPage(pageNum), { scroll: false })}
            className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--color-brand-teal)] text-white shadow-md'
                : 'border border-border bg-white text-slate-600 hover:border-[var(--color-brand-teal)]'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
    </div>
  );
}
