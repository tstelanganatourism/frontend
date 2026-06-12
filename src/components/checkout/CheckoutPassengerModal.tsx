'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Users, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import PremiumSelect from '@/components/ui/PremiumSelect';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAuthStore } from '@/stores/authStore';

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
  student_class?: string;
}

interface CheckoutPassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passengers: PassengerInput[], quickBooking?: boolean, customerEmail?: string) => Promise<void>;
  adults: number;
  children: number;
  isProcessing: boolean;
  targetType?: 'package' | 'room';
  isStudentPackage?: boolean;
}

export default function CheckoutPassengerModal({ isOpen, onClose, onSubmit, adults, children, isProcessing, targetType = 'package', isStudentPackage = false }: CheckoutPassengerModalProps) {
  const totalPassengers = adults + children;
  const { user } = useAuthStore();
  const isAgentOrAdmin = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [passengers, setPassengers] = useState<PassengerInput[]>([]);
  const [passengerMode, setPassengerMode] = useState<'full' | 'quick'>('full');
  const [quickPassenger, setQuickPassenger] = useState<PassengerInput>({
    full_name: '',
    age: '',
    gender: '',
    phone: '',
    aadhaar: '',
    relationship: 'self',
    is_primary: true,
    student_class: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAadhaarConsent, setAgreedToAadhaarConsent] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      let restoredPassengers: PassengerInput[] = [];
      let isRestored = false;
      
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem('last_checkout_passengers');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === totalPassengers) {
              restoredPassengers = parsed;
              isRestored = true;
            }
          } catch (e) {
            console.error("Failed to parse restored passengers", e);
          }
        }
      }

      if (isRestored && restoredPassengers.length > 0) {
        setPassengers(restoredPassengers);
        const savedQuick = sessionStorage.getItem('last_checkout_quick_booking') === 'true';
        setPassengerMode(savedQuick ? 'quick' : 'full');
        if (savedQuick) {
          setQuickPassenger(restoredPassengers[0]);
        }
        const savedEmail = sessionStorage.getItem('last_checkout_email') || '';
        setCustomerEmail(savedEmail);
        setAgreedToTerms(true);
        setAgreedToAadhaarConsent(true);
      } else {
        const initial: PassengerInput[] = Array.from({ length: totalPassengers }).map((_, i) => ({
          full_name: '',
          age: isStudentPackage ? 0 : '',
          gender: '',
          phone: '',
          aadhaar: '',
          relationship: i === 0 ? 'self' : '',
          is_primary: i === 0,
          student_class: '',
        }));
        setPassengers(initial);
        setPassengerMode('full');
        setQuickPassenger({
          full_name: '',
          age: isStudentPackage ? 0 : '',
          gender: '',
          phone: '',
          aadhaar: '',
          relationship: 'self',
          is_primary: true,
          student_class: '',
        });
        setAgreedToTerms(false);
        setAgreedToAadhaarConsent(false);
        setCustomerEmail('');
      }
    }
  }, [isOpen, totalPassengers, isStudentPackage]);

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
    if (!agreedToAadhaarConsent) {
      toast.error("Please provide your consent for Aadhaar verification.");
      return;
    }

    if (passengerMode === 'quick') {
      const passengersPayload: PassengerInput[] = [
        {
          ...quickPassenger,
          age: isStudentPackage ? 0 : (quickPassenger.age || 25),
          aadhaar: quickPassenger.aadhaar || '',
          phone: quickPassenger.phone || '',
          student_class: isStudentPackage ? (quickPassenger.student_class || 'General') : undefined,
        }
      ];
      if (isStudentPackage) {
        for (let i = 1; i < adults; i++) {
          passengersPayload.push({
            full_name: 'TBA (Student)',
            age: 0,
            gender: 'MALE',
            phone: '',
            aadhaar: '',
            relationship: '',
            is_primary: false,
            student_class: quickPassenger.student_class || 'General',
          });
        }
      } else {
        for (let i = 1; i < adults; i++) {
          passengersPayload.push({
            full_name: 'TBA (Guest)',
            age: 25,
            gender: 'MALE',
            phone: '',
            aadhaar: '',
            relationship: '',
            is_primary: false,
          });
        }
        for (let i = 0; i < children; i++) {
          passengersPayload.push({
            full_name: 'TBA (Guest)',
            age: 7,
            gender: 'MALE',
            phone: '',
            aadhaar: '',
            relationship: '',
            is_primary: false,
          });
        }
      }
      await onSubmit(passengersPayload, true, customerEmail.trim() || undefined);
    } else {
      // Clean up ages for student package
      const cleanPassengers = passengers.map(p => ({
        ...p,
        age: isStudentPackage ? 0 : p.age,
      }));
      await onSubmit(cleanPassengers, false, customerEmail.trim() || undefined);
    }
  };

  if (typeof document === 'undefined') return null;
  if (!isOpen) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(val) => { if (!val && !isProcessing) onClose(); }} modal={true}>
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
          {/* Mode Toggle for Admin & Agent */}
          {isAgentOrAdmin && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setPassengerMode('full')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-xs font-black transition-all ${
                  passengerMode === 'full'
                    ? 'bg-white text-[#1a6b7a] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Full Details</span>
                <span className="text-[9px] font-semibold opacity-60">All passenger info</span>
              </button>
              <button
                type="button"
                onClick={() => setPassengerMode('quick')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-xs font-black transition-all ${
                  passengerMode === 'quick'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Quick Booking</span>
                <span className="text-[9px] font-semibold opacity-60">Lead contact only</span>
              </button>
            </div>
          )}

          <form id="passenger-form" onSubmit={handleFormSubmit} className="space-y-8">
            {passengerMode === 'quick' ? (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-amber-700">
                    Quick mode: Only the <strong>lead adult's</strong> details are required. The remaining {totalPassengers - 1} passenger(s) will be auto-filled as "Guest". You can update their names later from the booking detail screen.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-5 space-y-4">
                  <p className="text-xs font-black text-[#1a6b7a] uppercase tracking-wider flex items-center gap-2">
                    {isStudentPackage ? 'Lead Student Contact' : 'Lead Adult Contact'}
                    <span className="rounded bg-[#1a6b7a] px-1.5 py-0.5 text-[10px] text-white font-black">Primary</span>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600">Full Name *</label>
                      <input
                        type="text"
                        required
                        disabled={isProcessing}
                        value={quickPassenger.full_name}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
                        placeholder="Enter primary passenger full name"
                      />
                    </div>

                    {isStudentPackage ? (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Class / Grade *</label>
                        <input
                          type="text"
                          required
                          disabled={isProcessing}
                          value={quickPassenger.student_class || ''}
                          onChange={(e) => setQuickPassenger(prev => ({ ...prev, student_class: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
                          placeholder="e.g. LKG, Class 5, Inter 1st Year"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Age (min 18) *</label>
                        <input
                          type="number"
                          required
                          min={18}
                          max={150}
                          disabled={isProcessing}
                          value={quickPassenger.age}
                          onChange={(e) => setQuickPassenger(prev => ({ ...prev, age: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                          className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50 ${
                            quickPassenger.age !== '' && Number(quickPassenger.age) < 18 ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                          }`}
                          placeholder="Age"
                        />
                        {quickPassenger.age !== '' && Number(quickPassenger.age) < 18 && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Must be adult (18+)</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <PremiumSelect
                        label="Gender *"
                        value={quickPassenger.gender}
                        disabled={isProcessing}
                        onChange={(val) => setQuickPassenger(prev => ({ ...prev, gender: val as any }))}
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
                        Aadhaar Number {isStudentPackage && <span className="text-[10px] font-semibold text-slate-400">(Optional)</span>}
                      </label>
                      <input
                        type="text"
                        required={!isStudentPackage}
                        pattern="[0-9]{12}"
                        title="12 digit Aadhaar number"
                        disabled={isProcessing}
                        value={quickPassenger.aadhaar}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50 ${
                          quickPassenger.aadhaar && quickPassenger.aadhaar.length === 12 && !isValidAadhaar(quickPassenger.aadhaar)
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-slate-300'
                        }`}
                        placeholder="12 digit number"
                      />
                      {quickPassenger.aadhaar && quickPassenger.aadhaar.length === 12 && !isValidAadhaar(quickPassenger.aadhaar) && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Invalid Aadhaar number (checksum failed)</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">
                        Contact Number {isStudentPackage && <span className="text-[10px] font-semibold text-slate-400">(Optional)</span>}
                      </label>
                      <input
                        type="tel"
                        required={!isStudentPackage}
                        disabled={isProcessing}
                        value={quickPassenger.phone}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50 ${
                          quickPassenger.phone && quickPassenger.phone.length > 0 && quickPassenger.phone.length < 10
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-slate-300'
                        }`}
                        placeholder="10 digit mobile number"
                      />
                      {quickPassenger.phone && quickPassenger.phone.length > 0 && quickPassenger.phone.length < 10 && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Contact number must be exactly 10 digits</p>
                      )}
                    </div>
                  </div>

                  {/* Auto-generated guests preview */}
                  {(totalPassengers > 1) && (
                    <div className="border-t border-[#1a6b7a]/15 pt-3 mt-1 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto-generated Guests</p>
                      {isStudentPackage ? (
                        Array.from({ length: totalPassengers - 1 }, (_, idx) => (
                          <div key={`qs-${idx}`} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            Guest Student {idx + 2}
                          </div>
                        ))
                      ) : (
                        <>
                          {Array.from({ length: adults - 1 }, (_, idx) => (
                            <div key={`qa-${idx}`} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                              Guest Adult {idx + 2}
                            </div>
                          ))}
                          {Array.from({ length: children }, (_, idx) => (
                            <div key={`qc-${idx}`} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-300 shrink-0" />
                              Guest Child {idx + 1}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              passengers.map((p, i) => {
                const isChild = i >= adults;
                return (
                  <div key={i} className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#1a6b7a]/30 hover:shadow-md">
                    <p className="mb-4 text-xs font-black uppercase tracking-wider text-[#1a6b7a]">
                      {isStudentPackage ? `🎓 Student Card ${i + 1}` : (targetType === 'room' ? `Guest Card ${i + 1}` : (isChild ? `Child Card ${i - adults + 1}` : `Adult Card ${i + 1}`))}
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

                      {isStudentPackage ? (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Class / Grade *</label>
                          <input
                            type="text"
                            required
                            disabled={isProcessing}
                            value={p.student_class || ''}
                            onChange={(e) => handleChange(i, 'student_class', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
                            placeholder="e.g. LKG, Class 5, Inter 1st Year"
                          />
                        </div>
                      ) : (
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
                      )}

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
                          {(isStudentPackage || (typeof p.age === 'number' && p.age <= 10)) ? (
                            <span className="ml-1 text-[10px] font-semibold text-slate-400">(Optional)</span>
                          ) : null}
                        </label>
                        <input
                          type="text"
                          required={!isStudentPackage && !(typeof p.age === 'number' && p.age <= 10)}
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

                      {(!isChild || isStudentPackage) && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">
                            Contact Number
                            {(isStudentPackage || i !== 0 || (typeof p.age === 'number' && p.age <= 10)) && (
                              <span className="ml-1 text-[10px] font-semibold text-slate-400">(Optional)</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            required={!isStudentPackage && i === 0 && !(typeof p.age === 'number' && p.age <= 10)}
                            disabled={isProcessing}
                            value={p.phone}
                            onChange={(e) => handleChange(i, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50 ${
                              p.phone && p.phone.length > 0 && p.phone.length < 10
                                ? 'border-rose-400 bg-rose-50'
                                : 'border-slate-300'
                            }`}
                            placeholder="10 digit mobile number"
                          />
                          {p.phone && p.phone.length > 0 && p.phone.length < 10 && (
                            <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Contact number must be exactly 10 digits</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </form>

          {isAgentOrAdmin && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">Tourist Email (Optional)</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">
                Booking confirmation and tickets will be sent directly to the tourist in addition to your agent account.
              </p>
              <input
                type="email"
                placeholder="e.g. tourist@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={isProcessing}
                className="w-full sm:w-2/3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none disabled:bg-slate-50"
              />
            </div>
          )}

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

          <div className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              id="aadhaar-consent-checkbox"
              checked={agreedToAadhaarConsent}
              onChange={(e) => setAgreedToAadhaarConsent(e.target.checked)}
              disabled={isProcessing}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1a6b7a] focus:ring-[#1a6b7a] disabled:opacity-50"
            />
            <label htmlFor="aadhaar-consent-checkbox" className="text-xs font-semibold text-slate-600 leading-relaxed cursor-pointer">
              I hereby give my consent to Telangana Boat Tourism to collect, verify, and store my Aadhaar details for government-mandated boarding security checks.
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
              !agreedToAadhaarConsent ||
              (passengerMode === 'quick'
                ? (isStudentPackage
                  ? !(
                      quickPassenger.full_name.trim() !== '' &&
                      quickPassenger.student_class?.trim() !== '' &&
                      quickPassenger.gender !== '' &&
                      (!quickPassenger.phone || /^\d{10}$/.test(quickPassenger.phone.trim())) &&
                      (!quickPassenger.aadhaar || (quickPassenger.aadhaar.length === 12 && isValidAadhaar(quickPassenger.aadhaar)))
                    )
                  : !(
                      quickPassenger.full_name.trim() !== '' &&
                      typeof quickPassenger.age === 'number' &&
                      quickPassenger.age >= 18 &&
                      quickPassenger.gender !== '' &&
                      /^\d{10}$/.test(quickPassenger.phone.trim()) &&
                      quickPassenger.aadhaar.length === 12 &&
                      isValidAadhaar(quickPassenger.aadhaar)
                    )
                  )
                : (isStudentPackage
                  ? !passengers.every((p) => {
                      const nameOk = p.full_name.trim() !== '';
                      const classOk = p.student_class?.trim() !== '';
                      const genderOk = p.gender !== '';
                      const aadhaarOk = !p.aadhaar || (p.aadhaar.length === 12 && isValidAadhaar(p.aadhaar));
                      const phoneOk = !p.phone || p.phone.trim().length === 0 || p.phone.trim().length === 10;
                      return nameOk && classOk && genderOk && aadhaarOk && phoneOk;
                    })
                  : !passengers.every((p, i) => {
                      const isChild = i >= adults;
                      const isChildAge = typeof p.age === 'number' && p.age <= 10;
                      const nameOk = p.full_name.trim() !== '';
                      const isPackage = targetType === 'package';
                      const ageOk = typeof p.age === 'number' && (isPackage ? (isChild ? (p.age >= 4 && p.age <= 10) : p.age >= 11) : (p.age >= 0));
                      const genderOk = p.gender !== '';
                      const aadhaarOk = isChildAge
                        ? (!p.aadhaar || p.aadhaar.length === 0 || isValidAadhaar(p.aadhaar))
                        : (p.aadhaar.length === 12 && isValidAadhaar(p.aadhaar));
                      const phoneOk = isChild || isChildAge || (i !== 0 && (!p.phone || p.phone.trim().length === 0)) || (p.phone && p.phone.trim().length === 10);
                      return nameOk && ageOk && genderOk && aadhaarOk && phoneOk;
                    })
                  )
              )
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
