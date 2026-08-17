'use client';

import React, { useState, useEffect } from 'react';
import { BookingSidebarV3, PackageTransportOption } from './BookingSidebarV3';
import { ArrowRight, Sparkles, ShieldCheck, Ticket, X, Phone, MessageCircle } from 'lucide-react';

interface PackageVariant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  weekend_adult_price?: number | string | null;
  weekend_child_price?: number | string | null;
  student_price?: number | string | null;
  weekend_student_price?: number | string | null;
  transport_info?: string | null;
}

interface BookingDialogV3Props {
  startingPrice?: number | string | null;
  variants: PackageVariant[];
  packageId: number;
  packageSlug: string;
  brochurePdfUrl?: string | null;
  hasTransport?: boolean;
  transportOptions?: PackageTransportOption[];
  hasRefreshments?: boolean;
  refreshmentAdultPrice?: number | string | null;
  refreshmentChildPrice?: number | string | null;
  refreshmentStudentPrice?: number | string | null;
  hasFoodOption?: boolean;
  foodAdultPrice?: number | string | null;
  foodChildPrice?: number | string | null;
  foodStudentPrice?: number | string | null;
  minPassengers?: number;
  isStudentPackage?: boolean;
  refreshmentsMinPassengers?: number;
  isActive?: boolean;
  advancePaymentType?: string | null;
  advancePaymentValue?: number | null;
  extras?: any[];
  agentCommissionType?: string | null;
  agentCommissionPercentage?: number | string | null;
  agentCommissionFixedAmount?: number | string | null;
  agentDailyQuota?: number | null;
  agentIsAllowed?: boolean | null;
}

export const BookingDialogV3 = (props: BookingDialogV3Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(props.variants[0]?.id ?? null);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEv = e as CustomEvent<{ variantId?: number }>;
      if (customEv.detail?.variantId) {
        setSelectedVariantId(customEv.detail.variantId);
      }
      setIsOpen(true);
    };
    window.addEventListener('open-booking-modal', handleOpen);
    return () => window.removeEventListener('open-booking-modal', handleOpen);
  }, []);

  useEffect(() => {
    const handleVariantSelect = (e: Event) => {
      const customEv = e as CustomEvent<{ variantId: number }>;
      if (customEv.detail?.variantId) {
        setSelectedVariantId(customEv.detail.variantId);
      }
    };
    window.addEventListener('select-variant', handleVariantSelect);
    return () => window.removeEventListener('select-variant', handleVariantSelect);
  }, []);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const activeVariant = props.variants.find((v) => v.id === selectedVariantId) || props.variants[0];
  const activePrice = activeVariant
    ? (props.isStudentPackage ? activeVariant.student_price : activeVariant.adult_price)
    : props.startingPrice;

  const formattedPrice = activePrice
    ? Number(activePrice).toLocaleString('en-IN')
    : null;

  return (
    <>
      {/* ── Desktop Floating Action Widget (Stacked above WhatsApp) ── */}
      <div
        className={`hidden lg:flex fixed right-8 bottom-28 z-40 flex-col items-end transition-all duration-500 ${
          showStickyBar && !isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="group flex items-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#0d6e75] via-[#0a585e] to-[#07464b] p-3 pr-6 text-white shadow-[0_16px_40px_rgba(13,110,117,0.38)] ring-4 ring-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(13,110,117,0.48)] active:scale-[0.98]"
        >
          {/* Ticket Icon Box */}
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-md">
            <Ticket className="h-5 w-5 stroke-[2.5]" />
          </div>

          {/* Fare & Call-to-Action Text */}
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#a8e8eb]">
                {formattedPrice ? `From ₹${formattedPrice}` : 'Instant Seat'}
              </span>
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300">
                Live Fare
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 mt-0.5">
              BOOK NOW
              <ArrowRight className="h-3.5 w-3.5 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </button>
      </div>

      {/* ── Mobile Sticky Bottom Bar (Single Unified Bar at bottom-0) ── */}
      <div
        className={`fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 flex items-center justify-between gap-3 z-50 lg:hidden shadow-[0_-10px_28px_rgba(15,61,86,0.14)] transition-all duration-300 ${
          showStickyBar && !isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col min-w-0 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#0d6e75] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
            Fast Booking
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-[#0d6e75] tracking-tight">
              {formattedPrice ? `₹${formattedPrice}` : 'Check Fare'}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {props.isStudentPackage ? '/ stud' : '/ adult'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="group h-11 flex-1 rounded-xl bg-[#0d6e75] hover:bg-[#0b5c62] px-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ml-2"
        >
          Book Now
          <ArrowRight className="h-4 w-4 stroke-[3] transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* ── Modal Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setIsOpen(false)} />

          {/* Dialog Panel — slides up on mobile, centers on desktop */}
          <div className="relative z-10 w-full max-w-full sm:max-w-[1040px] sm:mx-auto flex flex-col
            h-[90dvh] sm:h-[82vh] sm:max-h-[750px]
            bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl
            animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250">

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-[#0d6e75] to-[#0b5c62] px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#c8e6e8] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Official Booking Portal
                </span>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  Select Package & Book Tickets
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-4 shrink-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-hidden">
              <BookingSidebarV3 {...props} initialVariantId={selectedVariantId || undefined} layoutMode="dialog" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
