'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Loader2, Plus, Users, Calendar, Package, Home, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import PremiumSelect from '@/components/ui/PremiumSelect';

// ─── Verhoeff Checksum ────────────────────────────────────────────────────────
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

import { CustomDatePicker } from '@/components/ui/CustomDatePicker';


interface PassengerForm {
  full_name: string;
  age: number | '';
  gender: string;
  phone: string;
  aadhaar: string;
  relationship: string;
  is_primary: boolean;
  student_class?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (publicId: string, info: { targetType: 'ROOM' | 'PACKAGE'; isPartial: boolean; remainingBalance: number; secret?: string | null }) => void;
}

export default function AdminCreateBookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [targetType, setTargetType] = useState<'package' | 'room'>('package');
  const [travelDate, setTravelDate] = useState('');
  const [variantId, setVariantId] = useState('');
  const [roomVariantId, setRoomVariantId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [studentCount, setStudentCount] = useState(1);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Transport state for package bookings
  const [transportMode, setTransportMode] = useState<'NONE' | 'SHARED' | 'SEPARATE'>('NONE');
  const [selectedSharedOptId, setSelectedSharedOptId] = useState<number | null>(null);
  const [separateVehicleQtys, setSeparateVehicleQtys] = useState<Record<number, number>>({});
  const [packageTransportOptions, setPackageTransportOptions] = useState<any[]>([]);
  const [packageHasTransport, setPackageHasTransport] = useState(false);
  const [packageHasRefreshments, setPackageHasRefreshments] = useState(false);
  const [packageRefAdultPrice, setPackageRefAdultPrice] = useState(0);
  const [packageRefChildPrice, setPackageRefChildPrice] = useState(0);
  const [includeRefreshments, setIncludeRefreshments] = useState(false);
  const [minPassengers, setMinPassengers] = useState(1);

  // Quick booking mode
  const [passengerMode, setPassengerMode] = useState<'full' | 'quick'>('full');
  const [quickPassenger, setQuickPassenger] = useState<PassengerForm>({
    full_name: '',
    age: 25,
    gender: '',
    phone: '',
    aadhaar: '',
    relationship: 'self',
    is_primary: true,
    student_class: '',
  });

  const selectedPackage = useMemo(() => {
    if (targetType !== 'package' || !variantId) return null;
    const selectedVariantNum = parseInt(variantId);
    return packagesList.find(p => (p.variants || []).some((v: any) => v.id === selectedVariantNum));
  }, [variantId, packagesList, targetType]);

  const isStudentPackage = !!selectedPackage?.is_student_package;

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      setPassengerMode('full');
      setAdultCount(1);
      setChildCount(0);
      setStudentCount(1);
      setQuickPassenger({
        full_name: '',
        age: 25,
        gender: '',
        phone: '',
        aadhaar: '',
        relationship: 'self',
        is_primary: true,
        student_class: '',
      });
      setCustomerEmail('');
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    setIsLoadingData(true);
    try {
      const [packagesRes, roomsRes] = await Promise.all([
        apiClient.get('/api/v1/admin/packages?limit=100'),
        apiClient.get('/api/v1/admin/rooms?limit=100')
      ]);
      setPackagesList(packagesRes.data.items || packagesRes.data);
      setRoomsList(roomsRes.data.items || roomsRes.data);
    } catch (e) {
      console.error("Failed to load packages/rooms for dropdown", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  // When variant selection changes, fetch the package's transport options
  useEffect(() => {
    if (targetType !== 'package' || !variantId) {
      setPackageTransportOptions([]);
      setPackageHasTransport(false);
      setTransportMode('NONE');
      setSelectedSharedOptId(null);
      setSeparateVehicleQtys({});
      setMinPassengers(1);
      return;
    }
    const selectedVariantNum = parseInt(variantId);
    const pkg = packagesList.find(p => (p.variants || []).some((v: any) => v.id === selectedVariantNum));
    if (pkg) {
      setPackageHasTransport(!!pkg.has_transport);
      setPackageTransportOptions(pkg.transport_options || []);
      setPackageHasRefreshments(!!pkg.has_refreshments);
      
      const isStudentPkg = !!pkg.is_student_package;
      if (isStudentPkg) {
        const rStudent = Number(pkg.refreshment_student_price || pkg.refreshment_adult_price || 0);
        setPackageRefAdultPrice(rStudent);
        setPackageRefChildPrice(0);
      } else {
        setPackageRefAdultPrice(Number(pkg.refreshment_adult_price) || 0);
        setPackageRefChildPrice(Number(pkg.refreshment_child_price) || 0);
      }
      
      const newMin = Number(pkg.min_passengers) || 1;
      setMinPassengers(newMin);
      
      if (isStudentPkg) {
        if (studentCount < newMin) {
          setStudentCount(newMin);
        }
      } else {
        if (adultCount + childCount < newMin) {
          setAdultCount(Math.max(1, newMin - childCount));
        }
      }
      // Reset transport when package changes
      setTransportMode('NONE');
      setSelectedSharedOptId(null);
      setSeparateVehicleQtys({});
      setIncludeRefreshments(false);
    }
  }, [variantId, packagesList, targetType]);

  // Sync passenger list with count
  useEffect(() => {
    const isStudentPkg = targetType === 'package' && !!packagesList.find(p => (p.variants || []).some((v: any) => v.id === parseInt(variantId)))?.is_student_package;
    const totalCount = isStudentPkg ? studentCount : (adultCount + childCount);
    setPassengers(prev => {
      if (prev.length === totalCount) return prev;
      const newList: PassengerForm[] = [];
      for (let i = 0; i < totalCount; i++) {
        newList.push(prev[i] || {
          full_name: '',
          age: isStudentPkg ? 0 : (i < adultCount ? 25 : 5),
          gender: '',
          phone: '',
          aadhaar: '',
          relationship: i === 0 ? 'self' : '',
          is_primary: i === 0,
          student_class: '',
        } as any);
      }
      return newList;
    });
  }, [adultCount, childCount, studentCount, variantId, packagesList, targetType]);

  const handlePassengerChange = (idx: number, field: keyof PassengerForm, value: any) => {
    setPassengers(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const sharedOpts = packageTransportOptions.filter((o: any) => o.type === 'SHARED');
  const separateOpts = packageTransportOptions.filter((o: any) => o.type === 'SEPARATE_VEHICLE');

  const separateCapacityOk = useMemo(() => {
    if (transportMode !== 'SEPARATE') return true;
    const totalPax = isStudentPackage ? studentCount : (adultCount + childCount);
    const totalCapacity = separateOpts.reduce((sum: number, opt: any) => {
      const qty = separateVehicleQtys[opt.id] || 0;
      return sum + qty * (Number(opt.capacity) || 1);
    }, 0);
    const hasAnyVehicle = Object.values(separateVehicleQtys).some(q => q > 0);
    if (!hasAnyVehicle) return true;
    return totalCapacity >= totalPax;
  }, [transportMode, separateVehicleQtys, separateOpts, adultCount, childCount, studentCount, isStudentPackage]);

  const hasTransportSelection = useMemo(() => {
    if (targetType !== 'package' || !packageHasTransport || packageTransportOptions.length === 0) return true;
    if (transportMode === 'SHARED') {
      return selectedSharedOptId !== null;
    }
    if (transportMode === 'SEPARATE') {
      const totalVehicles = Object.values(separateVehicleQtys).reduce((a, b) => a + b, 0);
      return totalVehicles > 0;
    }
    return false;
  }, [targetType, packageHasTransport, packageTransportOptions, transportMode, selectedSharedOptId, separateVehicleQtys]);

  const canSubmit = () => {
    if (!travelDate) return false;
    if (targetType === 'package' && !variantId) return false;
    if (targetType === 'room' && !roomVariantId) return false;
    if (!separateCapacityOk) return false;
    if (targetType === 'package' && !hasTransportSelection) return false;
    if (targetType === 'package' && (isStudentPackage ? studentCount : (adultCount + childCount)) < minPassengers) return false;

    if (passengerMode === 'quick') {
      const nameOk = quickPassenger.full_name.trim() !== '';
      const genderOk = quickPassenger.gender !== '';
      if (isStudentPackage) {
        const classOk = (quickPassenger.student_class || '').trim() !== '';
        const phoneOk = !quickPassenger.phone || /^\d{10}$/.test(quickPassenger.phone.trim());
        const aadhaarOk = !quickPassenger.aadhaar || (quickPassenger.aadhaar.length === 12 && isValidAadhaar(quickPassenger.aadhaar));
        return nameOk && classOk && genderOk && phoneOk && aadhaarOk;
      } else {
        const ageOk = quickPassenger.age !== '' && Number(quickPassenger.age) >= 18;
        const phoneOk = /^\d{10}$/.test(quickPassenger.phone.trim());
        const aadhaarOk = quickPassenger.aadhaar.length === 12 && isValidAadhaar(quickPassenger.aadhaar);
        return nameOk && ageOk && genderOk && phoneOk && aadhaarOk;
      }
    }

    if (passengers.length === 0) return false;
    return passengers.every((p, i) => {
      const nameOk = p.full_name.trim() !== '';
      const ageOk = isStudentPackage ? true : p.age !== '';
      const genderOk = p.gender !== '';
      const phoneOk = isStudentPackage
        ? (!p.phone || /^\d{10}$/.test(p.phone.trim()))
        : (i === 0 ? /^\d{10}$/.test(p.phone.trim()) : true);
      const isChild = i >= adultCount;
      const aadhaarOk = isStudentPackage
        ? (!p.aadhaar || (p.aadhaar.length === 12 && isValidAadhaar(p.aadhaar)))
        : (isChild
            ? (!p.aadhaar || p.aadhaar.length === 0 || isValidAadhaar(p.aadhaar))
            : (p.aadhaar.length === 12 && isValidAadhaar(p.aadhaar)));
      const classOk = isStudentPackage ? (p.student_class || '').trim() !== '' : true;
      return nameOk && ageOk && genderOk && phoneOk && aadhaarOk && classOk;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setIsSubmitting(true);
    try {
      // Build transport_selections
      let transport_selections: Array<{option_id: number; quantity: number}> = [];
      if (targetType === 'package' && packageHasTransport) {
        if (transportMode === 'SHARED' && selectedSharedOptId) {
          transport_selections = [{ option_id: selectedSharedOptId, quantity: 1 }];
        } else if (transportMode === 'SEPARATE') {
          transport_selections = Object.entries(separateVehicleQtys)
            .filter(([, q]) => q > 0)
            .map(([idStr, qty]) => ({ option_id: Number(idStr), quantity: qty }));
        }
      }

      // Build passengers array based on mode
      let passengersPayload: any[];
      if (passengerMode === 'quick') {
        passengersPayload = [
          {
            full_name: quickPassenger.full_name,
            age: isStudentPackage ? 0 : Number(quickPassenger.age),
            gender: quickPassenger.gender,
            phone: quickPassenger.phone || undefined,
            aadhaar: quickPassenger.aadhaar || undefined,
            relationship: 'self',
            is_primary: true,
            student_class: isStudentPackage ? (quickPassenger.student_class || 'General') : undefined,
          }
        ];
        if (isStudentPackage) {
          // Auto-fill remaining students
          for (let i = 1; i < studentCount; i++) {
            passengersPayload.push({
              full_name: 'quick ticket(not provided)',
              age: 0,
              gender: 'MALE',
              phone: undefined,
              aadhaar: undefined,
              relationship: '',
              is_primary: false,
              student_class: quickPassenger.student_class || 'General',
            });
          }
        } else {
          // Auto-fill remaining adults
          for (let i = 1; i < adultCount; i++) {
            passengersPayload.push({
              full_name: 'quick ticket(not provided)',
              age: 25,
              gender: 'MALE',
              phone: '',
              aadhaar: undefined,
              relationship: '',
              is_primary: false,
            });
          }
          // Auto-fill children
          for (let i = 0; i < childCount; i++) {
            passengersPayload.push({
              full_name: 'quick ticket(not provided)',
              age: 7,
              gender: 'MALE',
              phone: '',
              aadhaar: undefined,
              relationship: '',
              is_primary: false,
            });
          }
        }
      } else {
        passengersPayload = passengers.map(p => ({
          ...p,
          age: isStudentPackage ? 0 : p.age,
          aadhaar: p.aadhaar || undefined,
          phone: p.phone || undefined,
        }));
      }

      const payload: any = {
        target_type: targetType,
        travel_date: travelDate,
        quantity: isStudentPackage ? studentCount : (adultCount + childCount),
        adult_count: isStudentPackage ? 0 : adultCount,
        child_count: isStudentPackage ? 0 : childCount,
        student_count: isStudentPackage ? studentCount : 0,
        passengers: passengersPayload,
        transport_selections: transport_selections.length > 0 ? transport_selections : undefined,
        include_refreshments: includeRefreshments,
        quick_booking: passengerMode === 'quick',
        customer_email: customerEmail.trim() || undefined,
      };
      if (amountPaid) {
        payload.amount_paid = parseFloat(amountPaid);
      }
      
      if (targetType === 'package') {
        payload.variant_id = parseInt(variantId);
      } else {
        payload.room_variant_id = parseInt(roomVariantId);
        if (departureDate) payload.departure_date = departureDate;
      }

      const res = await apiClient.post('/api/v1/admin/bookings/create', payload);
      toast.success(`Booking ${res.data.public_id} created successfully!`);
      
      const isPartial = payload.amount_paid !== undefined && payload.amount_paid < estimatedTotal;
      const remainingBalance = isPartial ? estimatedTotal - (payload.amount_paid || 0) : 0;
      onSuccess(res.data.public_id, {
        targetType: targetType.toUpperCase() as 'ROOM' | 'PACKAGE',
        isPartial,
        remainingBalance
      });
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const packageOptions = packagesList.flatMap(pkg =>
    (pkg.variants || []).map((v: any) => ({
      value: String(v.id),
      label: `${pkg.status !== 'PUBLISHED' ? `[${pkg.status}] ` : ''}${pkg.title} — ${v.title}`,
      adult_price: v.adult_price,
      child_price: v.child_price
    }))
  );

  const roomOptions = roomsList.flatMap(room =>
    (room.variants || []).map((v: any) => ({
      value: String(v.id),
      label: `${room.status !== 'PUBLISHED' ? `[${room.status}] ` : ''}${room.lodge_name || room.title} — ${v.variant_name || v.title}`,
      weekday_price: v.weekday_price,
      weekend_price: v.weekend_price,
      capacity_per_room: v.capacity_per_room
    }))
  );

  const estimatedTotal = useMemo(() => {
    let subtotal = 0;
    if (targetType === 'package' && variantId) {
      const selectedVariantNum = parseInt(variantId);
      const pkg = packagesList.find(p => (p.variants || []).some((v: any) => v.id === selectedVariantNum));
      const v = pkg?.variants?.find((v: any) => v.id === selectedVariantNum);
      if (v) {
        if (pkg?.is_student_package) {
          const isWeekend = travelDate ? (new Date(travelDate).getDay() === 0 || new Date(travelDate).getDay() === 6) : false;
          const studentPrice = (isWeekend && v.weekend_student_price) ? Number(v.weekend_student_price) : Number(v.student_price || 0);
          subtotal = studentCount * studentPrice;
        } else {
          subtotal = (adultCount * (Number(v.adult_price) || 0)) + (childCount * (Number(v.child_price) || 0));
        }
      }
      // Transport cost
      if (transportMode === 'SHARED' && selectedSharedOptId) {
        const tOpt = packageTransportOptions.find((o: any) => o.id === selectedSharedOptId);
        if (tOpt) {
          if (pkg?.is_student_package) {
            const isWeekend = travelDate ? (new Date(travelDate).getDay() === 0 || new Date(travelDate).getDay() === 6) : false;
            const tPrice = (isWeekend && tOpt.weekend_student_price) ? Number(tOpt.weekend_student_price) : Number(tOpt.student_price || 0);
            subtotal += studentCount * tPrice;
          } else {
            subtotal += (adultCount * Number(tOpt.adult_price || 0)) + (childCount * Number(tOpt.child_price || 0));
          }
        }
      } else if (transportMode === 'SEPARATE') {
        for (const [idStr, qty] of Object.entries(separateVehicleQtys)) {
          if (!qty || qty <= 0) continue;
          const tOpt = packageTransportOptions.find((o: any) => o.id === Number(idStr));
          if (tOpt) subtotal += qty * Number(tOpt.fixed_price || 0);
        }
      }
      // Refreshments cost
      if (includeRefreshments && packageHasRefreshments) {
        if (pkg?.is_student_package) {
          const rStudent = Number(pkg.refreshment_student_price || pkg.refreshment_adult_price || 0);
          subtotal += studentCount * rStudent;
        } else {
          subtotal += (adultCount * packageRefAdultPrice) + (childCount * packageRefChildPrice);
        }
      }
    } else if (targetType === 'room' && roomVariantId && travelDate) {
      const selected = roomOptions.find(o => o.value === roomVariantId);
      if (selected) {
        const arrival = new Date(travelDate);
        const departure = departureDate ? new Date(departureDate) : new Date(arrival.getTime() + 86400000);
        if (departure > arrival) {
          const days = Math.ceil((departure.getTime() - arrival.getTime()) / 86400000);
          let current = new Date(arrival);
          let totalPrice = 0;
          const requiredRooms = Math.ceil((adultCount + childCount) / (selected.capacity_per_room || 2));
          for (let i = 0; i < days; i++) {
            const isWeekend = current.getDay() === 0 || current.getDay() === 6;
            const price = isWeekend ? (selected.weekend_price || selected.weekday_price) : selected.weekday_price;
            totalPrice += price * requiredRooms;
            current.setDate(current.getDate() + 1);
          }
          subtotal = totalPrice;
        }
      }
    }
    const gst = subtotal * 0.05;
    const gatewayFee = (subtotal + gst) * 0.01;
    return subtotal + gst + gatewayFee;
  }, [targetType, variantId, roomVariantId, packagesList, packageOptions, roomOptions, adultCount, childCount, studentCount, travelDate, departureDate, transportMode, selectedSharedOptId, separateVehicleQtys, packageTransportOptions, includeRefreshments, packageHasRefreshments, packageRefAdultPrice, packageRefChildPrice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200">
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
        <form id="admin-booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setTargetType('package')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-black transition ${targetType === 'package' ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 text-[#1a6b7a]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
              <Package className="h-4 w-4" /> Tour Package
            </button>
            <button type="button" onClick={() => setTargetType('room')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-black transition ${targetType === 'room' ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 text-[#1a6b7a]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
              <Home className="h-4 w-4" /> Room / Lodge
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {targetType === 'package' ? (
              <div className="space-y-1 sm:col-span-2">
                <PremiumSelect
                  label="Select Package / Variant"
                  value={variantId}
                  onChange={setVariantId}
                  options={packageOptions}
                  placeholder="-- Choose Package Variant --"
                />
              </div>
            ) : (
              <div className="space-y-1 sm:col-span-2">
                <PremiumSelect
                  label="Select Room / Variant"
                  value={roomVariantId}
                  onChange={setRoomVariantId}
                  options={roomOptions}
                  placeholder="-- Choose Room Variant --"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">{targetType === 'room' ? 'Check-in Date' : 'Travel Date'}</label>
              <CustomDatePicker label={targetType === 'room' ? 'Check-in' : 'Travel Date'} value={travelDate} onChange={setTravelDate} allowPast={true} />
            </div>
            {targetType === 'room' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Check-out Date</label>
                <CustomDatePicker label="Check-out Date" value={departureDate} onChange={setDepartureDate} allowPast={true} />
              </div>
            )}
            {isStudentPackage ? (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Students</label>
                <input type="number" min="1" max="1000" value={studentCount} onChange={(e) => setStudentCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Transport Options for Package Bookings */}
          {targetType === 'package' && packageHasTransport && packageTransportOptions.length > 0 && (
            <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-indigo-700 uppercase tracking-wider">Transport</h3>
                {transportMode !== 'NONE' && (
                  <button type="button" onClick={() => { setTransportMode('NONE'); setSelectedSharedOptId(null); setSeparateVehicleQtys({}); }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-rose-500 transition-colors uppercase tracking-wider">× Remove</button>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setTransportMode('NONE'); setSelectedSharedOptId(null); setSeparateVehicleQtys({}); }}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${transportMode === 'NONE' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>None</button>
                {sharedOpts.length > 0 && (
                  <button type="button" onClick={() => { setTransportMode('SHARED'); setSeparateVehicleQtys({}); if (!selectedSharedOptId && sharedOpts.length > 0) setSelectedSharedOptId(sharedOpts[0].id); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${transportMode === 'SHARED' ? 'bg-[#1a6b7a] border-[#1a6b7a] text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-[#1a6b7a]/60'}`}>🚌 Shared</button>
                )}
                {separateOpts.length > 0 && (
                  <button type="button" onClick={() => { setTransportMode('SEPARATE'); setSelectedSharedOptId(null); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${transportMode === 'SEPARATE' ? 'bg-[#1a6b7a] border-[#1a6b7a] text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-[#1a6b7a]/60'}`}>🚗 Private</button>
                )}
              </div>
              {transportMode === 'SHARED' && sharedOpts.map((opt: any) => (
                <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedSharedOptId === opt.id ? 'border-[#1a6b7a] bg-[#1a6b7a]/5' : 'border-slate-200 bg-white hover:border-[#1a6b7a]/40'}`}>
                  <input type="radio" name="adminSharedTransport" checked={selectedSharedOptId === opt.id} onChange={() => setSelectedSharedOptId(opt.id)} className="text-[#1a6b7a]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{opt.title} {opt.capacity ? `(${opt.capacity} Seater)` : ''}</div>
                    {isStudentPackage ? (
                      <div className="text-[10px] text-[#1a6b7a] font-semibold mt-0.5">₹{opt.student_price}/student</div>
                    ) : (
                      <div className="text-[10px] text-[#1a6b7a] font-semibold mt-0.5">₹{opt.adult_price}/adult · ₹{opt.child_price}/child</div>
                    )}
                  </div>
                </label>
              ))}
              {transportMode === 'SEPARATE' && (
                <div className="space-y-2">
                  {separateOpts.map((opt: any) => {
                    const qty = separateVehicleQtys[opt.id] || 0;
                    return (
                      <div key={opt.id} className={`p-3 rounded-xl border transition-all ${qty > 0 ? 'border-[#1a6b7a] bg-[#1a6b7a]/5' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{opt.title}</div>
                            <div className="text-[10px] font-semibold mt-0.5 text-slate-500">Max {opt.capacity} pax · <span className="text-[#1a6b7a]">₹{opt.fixed_price}/vehicle</span></div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button type="button" disabled={qty <= 0} onClick={() => setSeparateVehicleQtys(prev => ({ ...prev, [opt.id]: Math.max(0, (prev[opt.id] || 0) - 1) }))}
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center font-black text-base transition-all ${qty <= 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-[#1a6b7a] text-[#1a6b7a] hover:bg-[#1a6b7a] hover:text-white'}`}>−</button>
                            <span className={`w-6 text-center text-sm font-black ${qty > 0 ? 'text-[#1a6b7a]' : 'text-slate-400'}`}>{qty}</span>
                            <button type="button" onClick={() => setSeparateVehicleQtys(prev => ({ ...prev, [opt.id]: (prev[opt.id] || 0) + 1 }))}
                              className="h-8 w-8 rounded-lg border border-[#1a6b7a] text-[#1a6b7a] flex items-center justify-center font-black text-base transition-all hover:bg-[#1a6b7a] hover:text-white">+</button>
                          </div>
                        </div>
                        {qty > 0 && (
                          <div className="mt-2 flex justify-between text-[10px] font-bold border-t border-[#1a6b7a]/20 pt-1.5">
                            <span className="text-slate-500">{qty} × ₹{opt.fixed_price}</span>
                            <span className="text-[#1a6b7a]">+₹{qty * Number(opt.fixed_price)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!separateCapacityOk && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[10px] font-bold text-rose-600">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Not enough capacity for {isStudentPackage ? studentCount : (adultCount + childCount)} passengers. Add more vehicles.</span>
                    </div>
                  )}
                  {separateCapacityOk && Object.values(separateVehicleQtys).some(q => q > 0) && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Vehicles confirmed for {isStudentPackage ? studentCount : (adultCount + childCount)} passengers</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Refreshments for Package Bookings */}
          {targetType === 'package' && packageHasRefreshments && (
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${includeRefreshments ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-400/50'}`}>
              <input type="checkbox" checked={includeRefreshments} onChange={e => setIncludeRefreshments(e.target.checked)} className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4" />
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800">Add Refreshments</div>
                {isStudentPackage ? (
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">₹{packageRefAdultPrice}/student</div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">₹{packageRefAdultPrice}/adult · ₹{packageRefChildPrice}/child</div>
                )}
              </div>
            </label>
          )}

          {/* Payment Info */}
          <div className="rounded-xl border border-[#1a6b7a]/20 bg-[#1a6b7a]/5 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1a6b7a]">Total Amount</p>
                <p className="text-xl font-black text-slate-900">₹{estimatedTotal.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 font-semibold">Includes 5% GST & 1% Gateway Fee</p>
              </div>
              <div className="w-1/2 flex flex-col items-end">
                <div className="flex items-center justify-between w-full mb-1">
                  <label className="text-xs font-bold text-slate-600">Amount Collected Now</label>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex bg-slate-200/60 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAmountPaid('')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${amountPaid === '' ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const minAdv = Math.ceil(estimatedTotal * 0.35);
                        setAmountPaid(String(minAdv));
                      }}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${amountPaid !== '' ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      Advance
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Amount"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full h-[36px] rounded-lg border border-slate-300 pl-6 pr-2 py-1 text-xs font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            {amountPaid !== '' && (
              <div className="flex justify-between items-center text-[11px] font-bold border-t border-[#1a6b7a]/20 pt-2 flex-wrap gap-1">
                <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Advance Paid: ₹{parseFloat(amountPaid || '0').toFixed(2)}
                </span>
                <span className="text-slate-500">
                  Pending Balance: ₹{Math.max(0, estimatedTotal - parseFloat(amountPaid || '0')).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Tourist Email */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">Tourist Email (Optional)</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              Booking confirmation and tickets will be sent directly to the tourist.
            </p>
            <input
              type="email"
              placeholder="e.g. tourist@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full sm:w-2/3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none"
            />
            {/* Min Passengers Warning */}
            {targetType === 'package' && minPassengers > 1 && (isStudentPackage ? studentCount : (adultCount + childCount)) < minPassengers && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-700 leading-relaxed">
                  This package requires a minimum of <span className="font-black">{minPassengers} {isStudentPackage ? 'students' : 'passengers'}</span> per booking. Add more to proceed.
                </p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1a6b7a]" />
              <h3 className="text-sm font-black text-slate-800">Passenger Details ({isStudentPackage ? studentCount : (adultCount + childCount)})</h3>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
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

            {/* ─── QUICK BOOKING MODE ─── */}
            {passengerMode === 'quick' && (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-amber-700">
                    Quick mode: Only the <strong>{isStudentPackage ? "lead student's" : "lead adult's"}</strong> details are required. The remaining {(isStudentPackage ? studentCount : (adultCount + childCount)) - 1} passenger(s) will be auto-filled as "{isStudentPackage ? "Student" : "Guest"}". You can update their names later from the booking detail screen.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 space-y-3">
                  <p className="text-xs font-black text-violet-700 uppercase tracking-wider flex items-center gap-2">
                    {isStudentPackage ? 'Lead Student Contact' : 'Lead Adult Contact'}
                    <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] text-white font-black">Primary</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={quickPassenger.full_name}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-violet-500 focus:ring-1 focus:ring-violet-400 outline-none"
                      />
                    </div>
                    {isStudentPackage ? (
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Class / Grade *"
                          value={quickPassenger.student_class || ''}
                          onChange={(e) => setQuickPassenger(prev => ({ ...prev, student_class: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-violet-500 focus:ring-1 focus:ring-violet-400 outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <input
                          type="number"
                          min={18}
                          max={120}
                          placeholder="Age (min 18) *"
                          value={quickPassenger.age}
                          onChange={(e) => setQuickPassenger(prev => ({ ...prev, age: parseInt(e.target.value) || '' }))}
                          className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:border-violet-500 focus:ring-1 focus:ring-violet-400 outline-none ${
                            quickPassenger.age !== '' && Number(quickPassenger.age) < 18 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                          }`}
                        />
                        {quickPassenger.age !== '' && Number(quickPassenger.age) < 18 && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Must be adult (18+)</p>
                        )}
                      </div>
                    )}
                    <div>
                      <select
                        value={quickPassenger.gender}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-violet-500 focus:ring-1 focus:ring-violet-400 outline-none bg-white"
                      >
                        <option value="">Gender *</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder={isStudentPackage ? "Aadhaar Number (Optional)" : "Aadhaar Number (12 digits) *"}
                        value={quickPassenger.aadhaar}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:border-violet-500 focus:ring-1 focus:ring-violet-400 outline-none ${
                          quickPassenger.aadhaar.length === 12 && !isValidAadhaar(quickPassenger.aadhaar) ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                        }`}
                      />
                      {quickPassenger.aadhaar.length === 12 && !isValidAadhaar(quickPassenger.aadhaar) && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Invalid Aadhaar (checksum failed)</p>
                      )}
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="tel"
                        placeholder={isStudentPackage ? "Phone Number (Optional)" : "Phone Number (10 digits) *"}
                        value={quickPassenger.phone}
                        onChange={(e) => setQuickPassenger(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:border-violet-500 focus:ring-1 focus:ring-violet-400 outline-none ${
                          quickPassenger.phone.length > 0 && quickPassenger.phone.length !== 10 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                        }`}
                      />
                      {quickPassenger.phone.length > 0 && quickPassenger.phone.length !== 10 && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Phone number must be exactly 10 digits</p>
                      )}
                    </div>
                  </div>

                  {/* Auto-generated guests preview */}
                  {((isStudentPackage ? studentCount : (adultCount + childCount)) > 1) && (
                    <div className="border-t border-violet-100 pt-3 mt-1 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto-generated Guests</p>
                      {isStudentPackage ? (
                        Array.from({ length: studentCount - 1 }, (_, i) => (
                          <div key={`qs-${i}`} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            Guest Student {i + 2}
                          </div>
                        ))
                      ) : (
                        <>
                          {Array.from({ length: adultCount - 1 }, (_, i) => (
                            <div key={`qa-${i}`} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                              Guest Adult {i + 2}
                            </div>
                          ))}
                          {Array.from({ length: childCount }, (_, i) => (
                            <div key={`qc-${i}`} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-300 shrink-0" />
                              Guest Child {i + 1}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ─── FULL DETAILS MODE ─── */}
            {passengerMode === 'full' && passengers.map((p, i) => {
              const isChild = i >= adultCount;
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <p className="text-xs font-black text-[#1a6b7a] uppercase tracking-wider">
                    {isStudentPackage
                      ? `Student ${i + 1}`
                      : (i < adultCount ? `Adult ${i + 1}` : `Child ${i + 1 - adultCount}`)}{' '}
                    {i === 0 && <span className="ml-1 rounded bg-[#1a6b7a] px-1.5 py-0.5 text-[10px] text-white">Primary</span>}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input type="text" required placeholder="Full Name" value={p.full_name}
                        onChange={(e) => handlePassengerChange(i, 'full_name', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
                    </div>
                    <div>
                      {isStudentPackage ? (
                        <input type="text" required placeholder="Class / Grade" value={p.student_class || ''}
                          onChange={(e) => handlePassengerChange(i, 'student_class', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
                      ) : (
                        <input type="number" required min={i < adultCount ? 11 : 4} max={i < adultCount ? 120 : 10} placeholder="Age" value={p.age}
                          onChange={(e) => handlePassengerChange(i, 'age', parseInt(e.target.value) || '')}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none" />
                      )}
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
                      <input type="text" placeholder={isStudentPackage || isChild ? "Aadhaar (Optional)" : "Aadhaar Number"}
                        required={!isStudentPackage && !isChild} value={p.aadhaar}
                        onChange={(e) => handlePassengerChange(i, 'aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none ${p.aadhaar.length === 12 && !isValidAadhaar(p.aadhaar) ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                          }`} />
                      {p.aadhaar.length === 12 && !isValidAadhaar(p.aadhaar) && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Invalid Aadhaar (checksum failed)</p>
                      )}
                    </div>
                    {(i === 0 || isStudentPackage) && (
                      <div className="sm:col-span-3">
                        <input type="tel" required={i === 0 && !isStudentPackage} placeholder={isStudentPackage ? "Phone Number (Optional)" : "Phone Number"} value={p.phone}
                          onChange={(e) => handlePassengerChange(i, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a] outline-none ${p.phone.length > 0 && p.phone.length !== 10 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                            }`} />
                        {p.phone.length > 0 && p.phone.length !== 10 && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Phone number must be exactly 10 digits</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
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