'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import PremiumSelect from '@/components/ui/PremiumSelect';
import * as DialogPrimitive from "@radix-ui/react-dialog";

// ─── Verhoeff Checksum (client-side Aadhaar validation) ──────────────────────
const _d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
const _p = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
function isValidAadhaar(num: string): boolean {
  if (!num || num.length !== 12 || !/^\d{12}$/.test(num)) return false;
  if (num[0] === '0' || num[0] === '1') return false;
  let c = 0;
  const digits = num.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) c = _d[c][_p[i % 8][digits[i]]];
  return c === 0;
}

interface PassengerInput {
  full_name: string;
  age: number | '';
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  phone: string;
  aadhaar: string;
  relationship: string;
  is_primary: boolean;
}

interface CheckoutPassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passengers: PassengerInput[]) => Promise<void>;
  adults: number;
  children: number;
  isProcessing: boolean;
  targetType?: 'package' | 'room';
}

export default function CheckoutPassengerModal({ isOpen, onClose, onSubmit, adults, children, isProcessing, targetType = 'package' }: CheckoutPassengerModalProps) {
  const totalPassengers = adults + children;
  const [passengers, setPassengers] = useState<PassengerInput[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial: PassengerInput[] = Array.from({ length: totalPassengers }).map((_, i) => ({
        full_name: '',
        age: '',
        gender: '',
        phone: '',
        aadhaar: '',
        relationship: i === 0 ? 'self' : '',
        is_primary: i === 0,
      }));
      setPassengers(initial);
    }
  }, [isOpen, totalPassengers]);

  if (!isOpen) return null;

  const handleChange = (index: number, field: keyof PassengerInput, value: string | number | boolean) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms & Conditions before proceeding.");
      return;
    }
    await onSubmit(passengers);
  };

  if (typeof document === 'undefined') return null;
  if (!isOpen) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(val) => !val && onClose()} modal={!isProcessing}>
      <DialogPrimitive.Portal>
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
          <DialogPrimitive.Overlay className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
          
          <DialogPrimitive.Content 
            className="relative w-full sm:max-w-2xl h-[92dvh] sm:max-h-[90vh] sm:h-auto overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col outline-none"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">Passenger Details</DialogPrimitive.Title>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a6b7a]/10 text-[#1a6b7a]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">Passenger Details</h2>
                  <p className="text-xs font-semibold text-slate-500">Please provide details for {totalPassengers} passengers.</p>
                </div>
              </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 scrollbar-thin flex-1">
          <form id="passenger-form" onSubmit={handleFormSubmit} className="space-y-8">
            {passengers.map((p, i) => {
              const isChild = i >= adults;
              return (
                <div key={i} className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#1a6b7a]/30 hover:shadow-md">
                  <p className="mb-4 text-xs font-black uppercase tracking-wider text-[#1a6b7a]">
                    {targetType === 'room' ? `Guest Card ${i + 1}` : (isChild ? `Child Card ${i - adults + 1}` : `Adult Card ${i + 1}`)}
                    {i === 0 && <span className="ml-2 rounded-full bg-[#1a6b7a]/10 px-2 py-0.5 text-[10px] text-[#1a6b7a]">Primary Contact</span>}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Full Name</label>
                      <input
                        type="text"
                        required
                        disabled={isProcessing}
                        value={p.full_name}
                        onChange={(e) => handleChange(i, 'full_name', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
                        placeholder="Enter full name as per ID"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Age</label>
                      <input
                        type="number"
                        required
                        min={targetType === 'package' ? (isChild ? 4 : 11) : 0}
                        max={targetType === 'package' && isChild ? 10 : 150}
                        disabled={isProcessing}
                        value={p.age}
                        onChange={(e) => handleChange(i, 'age', e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
                        placeholder={targetType === 'package' ? (isChild ? "4-10" : "11+") : "Age"}
                      />
                    </div>

                    <div className="space-y-1">
                      <PremiumSelect
                        label="Gender"
                        value={p.gender}
                        disabled={isProcessing}
                        onChange={(val) => handleChange(i, 'gender', val)}
                        options={[
                          { value: 'MALE', label: 'Male' },
                          { value: 'FEMALE', label: 'Female' },
                          { value: 'OTHER', label: 'Other' }
                        ]}
                        placeholder="Select gender"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Aadhaar Number
                        {(typeof p.age === 'number' && p.age <= 10) && (
                          <span className="ml-1 text-[10px] font-semibold text-slate-400">(Optional for children &le; 10)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={!(typeof p.age === 'number' && p.age <= 10)}
                        pattern="[0-9]{12}"
                        title="12 digit Aadhaar number"
                        disabled={isProcessing}
                        value={p.aadhaar}
                        onChange={(e) => handleChange(i, 'aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50 ${
                          p.aadhaar && p.aadhaar.length === 12 && !isValidAadhaar(p.aadhaar)
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-slate-300'
                        }`}
                        placeholder="12 digit number"
                      />
                      {p.aadhaar && p.aadhaar.length === 12 && !isValidAadhaar(p.aadhaar) && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Invalid Aadhaar number (checksum failed)</p>
                      )}
                    </div>

                    {!isChild && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">
                          Contact Number
                          {(i !== 0 || (typeof p.age === 'number' && p.age <= 10)) && (
                            <span className="ml-1 text-[10px] font-semibold text-slate-400">(Optional)</span>
                          )}
                        </label>
                        <input
                          type="tel"
                          required={i === 0 && !(typeof p.age === 'number' && p.age <= 10)}
                          disabled={isProcessing}
                          value={p.phone}
                          onChange={(e) => handleChange(i, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
                          placeholder="10 digit mobile number"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-blue-800">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
            <div className="text-xs font-semibold leading-relaxed space-y-1.5">
              <p>• Ensure all details match government IDs exactly. Original ID proof will be verified before boarding.</p>
              <p>• Child tickets are strictly for children below the specified age limit. Age proof is mandatory.</p>
              <p>• Cancellation requests are only accepted if made at least a week before the travel date, subject to a 35% cancellation fee.</p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isProcessing}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1a6b7a] focus:ring-[#1a6b7a] disabled:opacity-50"
            />
            <label htmlFor="terms-checkbox" className="text-xs font-semibold text-slate-600 leading-relaxed cursor-pointer">
              I acknowledge and agree to the <a href="/terms" target="_blank" className="text-[#1a6b7a] underline hover:text-[#13505c]">Terms & Conditions</a>, <a href="/faq" target="_blank" className="text-[#1a6b7a] underline hover:text-[#13505c]">Cancellation Policy</a>, and confirm that all passenger details provided are accurate and match their government-issued ID proofs.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            form="passenger-form"
            type="submit"
            disabled={
              isProcessing ||
              !agreedToTerms ||
              !passengers.every((p, i) => {
                const isChild = i >= adults;
                const isChildAge = typeof p.age === 'number' && p.age <= 10;
                const nameOk = p.full_name.trim() !== '';
                const isPackage = targetType === 'package';
                const ageOk = typeof p.age === 'number' && (isPackage ? (isChild ? (p.age >= 4 && p.age <= 10) : p.age >= 11) : (p.age >= 0));
                const genderOk = p.gender !== '';
                const aadhaarOk = isChildAge
                  ? (!p.aadhaar || p.aadhaar.length === 0 || isValidAadhaar(p.aadhaar))
                  : (p.aadhaar.length === 12 && isValidAadhaar(p.aadhaar));
                // Phone is optional if it's a child package, OR if they are <= 10 years old (even if it's a room), OR if they are not the primary contact.
                const phoneOk = isChild || isChildAge || (i !== 0 && (!p.phone || p.phone.trim().length === 0)) || (p.phone && p.phone.trim().length === 10);
                
                // For the primary contact (Guest 1), if they are a child, we should still ensure someone in the group has a phone, but we'll let it pass here.
                return nameOk && ageOk && genderOk && aadhaarOk && phoneOk;
              })
            }
            className="rounded-lg bg-[#1a6b7a] px-8 py-2.5 text-sm font-black text-white shadow-md hover:bg-[#13505c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Proceed to Payment
          </button>
        </div>

        {/* Processing Overlay inside modal to prevent clicking */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-[#1a6b7a] mb-4" />
            <p className="font-black text-lg text-slate-800">Processing Payment...</p>
            <p className="text-sm font-semibold text-slate-600 text-center max-w-xs mt-2">
              Please do not close this window or press back.
            </p>
          </div>
        )}
      </DialogPrimitive.Content>
      </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
