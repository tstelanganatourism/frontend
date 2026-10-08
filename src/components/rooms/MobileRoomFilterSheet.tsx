'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Check, X } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger 
} from '@/components/ui/sheet';
import RoomFilters from '@/components/rooms/RoomFilters';

export default function MobileRoomFilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          type="button"
          className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-[#0d6e75] shadow-sm hover:bg-slate-50 lg:hidden cursor-pointer active:scale-95 transition-all"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </SheetTrigger>

      <SheetContent 
        side="bottom" 
        className="max-h-[90svh] h-[86svh] flex flex-col rounded-t-[2rem] border-slate-200 bg-[#f4f7f6] p-0 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="border-b border-slate-200 bg-white px-5 py-4 text-left shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#0d6e75]" />
                Filter Accommodations
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 font-semibold mt-0.5">
                Refine by category, facilities, and pricing
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          <RoomFilters 
            sticky={false} 
            isMobile={true}
            className="border-slate-200 bg-white shadow-sm"
            onApply={() => setOpen(false)}
          />
        </div>

        {/* Sticky Floating Bottom Action Bar */}
        <div className="absolute bottom-0 inset-x-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full py-3.5 px-5 rounded-xl bg-[#0d6e75] hover:bg-[#0b5c62] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            Apply Filters & Show Stays
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
