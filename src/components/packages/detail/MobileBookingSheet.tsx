'use client';

import React from 'react';
import { 
  Sheet, SheetContent, SheetDescription, 
  SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet';
import { BookingSidebarV2 } from './BookingSidebarV2';
import { Sparkles } from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';

interface PackageVariant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  transport_info?: string | null;
}

interface MobileBookingSheetProps {
  startingPrice?: number | string | null;
  variants: PackageVariant[];
  packageId: number;
  packageSlug: string;
  brochurePdfUrl?: string | null;
}

export const MobileBookingSheet = ({ startingPrice, variants, packageId, packageSlug, brochurePdfUrl }: MobileBookingSheetProps) => {
  const { publicAvailability, publicLoading } = useInventoryStore();
  const isPackageInactive = !publicLoading && !publicAvailability;

  const positiveStartingPrice = Number(startingPrice || 0) > 0
    ? Number(startingPrice)
    : Math.min(
        ...(variants || [])
          .map((variant) => Number(variant.adult_price || 0))
          .filter((price) => price > 0)
      );
  const hasFare = Number.isFinite(positiveStartingPrice) && positiveStartingPrice > 0;

  return (
    <div className="fixed inset-x-0 bottom-16 sm:bottom-0 z-40 border-t border-[#dfe8e2]/60 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(15,61,86,0.08)] backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Starter pricing */}
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 block">Starting from</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-[#1a6b7a]">
              {hasFare ? `₹${positiveStartingPrice.toLocaleString('en-IN')}` : 'Fare updating'}
            </span>
            {hasFare && <span className="text-[10px] font-bold text-slate-400">/ adult</span>}
          </div>
          {brochurePdfUrl && (
            <a
              href={brochurePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black text-[#1a6b7a] hover:underline flex items-center gap-0.5 mt-1 uppercase tracking-wider"
            >
              📥 Brochure PDF
            </a>
          )}
        </div>

        {/* Right Side: Bottom Sheet Launcher */}
        {isPackageInactive ? (
          <button
            disabled
            className="flex-1 max-w-[200px] inline-flex h-12.5 items-center justify-center rounded-full bg-slate-400 px-6 text-xs font-black uppercase tracking-[0.16em] text-white cursor-not-allowed shadow-none"
          >
            Closed
          </button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex-1 max-w-[200px] cursor-pointer inline-flex h-12.5 items-center justify-center rounded-full bg-[#0f3d56] hover:bg-[#1a6b7a] px-6 text-xs font-black uppercase tracking-[0.16em] text-white shadow-md transition-all active:scale-95"
              >
                Book ticket
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[82vh] overflow-y-auto rounded-t-[30px] border-t border-[#dfe8e2]/60 bg-white p-6 scrollbar-none" showCloseButton>
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-xl font-black text-[#0f3d56] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#1a6b7a]" />
                  Configure your ticket
                </SheetTitle>
                <SheetDescription className="text-xs font-bold text-slate-400">
                  Official Telangana & Andhra Boat Tourism cruise bookings.
                </SheetDescription>
              </SheetHeader>
              <div className="pb-4">
                <BookingSidebarV2 
                  startingPrice={startingPrice}
                  variants={variants}
                  packageId={packageId}
                  packageSlug={packageSlug}
                  brochurePdfUrl={brochurePdfUrl}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}

      </div>
    </div>
  );
};
