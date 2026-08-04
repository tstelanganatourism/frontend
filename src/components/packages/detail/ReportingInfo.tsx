'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ShieldAlert, Navigation, Building2, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BoardingPoint {
  id: number;
  title: string;
  address?: string | null;
  map_url?: string | null;
  departure_time?: string | null;
}

interface ReportingInfoProps {
  boardingPoints: BoardingPoint[];
}

const TS_BOAT_OFFICE = {
  id: -999,
  title: 'TS Boat Tourism Main Office (Mandatory First Stop)',
  address: 'Door No. 10-1-2/1, Ground Floor, Om Shanthi Building Sataram, Kalyana Mandapam Road, near SBI ATM, Bhadrachalam, Telangana 507111',
  map_url: 'https://maps.google.com/maps?q=TS+Boat+Tourism+Om+Shanthi+Building+Bhadrachalam&z=16&output=embed',
  direct_map_url: 'https://maps.google.com/?q=Door+No.+10-1-2/1,+Ground+Floor,+Om+Shanthi+Building+Sataram,+Kalyana+Mandapam+Road,+near+SBI+ATM,+Bhadrachalam,+Telangana+507111',
  departure_time: 'Reporting Mandatory 45 Mins Before Travel',
  phone1: '+91 99513 69573',
  phone2: '+91 77801 19268'
};

export const ReportingInfo = ({ boardingPoints = [] }: ReportingInfoProps) => {
  // Safe map url builder
  const getEmbedUrl = (rawUrl: string | null | undefined, address?: string | null) => {
    if (!rawUrl) {
      if (address) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
      return '';
    }
    
    if (rawUrl.includes('<iframe')) {
      const match = rawUrl.match(/src="([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    } else if (rawUrl.includes('google.com/maps/embed') || rawUrl.includes('maps.google.com/maps?')) {
      return rawUrl;
    } else {
      const coordMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch && coordMatch[1] && coordMatch[2]) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
      }
    }
    
    return `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  // Combine TS Boat Main Office as the #1 mandatory reporting center, followed by any package-specific stations
  const hasTsOfficeAlready = boardingPoints.some(bp => 
    bp.title.toLowerCase().includes('ts boat') || bp.title.toLowerCase().includes('om shanthi')
  );

  const displayPoints = hasTsOfficeAlready ? boardingPoints : [TS_BOAT_OFFICE, ...boardingPoints];

  return (
    <section id="boarding" className="scroll-mt-[135px] sm:scroll-mt-[160px]">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0d6e75]">
          <Building2 className="h-3.5 w-3.5" />
          Reporting & Boarding Stations
        </span>
        <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight md:text-3xl">
          Boarding & Reporting Stations
        </h2>
        <p className="mt-2 text-slate-500 font-semibold text-xs leading-relaxed">
          <strong>Mandatory Notice:</strong> All passengers and guests must first report to our TS Boat Tourism Central Office in Bhadrachalam before heading to any boat dock, bus pickup, or room stay.
        </p>
      </div>

      {/* Mandatory TS Boat Office Banner Alert */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-amber-300/80 bg-amber-500/10 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                MANDATORY FIRST STOP
              </span>
              <span className="text-xs font-extrabold text-amber-900">
                TS Boat Tourism Main Office (Bhadrachalam)
              </span>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-800 leading-relaxed">
              Before proceeding to any boarding station, river dock, hotel, or bamboo hut stay, <strong>ALL tourists and room guests must first report to our TS Boat Office</strong> for Aadhaar/ID verification, physical ticket issuance, guide allocation, and travel orientation.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-extrabold text-slate-700">
              <div className="flex items-center gap-1.5 text-[#0d6e75]">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Om Shanthi Building Sataram, Kalyana Mandapam Road, Bhadrachalam</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 bg-white/90 px-3 py-1 rounded-full border border-slate-200">
                <Phone className="h-3.5 w-3.5 text-[#0d6e75]" />
                <span>+91 99513 69573 / +91 77801 19268</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 items-start lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Boarding Points Cards */}
        <div className="space-y-4">
          {displayPoints.map((point, index) => {
            const isMainOffice = point.id === -999 || point.title.toLowerCase().includes('ts boat');
            const embedUrl = getEmbedUrl(point.map_url, point.address);
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
                  isMainOffice 
                    ? 'border-[#0d6e75] bg-white ring-2 ring-[#0d6e75]/10' 
                    : 'border-slate-200 bg-white hover:border-[#0d6e75]/30'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isMainOffice ? 'bg-[#0d6e75] text-white shadow-sm' : 'bg-[#0d6e75]/10 text-[#0d6e75]'
                    }`}>
                      {isMainOffice ? <Building2 className="h-5.5 w-5.5" /> : <MapPin className="h-5.5 w-5.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isMainOffice ? 'text-[#0d6e75]' : 'text-slate-400'
                        }`}>
                          {isMainOffice ? '⭐ PRIMARY REPORTING HUB (STEP 1)' : `Transit / Boarding Point ${index}`}
                        </span>
                        {isMainOffice && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                            Required First Arrival
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1 text-base font-black text-slate-900">{point.title}</h4>
                      {point.address && (
                        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                          {point.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {point.departure_time && (
                    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0d6e75] border border-slate-100">
                      <Clock className="h-4 w-4" />
                      <span>{point.departure_time}</span>
                    </div>
                  )}
                </div>

                {/* Embed Map Iframe */}
                {embedUrl && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-3xs">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                          {isMainOffice ? 'TS Boat Office Location Map' : 'Location Map'}
                        </span>
                      </div>
                    </div>
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="260"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="block w-full"
                    ></iframe>
                  </div>
                )}

                {(point.map_url || (point as any).direct_map_url) && (
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-slate-400">Need directions?</span>
                    <a
                      href={(point as any).direct_map_url || point.map_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 hover:border-[#0d6e75] px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Navigation className="h-3.5 w-3.5 text-[#0d6e75]" />
                      Open in Google Maps
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Local Support & Security Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-[#0d6e75] p-6 md:p-8 text-white shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#e5dac5] mb-6">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black">Mandatory Reporting Protocols</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#fafaf7]/80">
              For all packages, river cruises, and room stays, official government rules and tourism guidelines apply:
            </p>

            <ul className="mt-6 space-y-4 text-xs font-bold text-white/90">
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">1</span>
                <span><strong>Report to TS Boat Office First:</strong> All guests must visit the main office in Bhadrachalam before heading to any dock or hotel.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">2</span>
                <span><strong>Government ID Verification:</strong> Original Government ID (Aadhaar or DL) is mandatory for check-in & manifest registration.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">3</span>
                <span><strong>Reporting Cutoff:</strong> Reporting gates close 30 minutes prior to scheduled bus/boat departure times.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">4</span>
                <span><strong>On-Board Safety:</strong> Life jackets are mandatory on-board all Godavari river cruises.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 rounded-xl bg-amber-500/10 p-4 border border-amber-500/20">
            <p className="text-xs font-semibold leading-relaxed text-[#e5dac5]">
              <strong>Central Helpline:</strong> Call +91 99513 69573 or +91 77801 19268 if you need location assistance reaching our office.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

