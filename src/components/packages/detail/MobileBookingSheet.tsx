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
    <div className="fixed inset-x-0 bottom-16 z-50 border-t border-[#dfe8e2]/60 bg-white/95 p-3 shadow-[0_-18px_50px_rgba(15,61,86,0.14)] backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left Side: Starter pricing */}
        <div className="min-w-0">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 block">Starting from</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-[#1a6b7a]">
              {hasFare ? `₹${positiveStartingPrice.toLocaleString('en-IN')}` : 'Fare updating'}
            </span>
            {hasFare && <span className="text-[10px] font-bold text-slate-400">/ adult</span>}
          </div>
          {brochurePdfUrl && (
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                // Derive object key from the URL
                const match = brochurePdfUrl.match(/private\/brochures\/[^\s?#]+/);
                const rawKey = match ? match[0] : null;
                // Open in new tab immediately
                window.open(brochurePdfUrl, '_blank');
                // Trigger download via backend 1.5s later
                if (rawKey) {
                  setTimeout(() => {
                    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/download?key=${encodeURIComponent(rawKey)}&filename=${encodeURIComponent(packageSlug + '-brochure.pdf')}`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = `${packageSlug}-brochure.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }, 1500);
                }
              }}
              className="text-[10px] font-black text-[#1a6b7a] hover:underline flex items-center gap-0.5 mt-1 uppercase tracking-wider"
            >
              📥 Brochure PDF
            </button>
          )}
        </div>

        {/* Right Side: Bottom Sheet Launcher */}
        {isPackageInactive ? (
          <button
            disabled
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-slate-400 px-6 text-xs font-black uppercase tracking-[0.14em] text-white cursor-not-allowed shadow-none"
          >
            Closed
          </button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0f3d56] px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[#1a6b7a] active:scale-95"
              >
                Book Now
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto rounded-t-[24px] border-t border-[#dfe8e2]/60 bg-white px-4 pb-6 pt-0 scrollbar-none" showCloseButton>
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
