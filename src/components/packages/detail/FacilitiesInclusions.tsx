'use client';

import React from 'react';
import { CheckCircle2, XCircle, ListChecks } from 'lucide-react';

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
    <section id="inclusions" className="scroll-mt-[170px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-amber-500/5 p-5 md:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0d6e75]">
            <ListChecks className="h-3.5 w-3.5" />
            Trip Inclusions & Rules
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Inclusions & Exclusions
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
            Please verify inclusions before booking to ensure proper check-in coordination at the reporting point.
          </p>
        </div>

        <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-2 bg-slate-50/20">
          {inclusions && inclusions.length > 0 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-500/5 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-805">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Package Includes
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                {inclusions.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 rounded-lg bg-white px-3 py-2.5 border border-emerald-100/30 shadow-3xs">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item.title || item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exclusions && exclusions.length > 0 && (
            <div className="rounded-xl border border-rose-100 bg-rose-500/5 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-rose-805">
                <XCircle className="h-5 w-5 text-rose-500" />
                Package Excludes
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                {exclusions.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 rounded-lg bg-white px-3 py-2.5 border border-rose-100/30 shadow-3xs">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span>{item.title || item.label}</span>
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
