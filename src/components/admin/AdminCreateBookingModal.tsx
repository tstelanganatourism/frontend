'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Loader2, Plus, Users, Calendar, Package, Home, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import PremiumSelect from '@/components/ui/PremiumSelect';

// ─── Verhoeff Checksum ────────────────────────────────────────────────────────
const _d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const _p = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
function isValidAadhaar(num: string): boolean {
  if (!num || num.length !== 12 || !/^\d{12}$/.test(num)) return false;
  if (num[0] === '0' || num[0] === '1') return false;
  let c = 0;
  const digits = num.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) c = _d[c][_p[i % 8][digits[i]]];
  return c === 0;
}

import { CustomDatePicker } from '@/components/ui/CustomDatePicker';


interface PassengerForm {
  full_name: string;
  age: number | '';
  gender: string;
  phone: string;
  aadhaar: string;
  relationship: string;
  is_primary: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminCreateBookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [targetType, setTargetType] = useState<'package' | 'room'>('package');
  const [travelDate, setTravelDate] = useState('');
  const [variantId, setVariantId] = useState('');
  const [roomVariantId, setRoomVariantId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    setIsLoadingData(true);
    try {
      const [packagesRes, roomsRes] = await Promise.all([
        apiClient.get('/api/v1/packages/'),
        apiClient.get('/api/v1/rooms/')
      ]);
      setPackagesList(packagesRes.data.items || packagesRes.data);
      setRoomsList(roomsRes.data.items || roomsRes.data);
    } catch (e) {
      console.error("Failed to load packages/rooms for dropdown", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Sync passenger list with count
  useEffect(() => {
    const totalCount = adultCount + childCount;
    setPassengers(prev => {
      if (prev.length === totalCount) return prev;
      const newList: PassengerForm[] = [];
      for (let i = 0; i < totalCount; i++) {
        newList.push(prev[i] || {
          full_name: '',
          age: i < adultCount ? 25 : 5,
          gender: '',
          phone: '',
          aadhaar: '',
          relationship: i === 0 ? 'self' : '',
          is_primary: i === 0,
        });
      }
      return newList;
    });
  }, [adultCount, childCount]);

  const handlePassengerChange = (idx: number, field: keyof PassengerForm, value: any) => {
    setPassengers(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const canSubmit = () => {
    if (!travelDate) return false;
    if (targetType === 'package' && !variantId) return false;
    if (targetType === 'room' && !roomVariantId) return false;
    if (passengers.length === 0) return false;
    return passengers.every((p, i) => {
      const isMinor = typeof p.age === 'number' && p.age < 18;
      const nameOk = p.full_name.trim() !== '';
      const ageOk = p.age !== '';
      const genderOk = p.gender !== '';
      const aadhaarOk = isMinor
        ? (!p.aadhaar || p.aadhaar.length === 0 || isValidAadhaar(p.aadhaar))
        : (p.aadhaar.length === 12 && isValidAadhaar(p.aadhaar));
      return nameOk && ageOk && genderOk && aadhaarOk;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        target_type: targetType,
        travel_date: travelDate,
        quantity: adultCount + childCount,
        adult_count: adultCount,
        child_count: childCount,
        passengers: passengers.map(p => ({
          ...p,
          aadhaar: p.aadhaar || undefined,
        })),
      };
      if (targetType === 'package') {
        payload.variant_id = parseInt(variantId);
      } else {
        payload.room_variant_id = parseInt(roomVariantId);
        if (departureDate) payload.departure_date = departureDate;
      }

      const res = await apiClient.post('/api/v1/admin/bookings/create', payload);
      toast.success(`Booking ${res.data.public_id} created successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const packageOptions = packagesList.flatMap(pkg => 
    (pkg.variants || []).map((v: any) => ({
      value: String(v.id),
      label: `${pkg.title} — ${v.title}`
    }))
  );

  const roomOptions = roomsList.flatMap(room => 
    (room.variants || []).map((v: any) => ({
      value: String(v.id),
      label: `${room.title} — ${v.title}`
    }))
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm overflow-y-auto p-4 flex justify-center">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col my-auto overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5">
              <Plus className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Admin Direct Booking</h2>
              <p className="text-xs font-semibold text-slate-500">Bypass payment — booking created immediately</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form id="admin-booking-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setTargetType('package')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-black transition ${
                targetType === 'package' ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 text-[#1a6b7a]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              <Package className="h-4 w-4" /> Tour Package
            </button>
            <button type="button" onClick={() => setTargetType('room')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-black transition ${
                targetType === 'room' ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 text-[#1a6b7a]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              <Home className="h-4 w-4" /> Room / Lodge
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {targetType === 'package' ? (
              <div className="space-y-1">
                <PremiumSelect 
                  label="Select Package / Variant"
                  value={variantId} 
                  onChange={setVariantId}
                  options={packageOptions}
                  placeholder="-- Choose Package Variant --"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <PremiumSelect 
                    label="Select Room / Variant"
                    value={roomVariantId} 
                    onChange={setRoomVariantId}
                    options={roomOptions}
                    placeholder="-- Choose Room Variant --"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Departure Date</label>
                  <CustomDatePicker label="Departure" value={departureDate} onChange={setDepartureDate} />
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Travel Date</label>
              <CustomDatePicker label="Travel Date" value={travelDate} onChange={setTravelDate} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Adults</label>
              <input type="number" min="1" max="50" value={adultCount} onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Children</label>
              <input type="number" min="0" max="50" value={childCount} onChange={(e) => setChildCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
            </div>
          </div>

          {/* Passengers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1a6b7a]" />
              <h3 className="text-sm font-black text-slate-800">Passenger Details ({passengers.length})</h3>
            </div>
            {passengers.map((p, i) => {
              const isMinor = typeof p.age === 'number' && p.age < 18;
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <p className="text-xs font-black text-[#1a6b7a] uppercase tracking-wider">
                    Passenger {i + 1} {i === 0 && <span className="ml-1 rounded bg-[#1a6b7a] px-1.5 py-0.5 text-[10px] text-white">Primary</span>}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input type="text" required placeholder="Full Name" value={p.full_name}
                        onChange={(e) => handlePassengerChange(i, 'full_name', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
                    </div>
                    <div>
                      <input type="number" required min="0" max="120" placeholder="Age" value={p.age}
                        onChange={(e) => handlePassengerChange(i, 'age', parseInt(e.target.value) || '')}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
                    </div>
                    <div>
                      <select value={p.gender} onChange={(e) => handlePassengerChange(i, 'gender', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none bg-white">
                        <option value="">Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <input type="text" placeholder={isMinor ? "Aadhaar (Optional)" : "Aadhaar Number"}
                        required={!isMinor} value={p.aadhaar}
                        onChange={(e) => handlePassengerChange(i, 'aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none ${
                          p.aadhaar.length === 12 && !isValidAadhaar(p.aadhaar) ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                        }`} />
                      {p.aadhaar.length === 12 && !isValidAadhaar(p.aadhaar) && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Invalid Aadhaar (checksum failed)</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button form="admin-booking-form" type="submit" disabled={isSubmitting || !canSubmit()}
            className="rounded-lg bg-violet-600 px-8 py-2.5 text-sm font-black text-white shadow-md hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Booking
          </button>
        </div>

        {/* Processing overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-4" />
            <p className="font-black text-lg text-slate-800">Creating Booking...</p>
          </div>
        )}
      </div>
    </div>
  );
}
