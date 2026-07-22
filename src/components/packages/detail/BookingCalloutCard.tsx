'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Compass, Info, Check, Plus, Utensils, Home, Car, Calendar, Sparkles, Ticket, ArrowRight } from 'lucide-react';

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

interface PackageTransportOption {
  id: number;
  type: 'SHARED' | 'SEPARATE_VEHICLE';
  title: string;
  capacity?: number;
  adult_price?: number | string | null;
  child_price?: number | string | null;
  weekend_adult_price?: number | string | null;
  weekend_child_price?: number | string | null;
  student_price?: number | string | null;
  weekend_student_price?: number | string | null;
  fixed_price?: number | string | null;
  weekend_fixed_price?: number | string | null;
}

interface BookingCalloutCardProps {
  startingPrice?: number | string | null;
  isStudentPackage?: boolean;
  brochurePdfUrl?: string | null;
  variants: PackageVariant[];
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
  extras?: any[];
}

export const BookingCalloutCard = ({
  startingPrice,
  isStudentPackage = false,
  brochurePdfUrl,
  variants = [],
  hasTransport = false,
  transportOptions = [],
  hasRefreshments = false,
  refreshmentAdultPrice,
  refreshmentChildPrice,
  refreshmentStudentPrice,
  hasFoodOption = false,
  foodAdultPrice,
  foodChildPrice,
  foodStudentPrice,
  extras = [],
}: BookingCalloutCardProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(variants[0]?.id ?? null);

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

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const activePrice = activeVariant
    ? (isStudentPackage ? activeVariant.student_price : activeVariant.adult_price)
    : startingPrice;

  const formattedStartingPrice = activePrice
    ? Number(activePrice).toLocaleString('en-IN')
    : 'Check Fare';

  const handleBookNowClick = () => {
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { variantId: activeVariant?.id } }));
  };

  const handleSelectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
    window.dispatchEvent(new CustomEvent('select-variant', { detail: { variantId } }));
  };

  const formatINR = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    return '₹' + num.toLocaleString('en-IN');
  };

  // Determine which tabs are relevant to display
  const showAddonsTab = hasRefreshments || hasFoodOption || (extras && extras.length > 0);
  const showTransportTab = hasTransport && transportOptions && transportOptions.length > 0;
  const hasTabs = showAddonsTab || showTransportTab;

  return (
    <div className="sticky top-[140px] max-h-[calc(100vh-155px)] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100/50 flex flex-col overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-[#0d6e75] px-5 py-3 text-white flex items-center justify-between shrink-0">
        <span className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
          Fast Online Booking
        </span>
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a8e6ea] bg-[#0b5c62] px-2 py-0.5 rounded-full">
          Live Fare
        </span>
      </div>

      {/* Starting Price & Book Button */}
      <div className="p-5 pb-4 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100 space-y-3 shrink-0">
        
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Starting Price</h3>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#0d6e75] tracking-tight">
                ₹{formattedStartingPrice}
              </span>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                {isStudentPackage ? '/ student' : '/ adult'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleBookNowClick}
            type="button"
            className="group relative isolate inline-flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0d6e75] hover:bg-[#0b5c62] px-4 text-[11px] font-black uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none active:translate-y-0 active:scale-[0.98]"
          >
            <span className="absolute inset-y-0 -left-10 w-8 rotate-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-36" />
            <Ticket className="h-4 w-4 shrink-0 stroke-[2.6]" />
            Book Now
            <ArrowRight className="h-3.5 w-3.5 shrink-0 stroke-[3] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Content Area - Scrollable Stream */}
      <div className="p-5 flex-1 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 min-h-0">
        
        {/* Ticket Variants & Fares */}
        <div className="space-y-4">
          {variants && variants.length > 0 ? (
            variants.map((v, i) => {
              const isSelected = v.id === activeVariant?.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  className={`space-y-2 rounded-xl p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0d6e75]/5 border-2 border-[#0d6e75] shadow-xs'
                      : 'bg-white border border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-[#0d6e75]" />
                      {v.title}
                    </h4>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75] px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                
                {/* Pricing matrix grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {/* Weekday Pricing */}
                  <div className="space-y-1 border-r border-slate-200 pr-2">
                    <span className="block text-[8px] font-black text-slate-450 uppercase tracking-widest">Weekday Fares</span>
                    {isStudentPackage ? (
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Student:</span>
                        <span className="font-black text-[#0d6e75]">{formatINR(v.student_price)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Adult:</span>
                          <span className="font-black text-[#0d6e75]">{formatINR(v.adult_price)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-500">
                          <span>Child:</span>
                          <span>{formatINR(v.child_price)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Weekend Pricing */}
                  <div className="space-y-1 pl-2">
                    <span className="block text-[8px] font-black text-amber-600 uppercase tracking-widest">Weekend / Peak</span>
                    {isStudentPackage ? (
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Student:</span>
                        <span className="font-black text-amber-700">{formatINR(v.weekend_student_price || v.student_price)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Adult:</span>
                          <span className="font-black text-amber-700">{formatINR(v.weekend_adult_price || v.adult_price)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-500">
                          <span>Child:</span>
                          <span>{formatINR(v.weekend_child_price || v.child_price)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {v.transport_info && (
                  <p className="text-[9px] font-semibold text-slate-450 italic mt-1 leading-relaxed">
                    ℹ️ {v.transport_info}
                  </p>
                )}
              </div>
            );
          })
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
              <Info className="h-5 w-5 text-slate-400 mb-1.5" />
              <span className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">Fare Structure</span>
              <span className="block text-[10px] text-slate-500 font-semibold mt-1">
                Starting from <strong className="text-[#0d6e75]">₹{formattedStartingPrice}</strong> per ticket.
              </span>
            </div>
          )}
        </div>

        {/* Add-ons, Fresh-Up, Meals & Transport Section (Positioned Directly Below Tickets) */}
        {(showAddonsTab || showTransportTab) && (
          <div className="border-t border-slate-200 pt-3.5 space-y-2.5">
            <span className="block text-[9px] font-black uppercase tracking-wider text-[#0d6e75]">
              Optional Add-ons & Services
            </span>

            {/* Fresh Up Accommodation Option */}
            {hasRefreshments && (
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <Home className="h-4 w-4 text-[#0d6e75] shrink-0 mt-0.5" />
                <div className="text-[10px]">
                  <span className="block font-black text-slate-800">Fresh-Up Room Stay</span>
                  <span className="block text-slate-500 font-semibold mt-0.5">
                    Adult: <strong className="text-[#0d6e75]">{formatINR(refreshmentAdultPrice)}</strong> · Child: {formatINR(refreshmentChildPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Food Meals Option */}
            {hasFoodOption && (
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <Utensils className="h-4 w-4 text-[#0d6e75] shrink-0 mt-0.5" />
                <div className="text-[10px]">
                  <span className="block font-black text-slate-800">Catering & Meals package</span>
                  <span className="block text-slate-500 font-semibold mt-0.5">
                    Adult: <strong className="text-[#0d6e75]">{formatINR(foodAdultPrice)}</strong> · Child: {formatINR(foodChildPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Transport Options */}
            {showTransportTab && transportOptions.map((opt) => (
              <div key={opt.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                <Car className="h-4 w-4 text-[#0d6e75] shrink-0 mt-0.5" />
                <div className="text-[10px] flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-800">{opt.title}</span>
                    <span className="text-[8px] font-bold bg-slate-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider text-slate-600">
                      {opt.type === 'SHARED' ? 'Shared' : 'Private'}
                    </span>
                  </div>
                  
                  {opt.type === 'SHARED' ? (
                    <span className="block text-slate-500 font-semibold mt-1">
                      Adult: <strong className="text-[#0d6e75]">{formatINR(opt.adult_price)}</strong> · Child: {formatINR(opt.child_price)}
                    </span>
                  ) : (
                    <span className="block text-slate-500 font-semibold mt-1">
                      Fixed Price: <strong className="text-[#0d6e75]">{formatINR(opt.fixed_price)}</strong> 
                      {opt.capacity && ` (Max: ${opt.capacity} pax)`}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Extras list */}
            {extras && extras.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="block text-[8px] font-black uppercase tracking-wider text-slate-450">Additional Extras</span>
                {extras.map((ex) => (
                  <div key={ex.id} className="flex justify-between items-center text-[10px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="block font-bold text-slate-700">{ex.title}</span>
                      {ex.description && <span className="block text-[8px] text-slate-400 font-semibold">{ex.description}</span>}
                    </div>
                    <span className="font-black text-[#0d6e75] shrink-0">
                      {isStudentPackage ? formatINR(ex.student_price) : formatINR(ex.adult_price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Brochure CTA Section */}
      {brochurePdfUrl && (
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <a
            href={brochurePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-9 border border-slate-200 hover:border-[#0d6e75] bg-white rounded-lg text-[10px] font-black uppercase tracking-wider text-[#0d6e75] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-3xs"
          >
            📥 Download Brochure PDF
          </a>
        </div>
      )}
    </div>
  );
};
