'use client';

import React from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { trackEvent } from '@/components/providers/AnalyticsProvider';

export default function StickyConversionBar() {
  const handleWhatsApp = () => {
    trackEvent('WhatsApp_click', { location: 'sticky_bar' });
    window.open('https://wa.me/919542069573', '_blank');
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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-t border-slate-200 bg-white px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sm:hidden">
      <button
        onClick={handleCall}
        className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 active:text-[var(--color-brand-river)]"
      >
        <Phone className="h-5 w-5" />
        Call Us
      </button>
      
      <div className="h-8 w-[1px] bg-slate-200"></div>
      <a 
        href="https://wa.me/919542069573" 
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsApp}
        className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#25D366] active:opacity-80"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>

      <div className="h-8 w-[1px] bg-slate-200"></div>
      
      <button
        onClick={handleDirections}
        className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 active:text-[var(--color-brand-river)]"
      >
        <MapPin className="h-5 w-5" />
        Directions
      </button>
    </div>
  );
}
