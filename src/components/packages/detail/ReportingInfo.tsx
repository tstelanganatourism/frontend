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
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#1a6b7a]">Boarding information</span>
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
    <section id="boarding" className="scroll-mt-[170px]">
      <div className="mb-8">
        <span className="text-xs font-black uppercase tracking-[0.24em] text-[#1a6b7a]">Expedition Hubs</span>
        <h2 className="mt-3 text-3xl font-black text-[#0f3d56] tracking-tight md:text-4xl">
          Boarding & Departure Stations
        </h2>
        <p className="mt-2 text-slate-500 font-semibold text-sm">
          Please arrive at least 30 minutes before departure time. Security checks and Aadhaar registers apply.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        
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
                  className="rounded-2xl border border-[#dfe8e2]/70 bg-white p-6 shadow-[0_8px_28px_rgba(15,61,86,0.03)] hover:border-[#1a6b7a]/30 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1a6b7a]/8 text-[#1a6b7a]">
                        <MapPin className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Boarding Point {index + 1}</span>
                        <h4 className="mt-1 text-xl font-black text-[#0f3d56]">{point.title}</h4>
                        {point.address && (
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                            {point.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {point.departure_time && (
                      <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#1a6b7a] border border-slate-100">
                        <Clock className="h-4 w-4" />
                        <span>{point.departure_time}</span>
                      </div>
                    )}
                  </div>

                  {/* Embed Map Iframe */}
                  {embedUrl && (
                    <div className="mt-5 overflow-hidden rounded-xl border border-[#dfe8e2]/70 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-700">Location map</span>
                        </div>
                        <span className="hidden text-xs font-bold text-slate-400 sm:inline">Use controls inside the map</span>
                      </div>
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="block w-full"
                      ></iframe>
                    </div>
                  )}

                  {point.map_url && (
                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                      <span className="text-xs font-bold text-slate-400">Need directions?</span>
                      <a
                        href={point.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#1a6b7a]/30 hover:border-[#1a6b7a] px-5 py-2 text-xs font-black uppercase tracking-widest text-[#1a6b7a] hover:bg-[#1a6b7a]/5 transition-all"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Get Route Maps
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[#dfe8e2]/60 bg-white p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-slate-300" />
              <h4 className="mt-4 text-base font-black text-[#0f3d56]">Docks confirmed on Booking</h4>
              <p className="mt-2 text-xs font-semibold text-slate-400 max-w-sm mx-auto">
                Official reporting docks, coach timings, and guide contacts will be shared instantly via SMS and ticket PDF.
              </p>
            </div>
          )}
        </div>

        {/* Local Support & Security Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-[#0f3d56] p-6 md:p-8 text-white shadow-[0_15px_40px_rgba(15,61,86,0.15)] flex flex-col justify-between"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#e5dac5] mb-6">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black">Official Docks & Security</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
              Telangana and Andhra Pradesh Boat Tourism associations enforce strict security protocols at all boarding terminals:
            </p>

            <ul className="mt-6 space-y-4 text-sm font-bold text-white/90">
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5]">1</span>
                <span>Original Government ID (Aadhaar, Passport, or DL) is mandatory at check-in.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5]">2</span>
                <span>Reporting gate closes exactly 15 minutes before the departure time.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-[#e5dac5]">3</span>
                <span>Life jackets must be strapped securely during the entire cruise journey.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 rounded-2xl bg-white/5 p-4 border border-white/10">
            <p className="text-xs font-semibold leading-relaxed text-[#e5dac5]">
              <strong>Traveler Tip:</strong> Carry light cotton clothing and sun hats. Phone signals may drop in the gorge valley.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
