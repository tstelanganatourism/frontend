'use client';

import React from 'react';
import {
  Bus,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileDown,
  MapPin,
  ShieldCheck,
  Ship,
  Sparkles,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { downloadFileViaFetch } from '@/lib/downloadUtils';

interface Variant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  weekend_adult_price?: number | string;
  weekend_child_price?: number | string;
  student_price?: number | string;
  weekend_student_price?: number | string;
  transport_info?: string | null;
}

interface PackageDetail {
  id: number;
  slug: string;
  title: string;
  type: string;
  region?: string | null;
  description?: string | null;
  is_student_package?: boolean;
  brochure_pdf_url?: string | null;
  generated_brochure_url?: string | null;
  variants: Variant[];
  highlights?: Array<{ id: number; title?: string; label?: string; icon?: string | null; sort_order?: number }>;
  inclusions?: Array<{ id: number; title?: string; label?: string; icon?: string | null; sort_order?: number }>;
  exclusions?: Array<{ id: number; title?: string; label?: string; icon?: string | null; sort_order?: number }>;
  boarding_points?: Array<{ id: number; title: string; address?: string | null; departure_time?: string | null; sort_order?: number }>;
}

interface ExperienceOverviewProps {
  pkg: PackageDetail;
  durationLabel: string;
}

const currency = (value: number | string) => Number(value || 0).toLocaleString('en-IN');

export const ExperienceOverview = ({ pkg, durationLabel }: ExperienceOverviewProps) => {
  const visitingPlaces = (pkg.highlights || []).map((item) => item.title || item.label).filter(Boolean);
  const included = (pkg.inclusions || []).map((item) => item.label || item.title).filter(Boolean);
  const excluded = (pkg.exclusions || []).map((item) => item.label || item.title).filter(Boolean);
  const fares = (pkg.variants || []).map((variant) => Number((pkg.is_student_package ? variant.student_price : variant.adult_price) || 0)).filter(Boolean);
  const lowestFare = fares.length ? Math.min(...fares) : 0;
  const activeBrochureUrl = pkg.generated_brochure_url || pkg.brochure_pdf_url;

  const extractObjectKey = (url: string): string | null => {
    if (!url) return null;
    if (url.startsWith('private/')) return url;
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
      if (path.startsWith('private/')) {
        return decodeURIComponent(path);
      }
    } catch (e) {
      if (url.startsWith('private/')) return url;
    }
    return null;
  };

  const handleDownloadBrochure = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const brochureUrl = activeBrochureUrl;
    if (!brochureUrl) return;

    const rawKey = extractObjectKey(brochureUrl);
    const filename = `${pkg.slug}-brochure.pdf`;

    if (rawKey) {
      e.preventDefault();
      const downloadUrl = `/api/v1/documents/download?key=${encodeURIComponent(rawKey)}&filename=${encodeURIComponent(filename)}`;
      await downloadFileViaFetch(downloadUrl, filename);
    }
    // If no rawKey (e.g. Google Drive link), do NOT call e.preventDefault().
    // The native <a> tag behavior will open/download it, bypassing the CORS fetch error.
  };

  return (
    <section id="overview" className="scroll-mt-[160px]">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-[#f5fbfa] to-[#fff8eb] p-5 md:p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e7f5f2] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#0f6f7a]">
            <Sparkles className="h-3.5 w-3.5" />
            Package at a Glance
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-normal text-slate-950 md:text-3xl">
            Everything you need before booking
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
            Clear route, timing, fare and inclusion details, written in simple Indian English so families can compare and book without confusion.
          </p>
        </div>

        <div className="p-5 md:p-7">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              <Clock className="mb-1.5 h-4 w-4 text-[#1a6b7a]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
              <p className="mt-0.5 text-xs font-black text-slate-950 sm:text-sm">{durationLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              <MapPin className="mb-1.5 h-4 w-4 text-[#1a6b7a]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporting point</p>
              <p className="mt-0.5 text-xs font-black text-slate-950 leading-tight sm:text-sm">{primaryBoarding?.title || 'Confirmed after booking'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              <Ship className="mb-1.5 h-4 w-4 text-[#1a6b7a]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience</p>
              <p className="mt-0.5 text-xs font-black text-slate-950 sm:text-sm">{pkg.type === 'TOUR' ? 'River cruise package' : 'Sightseeing tour'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              <CircleDollarSign className="mb-1.5 h-4 w-4 text-[#1a6b7a]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fare from</p>
              <p className="mt-0.5 text-xs font-black text-slate-950 sm:text-sm">{lowestFare ? `₹${currency(lowestFare)} / ${pkg.is_student_package ? 'student' : 'adult'}` : 'Check live fare'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-black text-slate-950">About this package</h3>
            {pkg.description ? (
              <div 
                className="mt-3 text-base leading-8 text-slate-700 prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: pkg.description }}
              />
            ) : (
              <p className="mt-3 text-base leading-8 text-slate-700">
                The operator has not added a long description yet. Please check the tour schedule, reporting information, inclusions, exclusions, and fare variants before booking.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-lg border border-slate-200 bg-[#f7fbfb] p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black text-slate-950">
                <Bus className="h-5 w-5 text-[#1a6b7a]" />
                Fare and Base Price Options
              </h3>
              {pkg.variants.length ? (
                <div className="space-y-3">
                  {pkg.variants.map((variant) => {
                    const isStudent = pkg.is_student_package;
                    const primaryPrice = isStudent ? variant.student_price : variant.adult_price;
                    const weekendPrice = isStudent ? variant.weekend_student_price : variant.weekend_adult_price;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('select-variant', { detail: { variantId: variant.id } }));
                          const bookingEl = document.getElementById('booking');
                          if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:border-[#1a6b7a] cursor-pointer group"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-950 group-hover:text-[#1a6b7a] transition-colors leading-snug">{variant.title}</p>
                            {variant.transport_info ? (
                              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{variant.transport_info}</p>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-left sm:text-right border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0">
                            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-0">
                              <div className="text-sm font-black text-[#0f3d56]">
                                <span className="text-slate-500 font-semibold text-[10px] mr-1 uppercase tracking-wider">Wkday:</span>
                                ₹{currency(primaryPrice || 0)}
                              </div>
                              {(Number(weekendPrice) > 0 && Number(weekendPrice) !== Number(primaryPrice)) && (
                                <div className="text-sm font-black text-amber-700 sm:mt-0.5">
                                  <span className="text-amber-600/70 font-semibold text-[10px] mr-1 uppercase tracking-wider">Wkend:</span>
                                  ₹{currency(weekendPrice as any)}
                                </div>
                              )}
                            </div>
                            {!isStudent && (
                              <p className="text-[10px] font-bold text-slate-500 mt-1">
                                Child ₹{currency(variant.child_price)}
                                {(Number(variant.weekend_child_price) > 0 && Number(variant.weekend_child_price) !== Number(variant.child_price)) && (
                                  <span className="text-amber-600/70 ml-1">
                                    (Wkend: ₹{currency(variant.weekend_child_price as any)})
                                  </span>
                                )}
                              </p>
                            )}
                            {isStudent && (
                              <p className="text-[10px] font-bold text-slate-500 mt-1">
                                Student package rate
                              </p>
                            )}
                            <span className="hidden sm:inline-block mt-1 text-[9px] font-black uppercase tracking-wider text-[#1a6b7a] opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  No active fare variants are published for this package.
                </p>
              )}
            </div>

            <div className="grid gap-5">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-black text-slate-950">
                  <MapPin className="h-5 w-5 text-[#1a6b7a]" />
                  Main places covered
                </h3>
                {visitingPlaces.length ? (
                  <ul className="grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-2">
                    {visitingPlaces.slice(0, 8).map((place) => (
                      <li key={place} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{place}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    Visiting places are not published yet for this package.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-black text-slate-950">
                  <ShieldCheck className="h-5 w-5 text-[#1a6b7a]" />
                  Usually included
                </h3>
                {included.length ? (
                  <ul className="grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-2">
                    {included.slice(0, 6).map((item) => (
                      <li key={item} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    Package inclusions are not published yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {excluded.length ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-3 text-base font-black text-slate-950">Not included</h3>
              <ul className="grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-2">
                {excluded.slice(0, 8).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeBrochureUrl && (
            <div className="mt-6 rounded-xl border border-[#1a6b7a]/30 bg-[#eef8f6] p-5 md:flex md:items-center md:justify-between md:gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-[#1a6b7a] p-3 text-white">
                  <FileDown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">Official tour brochure</h3>
                  <p className="text-sm font-semibold text-slate-600">Download complete itinerary and package details as PDF.</p>
                </div>
              </div>
              <a
                href={activeBrochureUrl}
                onClick={handleDownloadBrochure}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1a6b7a] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#1a6b7a]/20 transition-all hover:-translate-y-0.5 hover:bg-[#13505c] hover:shadow-lg hover:shadow-[#1a6b7a]/30 uppercase tracking-wider md:mt-0"
              >
                📥 Download PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
