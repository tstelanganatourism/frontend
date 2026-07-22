'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ShieldAlert, Navigation } from 'lucide-react';

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

  if (boardingPoints.length === 0) {
    return (
      <section id="boarding" className="scroll-mt-[170px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#eef8f6] text-[#1a6b7a]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#1a6b7a]">
                <MapPin className="h-3.5 w-3.5" />
                Boarding Information
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-normal text-[#0f3d56]">
                Reporting point will be confirmed before travel
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                Exact boarding location, coach timing, guide contact and route details will be shared on the ticket once the operator confirms the slot.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="boarding" className="scroll-mt-[135px] sm:scroll-mt-[160px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0d6e75]">
          <MapPin className="h-3.5 w-3.5" />
          Boarding Stations
        </span>
        <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight md:text-3xl">
          Boarding & Departure Stations
        </h2>
        <p className="mt-2 text-slate-500 font-semibold text-xs">
          Please arrive at least 30 minutes before departure time. Security checks and ID registration apply.
        </p>
      </div>

      <div className="grid gap-6 items-start lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Boarding Points Cards */}
        <div className="space-y-4">
          {boardingPoints.length > 0 ? (
            boardingPoints.map((point, index) => {
              const embedUrl = getEmbedUrl(point.map_url, point.address);
              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#0d6e75]/30 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0d6e75]/10 text-[#0d6e75]">
                        <MapPin className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Boarding Point {index + 1}</span>
                        <h4 className="mt-1 text-base font-black text-slate-900">{point.title}</h4>
                        {point.address && (
                          <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
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
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Location Map</span>
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

                  {point.map_url && (
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-semibold text-slate-400">Need directions?</span>
                      <a
                        href={point.map_url}
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
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-3xs">
              <MapPin className="mx-auto h-8 w-8 text-slate-350" />
              <h4 className="mt-4 text-sm font-black text-slate-900">Docks Confirmed After Booking</h4>
              <p className="mt-2 text-xs font-semibold text-slate-500 max-w-xs mx-auto leading-relaxed">
                Official boarding dock address, coach times, and coordinator contacts will be shared instantly via SMS and Ticket PDF.
              </p>
            </div>
          )}
        </div>

        {/* Local Support & Security Box (Now Teal and Cream) */}
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
            <h3 className="text-xl font-black">Official Docks & Security</h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#fafaf7]/80">
              Boat Tourism associations enforce safety and verify passenger manifests at boarding terminals:
            </p>

            <ul className="mt-6 space-y-4 text-xs font-bold text-white/90">
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">1</span>
                <span>Original Government ID (Aadhaar or DL) is mandatory at check-in reporting.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">2</span>
                <span>Reporting gates close exactly 15 minutes before the scheduled boat departure.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5] font-black">3</span>
                <span>Life jackets are provided on-board and must be worn during the cruise.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 rounded-xl bg-amber-500/10 p-4 border border-amber-500/20">
            <p className="text-xs font-semibold leading-relaxed text-[#e5dac5]">
              <strong>Travel Tip:</strong> Carry cotton clothing and sun hats. Cellular signal might be weak inside the river gorge.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
