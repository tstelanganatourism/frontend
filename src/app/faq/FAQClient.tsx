'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Mail, Phone, Search, ShieldCheck } from 'lucide-react';
import PublicPageHeader from '@/components/layout/PublicPageHeader';
import { FAQS } from './data';

export default function FAQClient() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    '0-0': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const query = searchQuery.trim().toLowerCase();

  const categoriesList = useMemo(() => {
    return ['ALL', ...FAQS.map(c => c.category)];
  }, []);

  const visibleFaqs = useMemo(() => {
    return FAQS
      .filter((cat) => selectedCategory === 'ALL' || cat.category.toLowerCase() === selectedCategory.toLowerCase())
      .map((category, catIdx) => ({
        ...category,
        questions: category.questions
          .map((faq, qIdx) => ({ ...faq, id: `${catIdx}-${qIdx}` }))
          .filter((faq) => 
            !query || 
            faq.q.toLowerCase().includes(query) || 
            faq.a.toLowerCase().includes(query)
          ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [query, selectedCategory]);

  const toggleOpen = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="bg-[#eaf7f6] selection:bg-teal-100 selection:text-teal-900">
      <PublicPageHeader
        eyebrow="Support Center"
        title="Papikondalu Tour FAQs"
        description="Quick answers for bookings, refunds, timings, boat facilities, and Bhadrachalam travel."
        icon={ShieldCheck}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              placeholder="Search booking, refund, timing..."
              className="w-full rounded-md border border-slate-200 bg-white px-12 py-3.5 text-base font-semibold text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1598a1] focus:ring-4 focus:ring-[#1598a1]/15"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0f3d56] text-white shadow-sm'
                      : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? 'All Questions' : cat}
                </button>
              );
            })}
          </div>
        </div>
      </PublicPageHeader>

      {/* Main Single Page Layout Content */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        
        {visibleFaqs.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-[0_4px_25px_rgba(15,61,86,0.04)]">
            <h2 className="text-2xl font-bold text-[#1e468a]">No matching answers found</h2>
            <p className="mt-2 text-slate-500 font-medium">Try a simpler keyword or reach out to our team below.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {visibleFaqs.map((category) => (
              <div key={category.category} className="space-y-5">
                
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="h-2 w-2 rounded-full bg-[#1598a1]" />
                  <h2 className="text-xl font-black text-[#1e468a] tracking-tight">{category.category}</h2>
                  <span className="text-xs font-bold text-slate-400">({category.questions.length})</span>
                </div>

                {/* Accordions */}
                <div className="space-y-4">
                  {category.questions.map((faq) => {
                    const isOpen = !!openIds[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className={`overflow-hidden rounded-md border bg-white transition-all duration-300 ${
                          isOpen 
                            ? 'border-[#1598a1]/35 shadow-[0_8px_30px_rgba(15,61,86,0.08)]'
                            : 'border-slate-100 hover:border-slate-200 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                          onClick={() => toggleOpen(faq.id)}
                        >
                          <span className="text-[17px] font-bold leading-7 text-[#1e468a] tracking-tight">{faq.q}</span>
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md transition-all duration-300 ${isOpen ? 'bg-[#0f3d56] text-white' : 'bg-slate-50 text-slate-500'}`}>
                            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </span>
                        </button>
                        
                        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="border-t border-slate-100 px-6 pb-6 pt-5 text-[15px] leading-relaxed text-slate-600 md:px-7">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Dynamic Support Contact Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <a href="mailto:tstelanganatourism@gmail.com" className="group relative overflow-hidden rounded-md bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-150/60 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,61,86,0.08)] hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1598a1]" />
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f0f7f8] text-[#1598a1] transition-colors group-hover:bg-[#1598a1] group-hover:text-white">
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Booking Desk</div>
                <div className="mt-2 text-[16px] font-extrabold text-[#1e468a] break-all">tstelanganatourism@gmail.com</div>
              </div>
            </div>
          </a>

          <a href="tel:+919951369573" className="group relative overflow-hidden rounded-md bg-white p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-150/60 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,61,86,0.08)] hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1598a1]" />
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#e9f7f7] text-[#1598a1] transition-colors group-hover:bg-[#1598a1] group-hover:text-white">
                <Phone className="h-6 w-6" />
              </span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Call Help Center</div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <span className="text-sm font-extrabold text-[#0f3d56]">+91 99513 69573</span>
                  <span className="text-sm font-semibold text-slate-500">+91 77801 19268</span>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Footer Support Banner */}
        <div className="mt-8 rounded-md bg-[#0f3d56] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-[#8eecee]" />
              <div>
                <h3 className="text-xl font-bold tracking-tight">Still choosing a package?</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                  Compare Papikondalu boat cruise options and stay availabilities with our agents. Reporting time is 7:00 AM to 7:30 AM (Aadhaar Xerox required).
                </p>
              </div>
            </div>
            <Link href="/packages" className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#1598a1] px-6 py-3 text-sm font-black text-white transition-all hover:bg-[#117f87] hover:-translate-y-0.5 shadow-md">
              View Packages
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
