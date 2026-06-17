'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Ticket, FileText, ExternalLink, Navigation, Banknote } from 'lucide-react';

interface OfficeVisitPopupProps {
  bookingId: string;
  onClose: () => void;
  targetType?: 'ROOM' | 'PACKAGE' | string;
  isPartial?: boolean;
  remainingBalance?: number;
  isAdmin?: boolean;
}

const OFFICE_ADDRESS = 'DR NO:4-1-78/1, KALYANA MANDAPAM ROAD OPP SBI ATM, BHADRACHALAM, BHADRADRI KOTHAGUDEM (DIST), TELANGANA-507111';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/ZZynQYDrgaDAipDz6?g_st=awb';

export function OfficeVisitPopup({
  bookingId,
  onClose,
  targetType,
  isPartial = false,
  remainingBalance = 0,
  isAdmin = false,
}: OfficeVisitPopupProps) {
  const [visible, setVisible] = useState(true);
  const derivedTargetType = targetType || (bookingId.toUpperCase().includes('AC') ? 'ROOM' : 'PACKAGE');

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dismiss]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const ticketUrl = `/print/ticket/${bookingId}`;
  const formUrl = `/print/form/${bookingId}`;
  const invoiceUrl = `/print/invoice/${bookingId}`;

  // Dynamically build bullets list
  const bullets = [
    { 
      icon: Ticket, 
      label: 'Your digital ticket (downloaded below)', 
      color: 'text-[#1A6B7A]', 
      bg: 'bg-[#1A6B7A]/5', 
      border: 'border-[#1A6B7A]/10' 
    },
  ];

  if (derivedTargetType === 'PACKAGE') {
    bullets.push({ 
      icon: FileText, 
      label: 'Filled Customer Detail Form (printed)', 
      color: 'text-amber-700', 
      bg: 'bg-amber-50/70', 
      border: 'border-amber-200/50' 
    });
  }

  bullets.push({ 
    icon: Navigation, 
    label: 'Valid Aadhaar ID for each passenger', 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50/70', 
    border: 'border-emerald-200/50' 
  });

  if (isPartial && remainingBalance > 0) {
    bullets.push({ 
      icon: Banknote, 
      label: `Remaining Balance: ₹${remainingBalance} (payable at office)`, 
      color: 'text-rose-700', 
      bg: 'bg-rose-50/70', 
      border: 'border-rose-200/50' 
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="office-popup-title"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-x-4 bottom-4 top-4 z-[9999] flex items-center justify-center sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg"
            style={{ margin: 0 }}
          >
            <div className="relative w-full max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-[0_30px_90px_rgba(15,61,86,0.18)] flex flex-col">

              {/* Close button */}
              <button
                onClick={dismiss}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Hero band */}
              <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#f2fafb] via-[#e6f4f6] to-white border-b border-slate-100 px-6 pt-10 pb-8 shrink-0">
                {/* Decorative rings */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#1A6B7A]/5" />
                <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full border border-[#1A6B7A]/8" />

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A6B7A]/10 border border-[#1A6B7A]/15 shadow-inner">
                    <MapPin className="h-7 w-7 text-[#1A6B7A]" />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#1A6B7A]">
                      {isPartial ? 'Balance Due & Check-In' : 'Action required'}
                    </p>
                    <h2 id="office-popup-title" className="text-xl font-extrabold leading-tight text-[#0F3D56]">
                      {derivedTargetType === 'ROOM' ? 'Visit our office for stay keys!' : 'Visit our office to confirm your trip!'}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-5 px-6 py-6">
                {/* Instructions */}
                <div className="text-sm leading-relaxed text-slate-600">
                  {isPartial ? (
                    <p>
                      Your booking is <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">partially confirmed</span>. Please pay the remaining balance of <span className="font-bold text-slate-800">₹{remainingBalance}</span> and visit our office to collect your <span className="font-bold text-slate-800">{derivedTargetType === 'ROOM' ? 'lodge keys' : 'manual boarding pass'}</span> with:
                    </p>
                  ) : (
                    <p>
                      Your booking is <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">confirmed online</span>. To receive your <span className="font-bold text-slate-800">{derivedTargetType === 'ROOM' ? 'lodge keys' : 'manual boarding pass'}</span>, please visit our office with:
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5">
                  {bullets.map(({ icon: Icon, label, color, bg, border }) => (
                    <li key={label} className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3`}>
                      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                    </li>
                  ))}
                </ul>

                {/* Office address */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Office Address</p>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">{OFFICE_ADDRESS}</p>
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#1A6B7A] hover:text-[#0F3D56] transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Open in Google Maps
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  {isAdmin ? (
                    derivedTargetType === 'PACKAGE' ? (
                      <div className="flex flex-col gap-3">
                        {/* Line 1: Ticket (Full Width) */}
                        <a
                          href={ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A6B7A] px-4 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#135460] hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Ticket className="h-4 w-4" />
                          Download Ticket
                        </a>
                        {/* Line 2: Invoice & Form (Side by Side) */}
                        <div className="grid grid-cols-2 gap-3">
                          <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 sm:px-4 py-3.5 text-xs sm:text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <FileText className="h-4 w-4 text-slate-500" />
                            Download Invoice
                          </a>
                          <a
                            href={formUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-2 sm:px-4 py-3.5 text-xs sm:text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <FileText className="h-4 w-4 text-amber-600" />
                            Download Form
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* Room: Ticket & Invoice side-by-side */
                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A6B7A] px-2 sm:px-4 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#135460] hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Ticket className="h-4 w-4" />
                          Download Ticket
                        </a>
                        <a
                          href={invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 sm:px-4 py-3.5 text-xs sm:text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <FileText className="h-4 w-4 text-slate-500" />
                          Download Invoice
                        </a>
                      </div>
                    )
                  ) : (
                    /* Public Tourist view (No Invoice) */
                    derivedTargetType === 'PACKAGE' ? (
                      /* Package: Ticket & Form side-by-side */
                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A6B7A] px-2 sm:px-4 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#135460] hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <Ticket className="h-4 w-4" />
                          Download Ticket
                        </a>
                        <a
                          href={formUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-2 sm:px-4 py-3.5 text-xs sm:text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <FileText className="h-4 w-4 text-amber-600" />
                          Download Form
                        </a>
                      </div>
                    ) : (
                      /* Room: Ticket only full-width */
                      <a
                        href={ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A6B7A] px-4 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#135460] hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Ticket className="h-4 w-4" />
                        Download Ticket
                      </a>
                    )
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={dismiss}
                  className="w-full rounded-2xl border border-slate-200/50 bg-slate-50 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
                >
                  I understand, close this
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useOfficeVisitPopup(newBookingId: string | null) {
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!newBookingId) return;
    const storageKey = `office_popup_seen:${newBookingId}`;
    if (typeof window !== 'undefined' && !localStorage.getItem(storageKey)) {
      setActiveBookingId(newBookingId);
    }
  }, [newBookingId]);

  const dismiss = useCallback(() => {
    if (activeBookingId) {
      localStorage.setItem(`office_popup_seen:${activeBookingId}`, '1');
      setActiveBookingId(null);
    }
  }, [activeBookingId]);

  return { activeBookingId, dismiss };
}
