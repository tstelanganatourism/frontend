'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Mail, Phone, Search, ShieldCheck, Ship, Sparkles } from 'lucide-react';
import { FAQS } from './data';

export default function FAQClient() {
  const [openId, setOpenId] = useState('0-0');
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category);
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.trim().toLowerCase();
  const visibleFaqs = useMemo(
    () =>
      FAQS.map((category, catIdx) => ({
        ...category,
        questions: category.questions
          .map((faq, qIdx) => ({ ...faq, id: `${catIdx}-${qIdx}` }))
          .filter((faq) => !query || faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)),
      })).filter((category) => category.questions.length > 0),
    [query],
  );

  useEffect(() => {
    if (visibleFaqs.length === 0) return;

    let frame = 0;

    const updateActiveCategory = () => {
      const triggerLine = window.innerHeight * 0.38;
      const currentSection = visibleFaqs.reduce<string | null>((active, category) => {
        const section = document.getElementById(category.category);
        if (!section) return active;

        const { top } = section.getBoundingClientRect();
        return top <= triggerLine ? category.category : active;
      }, null);

      setActiveCategory(currentSection ?? visibleFaqs[0].category);
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveCategory);
    };

    updateActiveCategory();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [visibleFaqs]);

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <section className="relative overflow-hidden bg-[var(--color-brand-river)] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912203/slider4_rikfsq.jpg"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,22,34,0.92),rgba(15,61,86,0.75)),linear-gradient(0deg,rgba(15,61,86,0.94),rgba(15,61,86,0.45))]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-sand)] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Support center
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Papikondalu Tour FAQs
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              Fast answers for bookings, refunds, timings, boat facilities and Bhadrachalam travel support.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/12 p-4 shadow-2xl backdrop-blur-xl">
            <label htmlFor="faq-search" className="sr-only">
              Search FAQs
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="faq-search"
                type="search"
                value={searchQuery}
                placeholder="Search booking, refund, timing..."
                className="w-full rounded-xl border border-white/20 bg-white px-12 py-4 text-base font-medium text-[var(--color-brand-river)] outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-4 focus:ring-[var(--color-brand-sand)]/30"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-wider text-white/65">
              <span className="rounded-lg bg-white/10 px-2 py-2">Booking</span>
              <span className="rounded-lg bg-white/10 px-2 py-2">Journey</span>
              <span className="rounded-lg bg-white/10 px-2 py-2">Safety</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 px-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Topics</div>
            <div className="space-y-2">
              {FAQS.map((category) => {
                const isActive = activeCategory === category.category;
                return (
                  <button
                    key={category.category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.category);
                      document.getElementById(category.category)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full rounded-xl px-4 py-4 text-left transition-all duration-200 ${
                      isActive ? 'bg-[var(--color-brand-river)] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm font-bold">{category.category}</span>
                    <span className={`mt-1 block text-xs leading-5 ${isActive ? 'text-white/65' : 'text-slate-400'}`}>{category.summary}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          {visibleFaqs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--color-brand-river)]">No matching answers found</h2>
              <p className="mt-2 text-slate-500">Try a simpler keyword or contact our support team directly.</p>
            </div>
          ) : (
            visibleFaqs.map((category, catVisibleIdx) => (
              <div key={category.category} id={category.category} className="scroll-mt-24">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Section {catVisibleIdx + 1}</div>
                    <h2 className="mt-1 text-2xl font-bold text-[var(--color-brand-river)]">{category.category}</h2>
                  </div>
                  <Ship className="hidden h-7 w-7 text-[var(--color-brand-teal)] sm:block" />
                </div>

                <div className="space-y-3">
                  {category.questions.map((faq) => {
                    const isOpen = openId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                          isOpen ? 'border-[var(--color-brand-teal)]/30 shadow-xl' : 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                          onClick={() => setOpenId(isOpen ? '' : faq.id)}
                        >
                          <span className="text-base font-bold leading-7 text-[var(--color-brand-river)] md:text-lg">{faq.q}</span>
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-200 ${isOpen ? 'bg-[var(--color-brand-river)] text-white' : 'bg-slate-50 text-slate-500'}`}>
                            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </span>
                        </button>
                        <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden">
                            <div className="border-t border-slate-100 px-5 pb-6 pt-5 text-base leading-8 text-slate-600 md:px-6">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <a href="mailto:tsboattourismservices@gmail.com" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-[var(--color-brand-teal)] transition-colors group-hover:bg-[var(--color-brand-teal)] group-hover:text-white">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Email us</div>
                  <div className="mt-1 break-all text-lg font-bold text-[var(--color-brand-river)]">tsboattourismservices@gmail.com</div>
                </div>
              </div>
            </a>
            <a href="tel:+919542069573" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-[var(--color-brand-teal)] transition-colors group-hover:bg-[var(--color-brand-teal)] group-hover:text-white">
                  <Phone className="h-6 w-6" />
                </span>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Call helpline</div>
                  <div className="mt-1 text-lg font-bold text-[var(--color-brand-river)]">+91 95420 69573, +91 95731 96369</div>
                </div>
              </div>
            </a>
          </div>

          <div className="rounded-2xl bg-[var(--color-brand-river)] p-6 text-white shadow-2xl md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-[var(--color-brand-sand)]" />
                <div>
                  <h3 className="text-xl font-bold">Still choosing a package?</h3>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    We can help compare Papikondalu boat tour options, Bhadrachalam pickup timing and stay availability. Reporting time is 7:00 AM to 7:30 AM; please carry Aadhaar Xerox for every passenger.
                  </p>
                </div>
              </div>
              <Link href="/packages" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-sand)] px-6 py-3 text-sm font-bold text-[var(--color-brand-river)] transition-all duration-200 hover:-translate-y-1 hover:bg-white">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
