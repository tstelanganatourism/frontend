'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

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
    <section id="inclusions" className="scroll-mt-28">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#f4faf9] to-white p-5 md:p-7">
          <h2 className="text-2xl font-black tracking-normal text-slate-950 md:text-3xl">
            Inclusions and exclusions
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            Please check this once before payment. It helps avoid last-minute confusion at the reporting point.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:p-7 lg:grid-cols-2">
          {inclusions && inclusions.length > 0 && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black text-emerald-900">
                <CheckCircle2 className="h-5 w-5" />
                Package includes
              </h3>
              <ul className="space-y-2 text-sm font-medium text-slate-700">
                {inclusions.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item.title || item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exclusions && exclusions.length > 0 && (
            <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black text-rose-900">
                <XCircle className="h-5 w-5" />
                Package excludes
              </h3>
              <ul className="space-y-2 text-sm font-medium text-slate-700">
                {exclusions.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2">
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
