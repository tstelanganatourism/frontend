'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function RoomListPagination({ total, size }: { total: number; size: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  if (total <= size) return null;

  const pageCount = Math.ceil(total / size);
  const currentPage = Math.min(Math.max(Number(searchParams.get('page')) || 1, 1), pageCount);

  const setRoomsPage = (pageNum: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('page', String(pageNum));
    return `${pathname}?${nextParams.toString()}`;
  };

  const goToPage = (pageNum: number) => {
    if (isPending || pageNum === currentPage || pageNum < 1 || pageNum > pageCount) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startTransition(() => {
      router.replace(setRoomsPage(pageNum), { scroll: true });
    });
  };

  return (
    <nav className="mt-12 flex justify-center" aria-label="Stays pagination">
      <div className="inline-flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-white/80 bg-white/80 p-2 shadow-[0_18px_45px_rgba(44,94,67,0.12)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={isPending || currentPage === 1}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[var(--color-brand-river)] shadow-sm transition-all hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      {Array.from({ length: pageCount }).map((_, i) => {
        const pageNum = i + 1;
        const isActive = currentPage === pageNum;

        return (
          <button
            type="button"
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            disabled={isPending || isActive}
            aria-current={isActive ? 'page' : undefined}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all ${
              isActive
                ? 'bg-[var(--color-brand-teal)] text-white shadow-[0_10px_22px_rgba(19,116,130,0.26)]'
                : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]'
            }`}
          >
            {isPending && isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : pageNum}
          </button>
        );
      })}
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={isPending || currentPage === pageCount}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[var(--color-brand-river)] shadow-sm transition-all hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
