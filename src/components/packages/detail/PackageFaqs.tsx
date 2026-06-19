'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

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
    <section id="faqs" className="scroll-mt-[170px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[#1a6b7a]">
          <HelpCircle className="h-3.5 w-3.5" />
          Guided Answers
        </span>
        <h2 className="mt-3 text-3xl font-black text-[#0f3d56] tracking-tight md:text-4xl">
          Frequently Answered Questions
        </h2>
        <p className="mt-2 text-slate-500 font-semibold text-sm">
          Everything you need to know about the logistics, food, kids policies, and river regulations.
        </p>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl border border-[#dfe8e2]/60 bg-white p-6 md:p-8 shadow-[0_8px_28px_rgba(15,61,86,0.03)]">
        <div className="divide-y divide-slate-100">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="py-4.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 text-left focus:outline-none"
                >
                  <span className="text-base font-black leading-7 text-[#0f3d56] transition-colors hover:text-[#1a6b7a]">
                    {faq.question}
                  </span>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isOpen
                      ? 'rotate-180 border-[#1a6b7a] bg-[#1a6b7a] text-white shadow-md'
                      : 'border-[#cde5df] bg-[#eaf8f5] text-[#0f3d56] hover:bg-[#d9f0eb]'
                  }`}>
                    <ChevronDown className="h-5 w-5 stroke-[2.5]" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-sm font-semibold leading-8 text-slate-500 max-w-3xl">
                        {faq.answer}
                      </p>
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
