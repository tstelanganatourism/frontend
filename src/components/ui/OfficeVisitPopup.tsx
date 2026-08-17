'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Ticket, FileText, ExternalLink, Navigation, Banknote, Phone, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OfficeVisitPopupProps {
  bookingId: string;
  onClose: () => void;
  targetType?: 'ROOM' | 'PACKAGE' | string;
  isPartial?: boolean;
  remainingBalance?: number;
  isAdmin?: boolean;
  secret?: string | null;
}

const OFFICE_ADDRESS = 'Om Shanti satram, Kalyana mandapam road, near SBI ATM, Bhadrachalam, Telangana 507111';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/ZZynQYDrgaDAipDz6?g_st=awb';

export function OfficeVisitPopup({
  bookingId,
  onClose,
  targetType,
  isPartial = false,
  remainingBalance = 0,
  isAdmin = false,
  secret = null,
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

  const ticketUrl = `/print/ticket/${bookingId}${secret ? `?secret=${secret}` : ''}`;
  const formUrl = `/print/form/${bookingId}${secret ? `?secret=${secret}` : ''}`;
  const invoiceUrl = `/print/invoice/${bookingId}${secret ? `?secret=${secret}` : ''}`;

  // Dynamically build checklist items
  const bullets = [
    { 
      icon: Ticket, 
      title: 'Digital Ticket',
      desc: 'Downloaded below or stored on your phone', 
      color: 'text-[#1A6B7A]', 
      bg: 'bg-[#1A6B7A]/5', 
      border: 'border-[#1A6B7A]/15' 
    },
  ];

  if (derivedTargetType === 'PACKAGE') {
    bullets.push({ 
      icon: FileText, 
      title: 'Printed Customer Detail Form',
      desc: 'Mandatory printed passenger declaration form', 
      color: 'text-amber-700', 
      bg: 'bg-amber-50/80', 
      border: 'border-amber-200/60' 
    });
  }

  bullets.push({ 
    icon: Navigation, 
    title: 'Valid Govt Aadhaar ID',
    desc: 'Original ID proof for each passenger before boarding', 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50/80', 
    border: 'border-emerald-200/60' 
  });

  if (isPartial && remainingBalance > 0) {
    bullets.push({ 
      icon: Banknote, 
      title: 'Remaining Cash / Pay Balance',
      desc: `Balance amount: ₹${remainingBalance.toLocaleString('en-IN')} (payable at office)`, 
      color: 'text-rose-700', 
      bg: 'bg-rose-50/80', 
      border: 'border-rose-200/60' 
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/75 backdrop-blur-md"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="office-popup-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-10"
          >
            {/* Header (Sticky Top) */}
            <div className="shrink-0 relative border-b border-slate-100 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 pr-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shadow-sm mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200 mb-1">
                      Mandatory Boarding Step
                    </span>
                    <h2 id="office-popup-title" className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {isPartial
                        ? 'Pay balance & visit office first!'
                        : derivedTargetType === 'ROOM'
                        ? 'Visit office first to collect room keys!'
                        : 'Visit office first for boarding pass!'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {derivedTargetType === 'ROOM'
                        ? 'Without office visit, entry/check-in is restricted.'
                        : 'Without physical boarding pass, boarding is strictly prohibited.'}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Confirmation Status Banner */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-700 leading-relaxed">
                {isPartial ? (
                  <p>
                    Your booking is <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/50">partially confirmed</span>. Please visit our Bhadrachalam office <span className="font-bold text-slate-900">BEFORE departure</span> with remaining balance <span className="font-bold text-slate-900">₹{remainingBalance.toLocaleString('en-IN')}</span> and the required documents below.
                  </p>
                ) : (
                  <p>
                    Your booking is <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/50">confirmed online</span>. Before your {derivedTargetType === 'ROOM' ? 'check-in' : 'departure'}, you <span className="font-bold text-amber-700">MUST visit our office</span> to collect your physical {derivedTargetType === 'ROOM' ? 'room key pass' : 'boarding pass'}.
                  </p>
                )}
              </div>

              {/* Requirements Checklist */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  What to bring to the office:
                </p>
                <div className="grid gap-2.5">
                  {bullets.map(({ icon: Icon, title, desc, color, bg, border }) => (
                    <div key={title} className={`flex items-start gap-3 rounded-2xl border ${border} ${bg} p-3 transition-all`}>
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs border ${border}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-800 leading-tight">{title}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Address & Location Card */}
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-white p-3.5 sm:p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      📍 Office Address (Bhadrachalam)
                    </span>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed mt-1">
                      {OFFICE_ADDRESS}
                    </p>
                  </div>
                </div>

                {/* Direct Phone Numbers */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/50">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-amber-600" /> Helpline:
                  </span>
                  <a
                    href="tel:+919951369573"
                    className="text-xs font-extrabold text-slate-900 bg-white hover:bg-amber-100/50 px-2.5 py-1 rounded-lg border border-amber-200/80 transition-colors"
                  >
                    +91 99513 69573
                  </a>
                  <a
                    href="tel:+917780119268"
                    className="text-xs font-extrabold text-slate-900 bg-white hover:bg-amber-100/50 px-2.5 py-1 rounded-lg border border-amber-200/80 transition-colors"
                  >
                    +91 77801 19268
                  </a>
                </div>

                {/* Embedded Google Maps Box */}
                <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-amber-200/80 shadow-inner group">
                  <iframe
                    title="TS Boat Tourism Office Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.622075248225!2d80.8840206!3d17.6680497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36a9b83aea4343%3A0x7108b8976c666ac7!2sTS%20BOAT%20TOURISM!5e0!3m2!1sen!2sin!4v1785936445858!5m2!1sen!2sin"
                  />
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-amber-700 hover:text-amber-800 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-md border border-amber-200 transition-all hover:scale-105 active:scale-95"
                  >
                    <Navigation className="h-3.5 w-3.5 text-amber-600" />
                    Open in Maps
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 p-4 sm:p-5 bg-slate-50/90 backdrop-blur-md border-t border-slate-100 flex flex-col gap-2.5">
              {isAdmin ? (
                derivedTargetType === 'PACKAGE' ? (
                  <div className="flex flex-col gap-2">
                    {/* Line 1: Ticket (Primary) */}
                    <a
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1A6B7A] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#135460] active:scale-[0.99]"
                    >
                      <Ticket className="h-4 w-4" />
                      Download Ticket
                    </a>
                    {/* Line 2: Invoice & Form (Side by Side) */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-100 active:scale-[0.98]"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        Invoice
                      </a>
                      <a
                        href={formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-xs font-bold text-amber-800 shadow-xs transition-all hover:bg-amber-100 active:scale-[0.98]"
                      >
                        <FileText className="h-3.5 w-3.5 text-amber-600" />
                        Form
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Room: Ticket & Invoice side-by-side */
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1A6B7A] px-3 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#135460] active:scale-[0.99]"
                    >
                      <Ticket className="h-4 w-4" />
                      Download Ticket
                    </a>
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-100 active:scale-[0.98]"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      Invoice
                    </a>
                  </div>
                )
              ) : (
                /* Public Tourist view */
                derivedTargetType === 'PACKAGE' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1A6B7A] px-3 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#135460] active:scale-[0.99]"
                    >
                      <Ticket className="h-4 w-4" />
                      Download Ticket
                    </a>
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-xs sm:text-sm font-bold text-amber-800 shadow-xs transition-all hover:bg-amber-100 active:scale-[0.98]"
                    >
                      <FileText className="h-4 w-4 text-amber-600" />
                      Download Form
                    </a>
                  </div>
                ) : (
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1A6B7A] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#135460] active:scale-[0.99]"
                  >
                    <Ticket className="h-4 w-4" />
                    Download Ticket
                  </a>
                )
              )}

              {/* Dismiss Button */}
              <button
                onClick={dismiss}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-[0.99]"
              >
                I understand, close this
              </button>
            </div>
          </motion.div>
        </div>
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
