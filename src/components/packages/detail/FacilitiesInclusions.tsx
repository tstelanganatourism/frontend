'use client';

import React from 'react';
import { CheckCircle2, ListChecks, XCircle } from 'lucide-react';

interface InclusionItem {
  id: number;
  title?: string;
  label?: string;
}

interface FacilitiesInclusionsProps {
  inclusions: InclusionItem[];
  exclusions: InclusionItem[];
}

export const FacilitiesInclusions = ({ inclusions, exclusions }: FacilitiesInclusionsProps) => {
  if ((!inclusions || inclusions.length === 0) && (!exclusions || exclusions.length === 0)) return null;

  return (
    <section id="inclusions" className="scroll-mt-[140px] my-8 sm:my-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        
        {/* Header section */}
        <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7 bg-gradient-to-r from-slate-50/80 via-white to-emerald-50/20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#0d6e75]">
              <ListChecks className="h-3.5 w-3.5" />
              <span>Trip Inclusions & Rules</span>
            </span>
            <h2 className="mt-2.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              What is covered in <span className="text-[#0d6e75]">this trip</span>
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm font-semibold leading-relaxed text-slate-500">
              Review what the operator includes and what needs separate payment before you confirm your booking.
            </p>
          </div>

          {/* Clean Count Badges */}
          <div className="flex items-center gap-2 text-xs font-black">
            {inclusions?.length ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/90 bg-emerald-50/80 px-3.5 py-2 text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{inclusions.length} Included</span>
              </span>
            ) : null}
            {exclusions?.length ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/90 bg-rose-50/80 px-3.5 py-2 text-rose-800 shadow-2xs">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>{exclusions.length} Excluded</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* 2-Column Grid: Included (Teal Brand Palette) vs Not Included (Dim Red Palette) */}
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 bg-slate-50/40">
          
          {/* INCLUDED — Brand Color Palette (Teal / Emerald) */}
          {inclusions && inclusions.length > 0 && (
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white p-5 md:p-6 shadow-2xs">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2.5 text-sm font-black uppercase tracking-wider text-emerald-950">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0d6e75] text-white shadow-md shadow-teal-900/20">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </span>
                  Included
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0d6e75] bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Covered Fare
                </span>
              </div>

              <ul className="grid gap-2.5 text-xs sm:text-sm font-bold text-slate-800 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                {inclusions.map((item) => (
                  <li key={item.id} className="flex min-h-12 items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-white px-3.5 py-3 shadow-2xs hover:border-[#0d6e75]/50 transition-colors">
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#0d6e75]" />
                    <span className="leading-snug">{item.title || item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* NOT INCLUDED — Dim Red Palette (Soft Rose / Red) */}
          {exclusions && exclusions.length > 0 && (
            <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/60 via-rose-50/30 to-white p-5 md:p-6 shadow-2xs">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2.5 text-sm font-black uppercase tracking-wider text-rose-950">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-900/20">
                    <XCircle className="h-4.5 w-4.5" />
                  </span>
                  Not Included
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded-md">
                  Pay Separately
                </span>
              </div>

              <ul className="grid gap-2.5 text-xs sm:text-sm font-bold text-slate-800 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                {exclusions.map((item) => (
                  <li key={item.id} className="flex min-h-12 items-start gap-2.5 rounded-xl border border-rose-200/70 bg-white px-3.5 py-3 shadow-2xs hover:border-rose-300 transition-colors">
                    <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-500" />
                    <span className="leading-snug">{item.title || item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
