'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import PackageFilters from '@/components/packages/PackageFilters';

export default function MobileFilterSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-bold text-[var(--color-brand-river)] shadow-[0_10px_28px_rgba(15,61,86,0.1)] backdrop-blur-md lg:hidden cursor-pointer">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[86svh] overflow-y-auto rounded-t-[1.75rem] border-white/50 bg-[#f7f4ed] p-0 pb-safe shadow-[0_-24px_70px_rgba(15,61,86,0.24)]">
        <SheetHeader className="border-b border-white/70 px-5 py-4 text-left">
          <SheetTitle className="text-lg font-black text-[var(--color-brand-river)]">Refine experiences</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <PackageFilters sticky={false} className="border-white/80 shadow-none" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
