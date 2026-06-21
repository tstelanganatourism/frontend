'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X as CloseIcon } from 'lucide-react';
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface BusWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BusWarningModal({ isOpen, onClose, onConfirm }: BusWarningModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-sm" />

        {/* Modal Container wrapper for positioning */}
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
          <DialogPrimitive.Content 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 outline-none z-10 max-h-[90dvh] flex flex-col overflow-hidden"
            aria-describedby="bus-warning-description"
          >
            <DialogPrimitive.Title className="sr-only">Bus Selection Warning</DialogPrimitive.Title>
            <DialogPrimitive.Description id="bus-warning-description" className="sr-only">
              Important notice regarding bus and Tata Magic vehicle allocation based on passenger count.
            </DialogPrimitive.Description>
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable container for the content inside the modal */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin">
              {/* Header Icon */}
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 shrink-0">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h3 className="text-lg md:text-xl font-black text-slate-800 text-center mb-6 shrink-0">
                ముఖ్య గమనిక / Important Notice
              </h3>

              {/* Content in Two Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-1">
                {/* Telugu Column */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
                  <div className="text-left font-black text-[#1a6b7a] mb-3 border-b border-slate-200/60 pb-1.5 text-xs">
                    📢 ముఖ్య గమనిక
                  </div>
                  <ul className="space-y-3 text-xs text-slate-600 leading-relaxed text-left">
                    <li className="flex gap-2">
                      <span className="shrink-0">🚌</span>
                      <span>కనీస ప్రయాణికుల సంఖ్య పూర్తికాక బస్సు ఫుల్ కాకపోతే, టూర్ను టాటా మ్యాజిక్ / 7 సీటర్ వాహనంలో నిర్వహించబడుతుంది.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">💰</span>
                      <span>బస్సు చార్జీ మరియు టాటా మ్యాజిక్ చార్జీ మధ్య ఉన్న అదనపు మొత్తాన్ని ప్రయాణికులకు రిఫండ్ చేయబడుతుంది.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">✅</span>
                      <span>బస్సు పూర్తిగా నిండిన సందర్భంలో మాత్రమే బస్సు టికెట్ కన్ఫర్మ్ చేయబడుతుంది.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">⚠️</span>
                      <span>ప్రయాణికుల సంఖ్యను బట్టి వాహనం మార్చే హక్కు యాజమాన్యానికి ఉంటుంది.</span>
                    </li>
                  </ul>
                </div>

                {/* English Column */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
                  <div className="text-left font-black text-[#1a6b7a] mb-3 border-b border-slate-200/60 pb-1.5 text-xs">
                    📢 Important Note
                  </div>
                  <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                    <li className="flex gap-2">
                      <span className="shrink-0">🚌</span>
                      <span>If the minimum passenger count is not met and the bus is not fully occupied, the tour will be operated using a Tata Magic / 7-Seater vehicle.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">💰</span>
                      <span>The difference between the bus fare and the Tata Magic fare will be refunded to passengers.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">✅</span>
                      <span>Bus tickets will be confirmed only when sufficient passengers are available to operate the bus.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0">⚠️</span>
                      <span>Management reserves the right to change the vehicle based on passenger occupancy.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel / రద్దు చేయి
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#1a6b7a] hover:bg-[#15535e] shadow-lg shadow-[#1a6b7a]/10 transition-all active:scale-95"
                >
                  Agree & Proceed / అంగీకరిస్తున్నాను
                </button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
