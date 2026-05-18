'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CalendarDays, AlertTriangle, XCircle, CheckCircle2, Loader2, Info, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, PublicDateAvailability } from '@/stores/inventoryStore';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { apiClient } from '@/lib/api';

interface PackageVariant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  transport_info?: string | null;
}

interface BookingSidebarV2Props {
  startingPrice?: number | string | null;
  variants: PackageVariant[];
  packageSlug: string;
  brochurePdfUrl?: string | null;
}

function todayIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function toYYYYMM(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatINR(value: number | string) {
  return Number(value || 0).toLocaleString('en-IN');
}

function positiveNumber(value: number | string | null | undefined) {
  const numeric = Number(value || 0);
  return numeric > 0 ? numeric : 0;
}

export const BookingSidebarV2 = ({ startingPrice, variants, packageSlug, brochurePdfUrl }: BookingSidebarV2Props) => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { publicAvailability, publicLoading, fetchPublicAvailability } = useInventoryStore();

  const extractObjectKey = (url: string): string | null => {
    if (!url) return null;
    if (url.startsWith('private/')) return url;
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
      if (path.startsWith('private/')) {
        return decodeURIComponent(path);
      }
    } catch (e) {
      if (url.startsWith('private/')) return url;
    }
    return null;
  };

  const handleDownloadBrochure = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!brochurePdfUrl) return;

    const rawKey = extractObjectKey(brochurePdfUrl);
    if (!rawKey) {
      window.open(brochurePdfUrl, '_blank');
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/documents/signed-url', {
        object_key: rawKey
      });
      window.open(response.data.url, '_blank');
    } catch (err) {
      console.error('Failed to get fresh signed URL for brochure:', err);
      window.open(brochurePdfUrl, '_blank');
    }
  };

  const tomorrow = new Date(todayIST());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = toYYYYMMDD(tomorrow);

  const validVariants = useMemo(() => {
    return variants.filter(
      (v) => v.title && v.title.trim() !== '' && Number(v.adult_price) > 0
    );
  }, [variants]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [currentMonthStr, setCurrentMonthStr] = useState(toYYYYMM(tomorrow));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  
  const [variantMenuOpen, setVariantMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  
  // Calendar state
  const [calYear, setCalYear] = useState(tomorrow.getFullYear());
  const [calMonth, setCalMonth] = useState(tomorrow.getMonth()); // 0-11
  const dateMenuRef = useRef<HTMLDivElement>(null);

  // Auto-select first valid variant when loaded
  useEffect(() => {
    if (validVariants.length > 0) {
      if (selectedVariantId === null || !validVariants.some(v => v.id === selectedVariantId)) {
        setSelectedVariantId(validVariants[0].id);
      }
    }
  }, [validVariants, selectedVariantId]);

  useEffect(() => {
    if (packageSlug && currentMonthStr) {
      fetchPublicAvailability(packageSlug, currentMonthStr);

      // Poll package active availability status in background every 3 seconds
      const interval = setInterval(() => {
        fetchPublicAvailability(packageSlug, currentMonthStr, true);
      }, 3000);

      return () => clearInterval(interval);
    }
    // fetchPublicAvailability is a Zustand store action — omitting it is intentional
    // to avoid the unstable reference causing re-fetches on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageSlug, currentMonthStr]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setDateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDaySelect = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const dateStr = toYYYYMMDD(d);
    if (dateStr >= minDateStr) {
      setSelectedDate(dateStr);
      setDateMenuOpen(false);
      const newMonth = dateStr.slice(0, 7);
      if (newMonth !== currentMonthStr) setCurrentMonthStr(newMonth);
    }
  };

  const nextMonth = () => {
    let m = calMonth + 1;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
    setCurrentMonthStr(`${y}-${String(m + 1).padStart(2, '0')}`);
  };

  const prevMonth = () => {
    let m = calMonth - 1;
    let y = calYear;
    if (m < 0) { m = 11; y--; }
    
    // Don't go before current month
    const today = todayIST();
    if (y < today.getFullYear() || (y === today.getFullYear() && m < today.getMonth())) {
      return;
    }
    
    setCalMonth(m);
    setCalYear(y);
    setCurrentMonthStr(`${y}-${String(m + 1).padStart(2, '0')}`);
  };

  const selectedSlot = useMemo<PublicDateAvailability | null>(() => {
    if (!selectedDate || !publicAvailability || selectedVariantId === null) return null;
    return publicAvailability.dates.find(
      (d) => d.date === selectedDate && d.variant_id === selectedVariantId
    ) ?? null;
  }, [selectedDate, selectedVariantId, publicAvailability]);

  const selectedVariant = useMemo(() => {
    if (selectedVariantId === null) return validVariants[0];
    return validVariants.find((v) => v.id === selectedVariantId) ?? validVariants[0];
  }, [validVariants, selectedVariantId]);

  const isPackageInactive = !publicLoading && !publicAvailability;

  const availabilityState = useMemo(() => {
    if (publicLoading) return { kind: 'loading' as const, message: 'Checking seats...' };
    if (isPackageInactive) return { kind: 'closed' as const, message: 'Bookings are closed / inactive' };
    if (!selectedDate) return { kind: 'idle' as const, message: 'Select date to check availability' };
    if (!selectedSlot) return { kind: 'unpublished' as const, message: 'Schedule not opened yet. Call to confirm.' };
    if (selectedSlot.status === 'CLOSED') return { kind: 'closed' as const, message: 'Date closed for booking' };
    if (selectedSlot.status === 'SOLD_OUT') return { kind: 'sold_out' as const, message: 'Sold out' };
    if (selectedSlot.status === 'NO_INVENTORY') return { kind: 'unpublished' as const, message: 'Schedule not opened yet. Call to confirm.' };
    if (Number(selectedSlot.available_seats || 0) <= 0) {
      return { kind: 'unpublished' as const, message: 'Seats not published yet. Call to confirm.' };
    }
    return { kind: 'open' as const, message: `${selectedSlot.available_seats} seats available` };
  }, [publicLoading, isPackageInactive, selectedDate, selectedSlot]);


  const prices = useMemo(() => {
    const baseAdult = positiveNumber(selectedSlot?.effective_adult_price) ||
      positiveNumber(selectedVariant?.adult_price) ||
      positiveNumber(startingPrice);

    const baseChild = positiveNumber(selectedSlot?.child_price) ||
      positiveNumber(selectedVariant?.child_price);

    const subtotal = (adults * baseAdult) + (children * baseChild);
    const gst = Math.round(subtotal * 0.05);
    const gatewayFee = Math.round((subtotal + gst) * 0.01);
    const grandTotal = subtotal + gst + gatewayFee;

    return { baseAdult, baseChild, subtotal, gst, gatewayFee, grandTotal };
  }, [selectedSlot, selectedVariant, startingPrice, adults, children]);

  const isBookingDisabled =
    !isAuthenticated ||
    isPackageInactive ||
    validVariants.length === 0 ||
    !selectedDate ||
    availabilityState.kind === 'closed' ||
    availabilityState.kind === 'sold_out';

  const handleBookingClick = (e: React.MouseEvent) => {
    if (isPackageInactive) return;
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  // Render calendar days
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Empty cells before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(calYear, calMonth, i);
      const dateStr = toYYYYMMDD(d);
      const isPast = dateStr < minDateStr;
      const isSelected = dateStr === selectedDate;
      
      // Check availability if we have it for this month
      let dayStatus = 'none'; // none, available, soldout
      let isDisabled = isPast;

      if (publicAvailability) {
        const slot = publicAvailability.dates.find(d => d.date === dateStr && d.variant_id === selectedVariantId);
        if (slot) {
          if (slot.status === 'CLOSED' || slot.status === 'SOLD_OUT' || slot.status === 'NO_INVENTORY' || slot.available_seats <= 0) {
            dayStatus = 'soldout';
            isDisabled = true;
          } else {
            dayStatus = 'available';
          }
        } else {
          // If a date has no slot record generated/published, it cannot be booked
          dayStatus = 'soldout';
          isDisabled = true;
        }
      } else {
        // If availability is still loading or could not be loaded (e.g. package is inactive), disable all dates
        isDisabled = true;
      }
      
      days.push(
        <button
          key={i}
          disabled={isDisabled}
          onClick={() => handleDaySelect(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
            ${isDisabled ? 'text-slate-300 cursor-not-allowed line-through bg-slate-50/50' : 'hover:bg-blue-50 text-slate-700 cursor-pointer'}
            ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 font-bold' : ''}
            ${!isSelected && dayStatus === 'available' ? 'font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100/70' : ''}
          `}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="p-3 w-full max-w-[280px]">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft className="h-5 w-5" /></button>
          <div className="font-bold text-slate-800">{monthNames[calMonth]} {calYear}</div>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-xs font-semibold text-slate-400 w-8">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div id="booking" className="sticky top-28 w-full space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/8">
        
        {/* Simple Header */}
        <div className="bg-[#0f3d56] p-6 text-white">
          <h2 className="text-lg font-black">Book this package</h2>
          <p className="mt-1 text-xs font-semibold text-white/65">Select date, variant and passengers</p>
          <div className="mt-4 text-3xl font-black">
            {prices.baseAdult > 0 ? `₹${formatINR(prices.baseAdult)}` : 'Fare updating'} <span className="text-sm font-semibold text-white/65">{prices.baseAdult > 0 ? 'per adult' : ''}</span>
          </div>
        </div>

        <div className="relative space-y-4 p-6">
          
          {/* Active Booking Inactive Warning Banner */}
          {isPackageInactive && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs text-rose-600 font-bold flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-black">Online Bookings Suspended</p>
                <p className="text-slate-500 font-bold text-[11px] mt-0.5 leading-relaxed">
                  This tour experience is currently closed or inactive. You cannot configure tickets or submit new online bookings.
                </p>
              </div>
            </div>
          )}
          
          {/* Variant Select */}
          <div className="relative">
            <label className="mb-1.5 block text-sm font-black text-slate-800">Package variant</label>
            <button
              type="button"
              disabled={isPackageInactive || validVariants.length === 0}
              onClick={() => { setVariantMenuOpen(!variantMenuOpen); setDateMenuOpen(false); }}
              className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-slate-300 px-4 py-3 text-left text-sm font-bold shadow-sm transition ${
                isPackageInactive || validVariants.length === 0 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white text-slate-900 hover:border-[#1a6b7a] focus:border-[#1a6b7a] focus:outline-none'
              }`}
            >
              <span className="min-w-0 truncate">{selectedVariant?.title || 'Select package variant'}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${variantMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {variantMenuOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
                  {validVariants.length ? validVariants.map((variant) => {
                    const selected = variant.id === selectedVariantId;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setVariantMenuOpen(false);
                        }}
                        className={`flex w-full items-start justify-between gap-3 rounded-md px-3 py-3 text-left transition ${
                          selected ? 'bg-[#eef8f6] text-[#0f3d56]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-bold">{variant.title}</span>
                          <span className="mt-1 block text-xs font-semibold text-[#1a6b7a]">
                            Adult ₹{Number(variant.adult_price).toLocaleString('en-IN')} / Child ₹{Number(variant.child_price).toLocaleString('en-IN')}
                          </span>
                        </span>
                        {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1a6b7a]" /> : null}
                      </button>
                    );
                  }) : (
                    <div className="px-3 py-4 text-sm font-semibold text-amber-700">
                      Fare variants are being updated. Please call to confirm.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
 
          {/* Custom Date Picker */}
          <div className="relative" ref={dateMenuRef}>
            <label className="mb-1.5 block text-sm font-black text-slate-800">Travel date</label>
            <button
              type="button"
              disabled={isPackageInactive || validVariants.length === 0}
              onClick={() => { setDateMenuOpen(!dateMenuOpen); setVariantMenuOpen(false); }}
              className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-slate-300 px-4 py-3 text-left text-sm font-bold shadow-sm transition ${
                isPackageInactive || validVariants.length === 0 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white text-slate-900 hover:border-[#1a6b7a] focus:border-[#1a6b7a] focus:outline-none'
              }`}
            >
              <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select a date'}</span>
              <CalendarDays className="h-4 w-4 text-slate-500" />
            </button>
            
            {dateMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-50 rounded-lg border border-slate-200 bg-white shadow-lg origin-top">
                {renderCalendar()}
              </div>
            )}
          </div>
 
          {/* Live Availability Status */}
          {selectedDate && (
            <div className="text-sm pt-2">
              {availabilityState.kind === 'loading' ? (
                <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> {availabilityState.message}</div>
              ) : availabilityState.kind === 'closed' ? (
                <div className="flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /> {availabilityState.message}</div>
              ) : availabilityState.kind === 'sold_out' ? (
                <div className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> {availabilityState.message}</div>
              ) : availabilityState.kind === 'open' ? (
                <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {availabilityState.message}</div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500"><Info className="h-4 w-4" /> {availabilityState.message}</div>
              )}
            </div>
          )}
 
          {/* Passengers */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="mb-1.5 block text-sm font-black text-slate-800">Adults</label>
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-1">
                <button type="button" disabled={isPackageInactive} onClick={() => setAdults(p => Math.max(1, p - 1))} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                <span className="text-sm font-semibold">{adults}</span>
                <button type="button" disabled={isPackageInactive} onClick={() => setAdults(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-black text-slate-800">Children</label>
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-1">
                <button type="button" disabled={isPackageInactive} onClick={() => setChildren(p => Math.max(0, p - 1))} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                <span className="text-sm font-semibold">{children}</span>
                <button type="button" disabled={isPackageInactive} onClick={() => setChildren(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
              </div>
            </div>
          </div>
 
          {/* Pricing Details */}
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-sm text-slate-600">
             <div className="flex justify-between items-center">
               <span>Base Fare <span className="text-xs text-slate-400">({adults}A, {children}C)</span></span>
               <span className="font-semibold text-slate-900">₹{formatINR(prices.subtotal)}</span>
             </div>
             <div className="flex justify-between items-center">
               <span>GST <span className="text-xs text-slate-400">(5%)</span></span>
               <span className="font-semibold text-slate-900">₹{formatINR(prices.gst)}</span>
             </div>
             <div className="flex justify-between items-center">
               <span>Gateway Fee <span className="text-xs text-slate-400">(1%)</span></span>
               <span className="font-semibold text-slate-900">₹{formatINR(prices.gatewayFee)}</span>
             </div>
             <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2 text-lg font-bold text-slate-900">
               <span>Total</span>
               <span className="text-[#1a6b7a]">₹{formatINR(prices.grandTotal)}</span>
             </div>
          </div>
 
          {/* CTA */}
          <button
            disabled={isPackageInactive || validVariants.length === 0 || (isBookingDisabled && isAuthenticated)}
            onClick={handleBookingClick}
            className={`mt-6 w-full rounded-lg px-4 py-3.5 font-black text-white shadow-sm transition-all ${
              isPackageInactive || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-[#1a6b7a] hover:-translate-y-0.5 hover:bg-[#13505c] hover:shadow-md'
            }`}
          >
            {isPackageInactive 
              ? 'Bookings Closed / Inactive' 
              : validVariants.length === 0 
                ? 'Fare updating' 
                : !isAuthenticated 
                  ? 'Login to Book' 
                  : !selectedDate 
                    ? 'Select a date' 
                    : availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out' 
                      ? 'Unavailable' 
                      : availabilityState.kind === 'open' 
                        ? 'Book Now' 
                        : 'Call to confirm availability'}
          </button>

          {brochurePdfUrl && (
            <a
              href={brochurePdfUrl}
              onClick={handleDownloadBrochure}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 hover:border-[#1a6b7a] bg-white px-4 py-2.5 text-xs font-black text-[#1a6b7a] hover:bg-slate-50 transition-colors uppercase tracking-wider"
            >
              📥 Download Brochure PDF
            </a>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onConfirm={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
        title="Verification Required"
        message="Please log in to continue booking your tickets."
        confirmText="Proceed to Login"
        cancelText="Cancel"
      />
    </div>
  );
};
