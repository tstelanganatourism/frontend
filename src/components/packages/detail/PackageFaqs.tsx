'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircleQuestion, ChevronDown, Sparkles } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface PackageFaqsProps {
  faqs: FAQ[];
}

export const PackageFaqs = ({ faqs }: PackageFaqsProps) => {
  const [openId, setOpenId] = useState<number | null>(null);
  if (!faqs.length) return null;

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faqs" className="scroll-mt-[140px] my-8 sm:my-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        
        {/* Header section with minimal bold number indicator */}
        <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#0d6e75]">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Guided Travel Answers</span>
            </span>
            <h2 className="mt-2.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Frequently Answered <span className="text-[#0d6e75]">Questions</span>
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm font-semibold leading-relaxed text-slate-500">
              Quick answers about boarding logistics, food menus, child pricing, weather contingencies, and travel coordination.
            </p>
          </div>

          {/* Minimal Clean Text Indicator (Bold green/blue number & normal text) */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-2">
            <span className="text-3xl lg:text-4xl font-black text-[#0d6e75] tracking-tight leading-none">
              {faqs.length}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Questions
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Answered
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Accordion list */}
        <div className="grid gap-3.5 bg-slate-50/50 p-4 sm:p-6">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-xl border transition-all duration-200 shadow-2xs ${
                  isOpen
                    ? 'border-[#0d6e75] bg-white ring-2 ring-[#0d6e75]/10 shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#0d6e75]/40 hover:bg-slate-50/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left focus:outline-none sm:px-5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold transition-colors ${
                      isOpen
                        ? 'bg-[#0d6e75] text-white shadow-md shadow-teal-900/20'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <MessageCircleQuestion className="h-4.5 w-4.5" />
                    </span>
                    <span className={`text-sm sm:text-base font-black leading-snug transition-colors ${
                      isOpen ? 'text-[#0d6e75]' : 'text-slate-900 hover:text-[#0d6e75]'
                    }`}>
                      {faq.question}
                    </span>
                  </div>

                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isOpen
                      ? 'rotate-180 border-[#0d6e75] bg-[#0d6e75] text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-[#0d6e75]/40 hover:text-[#0d6e75]'
                  }`}>
                    <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 bg-teal-50/30 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5">
                        <div className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold leading-relaxed text-slate-700">
                          <Sparkles className="h-4 w-4 text-[#0d6e75] shrink-0 mt-0.5" />
                          <p className="max-w-4xl leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
