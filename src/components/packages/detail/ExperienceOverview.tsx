'use client';

import React from 'react';
import {
  Bus,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileDown,
  Home,
  MapPin,
  Plus,
  ShieldCheck,
  Ship,
  Sparkles,
  Utensils,
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
  has_transport?: boolean;
  transport_options?: Array<{
    id: number;
    type: 'SHARED' | 'SEPARATE_VEHICLE';
    title: string;
    capacity?: number;
    adult_price?: number | string | null;
    child_price?: number | string | null;
    weekend_adult_price?: number | string | null;
    weekend_child_price?: number | string | null;
    student_price?: number | string | null;
    weekend_student_price?: number | string | null;
    fixed_price?: number | string | null;
    weekend_fixed_price?: number | string | null;
  }>;
  has_refreshments?: boolean;
  refreshment_adult_price?: number | string | null;
  refreshment_child_price?: number | string | null;
  refreshment_student_price?: number | string | null;
  has_food_option?: boolean;
  food_adult_price?: number | string | null;
  food_child_price?: number | string | null;
  food_student_price?: number | string | null;
  extras?: any[];
}

interface ExperienceOverviewProps {
  pkg: PackageDetail;
  durationLabel: string;
}

const currency = (value: number | string) => Number(value || 0).toLocaleString('en-IN');

export const ExperienceOverview = ({ pkg, durationLabel }: ExperienceOverviewProps) => {
  const [selectedVariantId, setSelectedVariantId] = React.useState<number | null>(pkg.variants[0]?.id ?? null);

  React.useEffect(() => {
    const handleVariantSelect = (e: Event) => {
      const customEv = e as CustomEvent<{ variantId: number }>;
      if (customEv.detail?.variantId) {
        setSelectedVariantId(customEv.detail.variantId);
      }
    };
    window.addEventListener('select-variant', handleVariantSelect);
    return () => window.removeEventListener('select-variant', handleVariantSelect);
  }, []);

  const visitingPlaces = (pkg.highlights || []).map((item) => item.title || item.label).filter(Boolean);
  const included = (pkg.inclusions || []).map((item) => item.label || item.title).filter(Boolean);
  const excluded = (pkg.exclusions || []).map((item) => item.label || item.title).filter(Boolean);
  const primaryBoarding = pkg.boarding_points?.[0];
  const lowestFare = pkg.variants.length
    ? Math.min(...pkg.variants.map((variant) => Number((pkg.is_student_package ? variant.student_price : variant.adult_price) || 0)).filter(Boolean))
    : 0;
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
    <section id="overview" className="scroll-mt-[135px] sm:scroll-mt-[160px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-amber-500/5 p-5 md:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0d6e75]">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Trip at a Glance
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Important Information Before Booking
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
            Route map, timing schedules, inclusion details and custom add-on fares are shown below. Compare package options to select the best fit.
          </p>
        </div>

        <div className="p-5 md:p-7">
          {/* Quick Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <Clock className="mb-2.5 h-5 w-5 text-[#0d6e75]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{durationLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <MapPin className="mb-2.5 h-5 w-5 text-[#0d6e75]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporting Point</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900 leading-tight">{primaryBoarding?.title || 'Confirmed after booking'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <Ship className="mb-2.5 h-5 w-5 text-[#0d6e75]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience Type</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{pkg.type === 'TOUR' ? 'River cruise package' : 'Sightseeing tour'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <CircleDollarSign className="mb-2.5 h-5 w-5 text-[#0d6e75]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lowest Fare</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{lowestFare ? `₹${currency(lowestFare)} / Person` : 'Check live fare'}</p>
            </div>
          </div>

          {/* Description Block */}
          <div className="mt-6 rounded-xl border border-slate-100 bg-[#fafaf8]/50 p-5">
            <h3 className="text-base font-black text-slate-950">About this package</h3>
            {pkg.description ? (
              <div 
                className="mt-3 text-sm leading-relaxed text-slate-650 prose prose-slate max-w-none prose-sm"
                dangerouslySetInnerHTML={{ __html: pkg.description }}
              />
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Please check the tour schedule, reporting details, inclusions, exclusions, and fare variations below for complete trip details.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 items-start">
            {/* Left: Package Price Categories & Fares */}
            <div className="rounded-2xl border border-slate-200 bg-[#fbfdfd] p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-200/80 pb-3">
                <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
                  <Bus className="h-5 w-5 text-[#0d6e75]" />
                  Package Price Categories &amp; Fares
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0d6e75] bg-[#0d6e75]/10 px-2.5 py-1 rounded-full">
                  Verified Rates
                </span>
              </div>

              {pkg.variants.length ? (
                <div className="space-y-4">
                  {pkg.variants.map((variant) => {
                    const isStudent = pkg.is_student_package;
                    const primaryPrice = isStudent ? variant.student_price : variant.adult_price;
                    const weekendPrice = isStudent ? variant.weekend_student_price : variant.weekend_adult_price;
                    const isSelected = selectedVariantId === variant.id;

                    const lowerTitle = variant.title.toLowerCase();
                    const VariantIcon = lowerTitle.includes('train') || lowerTitle.includes('sleeper') 
                      ? Bus
                      : lowerTitle.includes('bus') || lowerTitle.includes('coach') || lowerTitle.includes('ac')
                        ? Bus
                        : lowerTitle.includes('stay') || lowerTitle.includes('hut') || lowerTitle.includes('resort')
                          ? Home
                          : Ship;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          window.dispatchEvent(new CustomEvent('select-variant', { detail: { variantId: variant.id } }));
                        }}
                        className={`w-full rounded-2xl p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? 'border-2 border-[#0d6e75] bg-white shadow-md ring-2 ring-[#0d6e75]/15'
                            : 'border border-slate-200 bg-white hover:border-[#0d6e75]/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col gap-3.5">
                          {/* Header: Title & Selected Badge */}
                          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isSelected ? 'bg-[#0d6e75] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#0d6e75]/10 group-hover:text-[#0d6e75]'
                              }`}>
                                <VariantIcon className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0d6e75] transition-colors">{variant.title}</h4>
                                {variant.transport_info && (
                                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{variant.transport_info}</p>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#0d6e75] px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
                                ✓ Selected
                              </span>
                            )}
                          </div>

                          {/* Fare Breakdown Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                            {/* Weekday Rates */}
                            <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                Weekday Fares
                              </span>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-slate-700 font-bold">
                                  <span className="text-[11px]">{isStudent ? 'Student:' : 'Adult:'}</span>
                                  <span className="text-sm font-black text-[#0d6e75]">₹{currency(primaryPrice || 0)}</span>
                                </div>
                                {!isStudent && variant.child_price && Number(variant.child_price) > 0 && (
                                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium border-t border-slate-200/50 pt-1">
                                    <span>Child:</span>
                                    <span className="font-bold text-slate-700">₹{currency(variant.child_price)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Weekend / Peak Rates */}
                            <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100">
                              <span className="block text-[9px] font-black uppercase tracking-widest text-amber-700/80 mb-1.5">
                                Weekend / Peak
                              </span>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-slate-700 font-bold">
                                  <span className="text-[11px]">{isStudent ? 'Student:' : 'Adult:'}</span>
                                  <span className="text-sm font-black text-amber-700">
                                    ₹{currency(weekendPrice && Number(weekendPrice) > 0 ? weekendPrice : primaryPrice || 0)}
                                  </span>
                                </div>
                                {!isStudent && (
                                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium border-t border-amber-200/50 pt-1">
                                    <span>Child:</span>
                                    <span className="font-bold text-slate-700">
                                      ₹{currency(variant.weekend_child_price && Number(variant.weekend_child_price) > 0 ? variant.weekend_child_price : variant.child_price || 0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-black uppercase text-amber-800 tracking-wider">
                  No active fare options published for this package.
                </p>
              )}
            </div>

            {/* Right: Optional Add-ons & Transport breakdown */}
            {(pkg.has_transport || pkg.has_refreshments || pkg.has_food_option || (pkg.extras && pkg.extras.length > 0)) ? (
              <div className="rounded-2xl border border-slate-200 bg-[#fbfdfd] p-5 md:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
                    <Sparkles className="h-5 w-5 text-[#0d6e75]" />
                    Optional Transport, Stay &amp; Meals Fares
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Add-ons
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Transport Options */}
                  {pkg.has_transport && pkg.transport_options && pkg.transport_options.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                        <Car className="h-4 w-4 text-[#0d6e75] shrink-0" />
                        <span>Transport Options</span>
                      </div>
                      <div className="space-y-2">
                        {pkg.transport_options.map((opt) => (
                          <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 first:border-t-0 first:pt-0">
                            <span className="text-[11px] font-bold text-slate-800 leading-snug">{opt.title}</span>
                            <span className="shrink-0 text-[11px] font-black text-[#0d6e75] bg-[#0d6e75]/10 px-2.5 py-0.5 rounded-lg border border-[#0d6e75]/15 self-start sm:self-auto">
                              {opt.type === 'SHARED'
                                ? `₹${currency(opt.adult_price || 0)} / adult`
                                : `₹${currency(opt.fixed_price || 0)} / vehicle`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fresh-Up Stay Option */}
                  {pkg.has_refreshments && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                        <Home className="h-4 w-4 text-[#0d6e75] shrink-0" />
                        <span>Fresh-Up Room Stay</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-bold text-slate-700">
                        <span>Standard Room Rate:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black text-[#0d6e75] bg-[#0d6e75]/10 px-2 py-0.5 rounded-lg border border-[#0d6e75]/15">
                            Adult ₹{currency(pkg.refreshment_adult_price || 0)}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                            Child ₹{currency(pkg.refreshment_child_price || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Food Meals Option */}
                  {pkg.has_food_option && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                        <Utensils className="h-4 w-4 text-[#0d6e75] shrink-0" />
                        <span>Catering &amp; Meals Package</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-bold text-slate-700">
                        <span>Meals Tariff:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black text-[#0d6e75] bg-[#0d6e75]/10 px-2 py-0.5 rounded-lg border border-[#0d6e75]/15">
                            Adult ₹{currency(pkg.food_adult_price || 0)}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                            Child ₹{currency(pkg.food_child_price || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extras */}
                  {pkg.extras && pkg.extras.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
                        <Plus className="h-4 w-4 text-[#0d6e75] shrink-0" />
                        <span>Optional Extra Services</span>
                      </div>
                      <div className="space-y-2 text-[11px]">
                        {pkg.extras.map((ex: any) => (
                          <div key={ex.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="font-bold text-slate-800 truncate">{ex.title}</span>
                            <span className="shrink-0 text-[11px] font-black text-[#0d6e75] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              ₹{currency(ex.adult_price || ex.student_price || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Bottom Section: Main Places Covered & Inclusions side-by-side */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Main Places Covered */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xs">
                <h3 className="mb-4 flex items-center gap-2 text-base font-black text-slate-950">
                  <MapPin className="h-5 w-5 text-[#0d6e75]" />
                  Main Places Covered
                </h3>
                {visitingPlaces.length ? (
                  <ul className="grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-2">
                    {visitingPlaces.map((place) => (
                      <li key={place} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-100/80">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="truncate">{place}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-amber-250 bg-amber-50/40 px-4 py-3 text-xs font-semibold text-amber-800">
                    Sightseeing places are not published yet.
                  </p>
                )}
              </div>

              {/* Usually Included */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xs">
                <h3 className="mb-4 flex items-center gap-2 text-base font-black text-slate-950">
                  <ShieldCheck className="h-5 w-5 text-[#0d6e75]" />
                  Usually Included
                </h3>
                {included.length ? (
                  <ul className="grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-2">
                    {included.map((item) => (
                      <li key={item} className="flex items-center gap-2 rounded-xl bg-emerald-50/60 px-3 py-2.5 border border-emerald-100/80 text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                    Inclusion list will be confirmed upon operator slot confirmation.
                  </p>
                )}
              </div>
            </div>
          </div>

          {excluded.length ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/30 p-5">
              <h3 className="mb-3 text-base font-black text-slate-950">Not included / Exclusions</h3>
              <ul className="grid gap-2.5 text-xs font-semibold text-slate-600 sm:grid-cols-2">
                {excluded.slice(0, 8).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-350" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeBrochureUrl && (
            <div className="mt-6 rounded-xl border border-[#0d6e75]/20 bg-[#fafaf8] p-5 sm:flex sm:items-center sm:justify-between sm:gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="rounded-lg bg-[#0d6e75] p-3 text-white">
                  <FileDown className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Official tour brochure</h3>
                  <p className="text-xs font-medium text-slate-500">Download complete travel itinerary and package fare structure as PDF.</p>
                </div>
              </div>
              <a
                href={activeBrochureUrl}
                onClick={handleDownloadBrochure}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d6e75] px-5 py-3 text-[11px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0b5c62] uppercase tracking-wider sm:mt-0"
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
