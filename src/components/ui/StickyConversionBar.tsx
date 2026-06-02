'use client';

import React from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { trackEvent } from '@/components/providers/AnalyticsProvider';

export default function StickyConversionBar() {
  const whatsappMessage = 'Hello Telangana Boat Tourism, I would like help with booking or enquiring about boat rides, sightseeing packages, rooms, or travel services.';
  const whatsappUrl = `https://wa.me/919542069573?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsApp = () => {
    trackEvent('WhatsApp_click', { location: 'sticky_bar' });
  };

  const handleCall = () => {
    trackEvent('phone_click', { location: 'sticky_bar' });
    window.location.href = 'tel:+919542069573';
  };

  const handleDirections = () => {
    trackEvent('directions_click', { location: 'sticky_bar' });
    window.open('https://maps.google.com/?q=17.6685,80.8936', '_blank');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid w-full max-w-[100dvw] grid-cols-3 overflow-hidden border-t border-slate-200 bg-white pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 shadow-[0_-10px_28px_rgba(15,61,86,0.12)] sm:hidden">
      <button
        onClick={handleCall}
        className="min-w-0 border-r border-slate-200 px-1 py-1.5 text-slate-600 active:text-[var(--color-brand-river)]"
      >
        <span className="flex min-w-0 flex-col items-center justify-center gap-1">
          <Phone className="h-5 w-5 shrink-0" />
          <span className="max-w-full truncate text-[10px] font-bold uppercase tracking-wide">Call Us</span>
        </span>
      </button>

      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsApp}
        className="min-w-0 border-r border-slate-200 px-1 py-1.5 text-[#075e54] active:opacity-80"
      >
        <span className="flex min-w-0 flex-col items-center justify-center gap-1">
          <MessageCircle className="h-5 w-5 shrink-0" />
          <span className="max-w-full truncate text-[10px] font-bold uppercase tracking-wide">WhatsApp</span>
        </span>
      </a>
      
      <button
        onClick={handleDirections}
        className="min-w-0 px-1 py-1.5 text-slate-600 active:text-[var(--color-brand-river)]"
      >
        <span className="flex min-w-0 flex-col items-center justify-center gap-1">
          <MapPin className="h-5 w-5 shrink-0" />
          <span className="max-w-full truncate text-[10px] font-bold uppercase tracking-wide">Directions</span>
        </span>
      </button>
    </div>
  );
}
