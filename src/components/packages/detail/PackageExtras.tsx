import React from 'react';
import { Sparkles, UtensilsCrossed, Fish, Drumstick, PlusCircle, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export interface PackageExtraItem {
  id: number;
  title: string;
  description?: string | null;
  adult_price?: number | string | null;
  child_price?: number | string | null;
  student_price?: number | string | null;
  min_passengers?: number;
  sort_order?: number;
}

interface PackageExtrasProps {
  extras?: PackageExtraItem[];
  isStudentPackage?: boolean;
}

export function PackageExtras({ extras = [], isStudentPackage = false }: PackageExtrasProps) {
  if (!extras || extras.length === 0) return null;

  const getExtraIcon = (title: string) => {
    const t = title.toUpperCase();
    if (t.includes('FISH')) return <Fish className="h-5 w-5 text-teal-600" />;
    if (t.includes('CHICKEN')) return <Drumstick className="h-5 w-5 text-amber-600" />;
    if (t.includes('FOOD') || t.includes('MEAL') || t.includes('LUNCH') || t.includes('DINNER')) {
      return <UtensilsCrossed className="h-5 w-5 text-emerald-600" />;
    }
    return <Sparkles className="h-5 w-5 text-[#0d6e75]" />;
  };

  return (
    <section id="extras" className="scroll-mt-[135px] sm:scroll-mt-[160px]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-[#0d6e75]" />
        <p className="text-xs font-black uppercase tracking-wider text-[#0d6e75]">Custom Add-Ons & Extras</p>
      </div>
      <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Optional Add-Ons & Services</h2>
      <p className="text-sm font-medium text-slate-500 mt-2 max-w-2xl">
        Enhance your tour experience with optional custom add-ons and services. You can select any of these items directly when booking your tickets.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {extras.map((extra) => {
          const adultPrice = Number(extra.adult_price || 0);
          const childPrice = Number(extra.child_price || 0);
          const studentPrice = Number(extra.student_price || 0);

          return (
            <div
              key={extra.id}
              className="relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-[#0d6e75]/40"
            >
              <div>
                {/* Header row with icon and badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getExtraIcon(extra.title)}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-150 bg-teal-50/70 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0d6e75]">
                    <CheckCircle2 className="h-3 w-3" />
                    Selectable at Checkout
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-black text-slate-900 mt-4 leading-snug tracking-tight">
                  {extra.title}
                </h3>

                {extra.description && (
                  <p className="text-xs font-semibold text-slate-600 mt-2 leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-slate-150">
                    {extra.description}
                  </p>
                )}
              </div>

              {/* Price footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Add-on Fare
                </span>

                <div className="text-right">
                  {isStudentPackage ? (
                    <span className="text-sm font-black text-[#0d6e75] bg-teal-50 px-3 py-1 rounded-xl border border-teal-100">
                      ₹{formatINR(studentPrice)} <span className="text-[10px] font-semibold text-slate-500">/ student</span>
                    </span>
                  ) : adultPrice === childPrice && adultPrice > 0 ? (
                    <span className="text-sm font-black text-[#0d6e75] bg-teal-50 px-3 py-1 rounded-xl border border-teal-100">
                      ₹{formatINR(adultPrice)} <span className="text-[10px] font-semibold text-slate-500">/ person</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {adultPrice > 0 && (
                        <span className="text-xs font-black text-[#0d6e75] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                          Adult: ₹{formatINR(adultPrice)}
                        </span>
                      )}
                      {childPrice > 0 && (
                        <span className="text-xs font-black text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          Child: ₹{formatINR(childPrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
