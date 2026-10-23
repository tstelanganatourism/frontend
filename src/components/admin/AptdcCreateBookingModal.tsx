'use client';

import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  Plus,
  ReceiptText,
  Trash2,
  Users,
  X,
  ChevronDown,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import CustomDateTimePicker from '@/components/ui/CustomDateTimePicker';

type PassengerGender = 'MALE' | 'FEMALE' | 'OTHER';

interface AptdcPassengerForm {
  full_name: string;
  gender: PassengerGender;
  age: string;
  fare: string;
  net_fare: string;
  seat_no: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (publicId: string) => void;
}

const blankPassenger = (): AptdcPassengerForm => ({
  full_name: '',
  gender: 'MALE',
  age: '',
  fare: '',
  net_fare: '',
  seat_no: '',
});

const localDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const inputClass =
  'mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#43ad4b] focus:ring-2 focus:ring-[#43ad4b]/15';
const labelClass = 'block text-[10px] font-black uppercase tracking-wider text-slate-500';
const referenceIssuedBy = 'APTPT00187(aptdc_bbt)';
const referenceIssuedAt = 'Bhadadri Boat Tourism';
const referenceIssuedPhone = '03340075510';
const aptdcGstin = '37AADCA9817H1ZH';
const aptdcStateCode = '37';

const PACKAGE_TYPE_SUGGESTIONS = [
  'TWO DAY PACKAGE',
  'ONE DAY PACKAGE',
  'THREE DAY PACKAGE',
  'DAY CRUISE',
  'WEEKEND SPECIAL'
];

const SERVICE_SUGGESTIONS = [
  'Pochavaram - Papikondalu',
  'Bhadrachalam - Papikondalu',
  'Rajahmundry - Papikondalu',
  'Bhadrachalam - Kolluru Huts - Papikondalu',
  'Pochavaram - Kolluru - Papikondalu'
];

const CITY_SUGGESTIONS = [
  'POCHAVARAM',
  'BHADRACHALAM',
  'PAPIKONDALU',
  'RAJAHMUNDRY',
  'PURUSHOTHAPATNAM'
];

// Custom styled Combobox / Suggestion Input
function CustomSuggestInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  required = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <span className={labelClass}>
        {label} {required && <span className="text-[#287a31]">*</span>}
      </span>
      <div className="relative">
        <input
          className={inputClass}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowDropdown(prev => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-slate-900/5">
          <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
            Quick Select:
          </div>
          {suggestions.map(sug => (
            <button
              key={sug}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                onChange(sug);
                setShowDropdown(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold text-left transition ${
                value === sug
                  ? 'bg-[#e8f6df] text-[#287a31]'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{sug}</span>
              {value === sug && <Check className="h-3.5 w-3.5 text-[#287a31]" />}
            </button>
          ))}
        </div>
      )}
      {helperText && <span className="mt-1 block text-[10px] font-medium text-slate-500">{helperText}</span>}
    </div>
  );
}

// Custom styled Gender Dropdown
function CustomGenderSelect({
  value,
  onChange,
}: {
  value: PassengerGender;
  onChange: (val: PassengerGender) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { val: PassengerGender; label: string; badge: string }[] = [
    { val: 'MALE', label: 'Male', badge: 'M' },
    { val: 'FEMALE', label: 'Female', badge: 'F' },
    { val: 'OTHER', label: 'Other', badge: 'O' },
  ];

  const selected = options.find(o => o.val === value) || options[0];

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none hover:border-[#43ad4b] focus:border-[#43ad4b] transition"
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-black text-slate-700">
            {selected.badge}
          </span>
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 min-w-[120px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-slate-900/10 animate-in fade-in duration-100">
          {options.map(opt => (
            <button
              key={opt.val}
              type="button"
              onMouseDown={e => {
                e.preventDefault();
                onChange(opt.val);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                value === opt.val
                  ? 'bg-[#e8f6df] text-[#287a31]'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-100 text-[9px] font-black">
                  {opt.badge}
                </span>
                <span>{opt.label}</span>
              </span>
              {value === opt.val && <Check className="h-3 w-3 text-[#287a31]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AptdcCreateBookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [packageType, setPackageType] = useState('TWO DAY PACKAGE');
  const [coachId, setCoachId] = useState('');
  const [coachType, setCoachType] = useState('');
  const [journeyDateTime, setJourneyDateTime] = useState('');
  const [returnDateTime, setReturnDateTime] = useState('');
  const [issueDateTime, setIssueDateTime] = useState(localDateTime());
  const [boardingCity, setBoardingCity] = useState('');
  const [alightingCity, setAlightingCity] = useState('');
  const [boardingPoint, setBoardingPoint] = useState('');
  const [alightingPoint, setAlightingPoint] = useState('');
  const [stateCode, setStateCode] = useState(aptdcStateCode);
  const [gstin, setGstin] = useState(aptdcGstin);
  const [extraCharges, setExtraCharges] = useState('0');
  const [issuedBy, setIssuedBy] = useState(referenceIssuedBy);
  const [issuedAt, setIssuedAt] = useState(referenceIssuedAt);
  const [issuedPhone, setIssuedPhone] = useState(referenceIssuedPhone);
  const [passengers, setPassengers] = useState<AptdcPassengerForm[]>([blankPassenger()]);

  const reset = () => {
    setTicketNumber('');
    setServiceName('');
    setPackageType('TWO DAY PACKAGE');
    setCoachId('');
    setCoachType('');
    setJourneyDateTime('');
    setReturnDateTime('');
    setIssueDateTime(localDateTime());
    setBoardingCity('');
    setAlightingCity('');
    setBoardingPoint('');
    setAlightingPoint('');
    setStateCode(aptdcStateCode);
    setGstin(aptdcGstin);
    setExtraCharges('0');
    setIssuedBy(referenceIssuedBy);
    setIssuedAt(referenceIssuedAt);
    setIssuedPhone(referenceIssuedPhone);
    setPassengers([blankPassenger()]);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const totals = useMemo(() => {
    const actualFare = passengers.reduce((sum, passenger) => sum + (Number(passenger.fare) || 0), 0);
    const netFare = passengers.reduce((sum, passenger) => sum + (Number(passenger.net_fare) || 0), 0);
    const additional = Number(extraCharges) || 0;
    return { actualFare, netFare, additional, total: netFare + additional };
  }, [passengers, extraCharges]);

  const updatePassenger = (index: number, patch: Partial<AptdcPassengerForm>) => {
    setPassengers(current =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, ...patch } : passenger
      )
    );
  };

  const isValid = () => {
    if (
      !ticketNumber.trim() ||
      !serviceName.trim() ||
      !packageType.trim() ||
      !journeyDateTime ||
      !returnDateTime ||
      !issueDateTime
    )
      return false;
    if (!boardingCity.trim() || !alightingCity.trim() || !boardingPoint.trim() || !alightingPoint.trim())
      return false;
    if (!issuedBy.trim() || !issuedAt.trim() || passengers.length === 0) return false;
    return passengers.every(
      passenger =>
        passenger.full_name.trim() &&
        passenger.age !== '' &&
        Number(passenger.age) >= 0 &&
        passenger.fare !== '' &&
        Number(passenger.fare) >= 0 &&
        passenger.net_fare !== '' &&
        Number(passenger.net_fare) >= 0
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid()) {
      toast.error('Complete every ticket field and each passenger fare before creating the receipt.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/api/v1/admin/bookings/create-aptdc', {
        ticket_number: ticketNumber.trim() || undefined,
        service_name: serviceName.trim(),
        package_type: packageType.trim(),
        coach_id_vehicle_no: coachId.trim() || '—',
        coach_type_vehicle_type: coachType.trim() || '—',
        journey_date_time: journeyDateTime,
        return_date_time: returnDateTime,
        issue_date_time: issueDateTime,
        boarding_city: boardingCity.trim(),
        alighting_city: alightingCity.trim(),
        boarding_point: boardingPoint.trim(),
        alighting_point: alightingPoint.trim(),
        state_code: stateCode.trim() || '37',
        gstin: gstin.trim() || '37AADCA9817H1ZH',
        extra_charges: totals.additional,
        issued_by: issuedBy.trim(),
        issued_at: issuedAt.trim(),
        issued_phone: issuedPhone.trim() || undefined,
        passengers: passengers.map(passenger => ({
          full_name: passenger.full_name.trim(),
          gender: passenger.gender,
          age: Number(passenger.age),
          fare: Number(passenger.fare),
          net_fare: Number(passenger.net_fare),
          seat_no: passenger.seat_no.trim() || undefined,
        })),
      });
      toast.success(`APTDC booking ${response.data.public_id} created successfully.`);
      reset();
      onSuccess(response.data.public_id);
      onClose();
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Could not create the APTDC booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/65 p-2 sm:p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex h-full max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl md:rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#e8f6df] p-2.5 text-[#287a31] shadow-xs">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Create APTDC Booking</h2>
                <span className="hidden sm:inline-flex rounded-full bg-[#e8f6df] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#287a31]">
                  Official Replica
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Manual package ticket — values print exactly as entered.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable form body */}
        <form
          id="aptdc-booking-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          {/* Banner notification */}
          <div className="rounded-xl border border-[#95cc6e] bg-[#f5fbea] p-3.5 sm:p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#287a31]">
              <ReceiptText className="h-4 w-4 shrink-0" />
              <span>APTDC Tour Package Confirmation Fields</span>
            </div>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">
              This record is completely independent from regular website bookings. It does not deduct package inventory or trigger automatic package pricing calculations.
            </p>
          </div>

          {/* Section 1: Ticket Details */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#287a31]" /> Ticket Details
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">* Required fields</span>
            </div>

            <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* PNR / Ticket Number */}
              <div>
                <span className={labelClass}>PNR / Ticket No *</span>
                <input
                  required
                  maxLength={100}
                  className={inputClass}
                  value={ticketNumber}
                  onChange={e => setTicketNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. WFU2223WRSAB000577"
                />
                <span className="mt-1 block text-[10px] font-medium text-slate-500">
                  Admin chooses the exact number printed on PNR row &amp; barcode.
                </span>
              </div>

              {/* Service Name with custom suggestions */}
              <CustomSuggestInput
                label="Service Name"
                value={serviceName}
                onChange={setServiceName}
                suggestions={SERVICE_SUGGESTIONS}
                placeholder="e.g. Pochavaram - Papikondalu"
                required
              />

              {/* Package Type with custom suggestions */}
              <CustomSuggestInput
                label="Package Type"
                value={packageType}
                onChange={setPackageType}
                suggestions={PACKAGE_TYPE_SUGGESTIONS}
                placeholder="e.g. TWO DAY PACKAGE"
                required
              />

              {/* Coach Id */}
              <div>
                <span className={labelClass}>Coach ID / Vehicle No</span>
                <input
                  className={inputClass}
                  value={coachId}
                  onChange={e => setCoachId(e.target.value)}
                  placeholder="e.g. 251 / -"
                />
              </div>

              {/* Coach Type */}
              <div>
                <span className={labelClass}>Coach Type / Vehicle Type</span>
                <input
                  className={inputClass}
                  value={coachType}
                  onChange={e => setCoachType(e.target.value)}
                  placeholder="e.g. COACH 1 / BOAT 70"
                />
              </div>

              {/* Issue Date & Time (Custom styled DateTimePicker) */}
              <CustomDateTimePicker
                label="Issue Date &amp; Time"
                value={issueDateTime}
                onChange={setIssueDateTime}
                required
              />

              {/* Journey Date & Time (Custom styled DateTimePicker) */}
              <CustomDateTimePicker
                label="Journey Date &amp; Time"
                value={journeyDateTime}
                onChange={setJourneyDateTime}
                required
              />

              {/* Return Date & Time (Custom styled DateTimePicker) */}
              <CustomDateTimePicker
                label="Return Date &amp; Time"
                value={returnDateTime}
                onChange={setReturnDateTime}
                required
              />

              {/* GSTIN */}
              <div>
                <span className={labelClass}>GSTIN (Fixed APTDC)</span>
                <input
                  readOnly
                  aria-readonly="true"
                  className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                  value={gstin}
                />
              </div>

              {/* Boarding City with custom suggestions */}
              <CustomSuggestInput
                label="Boarding City"
                value={boardingCity}
                onChange={val => setBoardingCity(val.toUpperCase())}
                suggestions={CITY_SUGGESTIONS}
                placeholder="e.g. POCHAVARAM"
                required
              />

              {/* Alighting City with custom suggestions */}
              <CustomSuggestInput
                label="Alighting City"
                value={alightingCity}
                onChange={val => setAlightingCity(val.toUpperCase())}
                suggestions={CITY_SUGGESTIONS}
                placeholder="e.g. PAPIKONDALU"
                required
              />

              {/* State Code */}
              <div>
                <span className={labelClass}>State Code (Fixed APTDC)</span>
                <input
                  readOnly
                  aria-readonly="true"
                  className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                  value={stateCode}
                />
              </div>

              {/* Boarding Point */}
              <div className="sm:col-span-2">
                <span className={labelClass}>Boarding Point *</span>
                <input
                  className={inputClass}
                  value={boardingPoint}
                  onChange={e => setBoardingPoint(e.target.value)}
                  placeholder="Point, contact number, or additional instructions"
                />
              </div>

              {/* Alighting Point */}
              <div>
                <span className={labelClass}>Alighting Point *</span>
                <input
                  className={inputClass}
                  value={alightingPoint}
                  onChange={e => setAlightingPoint(e.target.value)}
                  placeholder="e.g. PAPIKONDALU"
                />
              </div>

              {/* Issued By */}
              <div>
                <span className={labelClass}>Issued By *</span>
                <input
                  className={inputClass}
                  value={issuedBy}
                  onChange={e => setIssuedBy(e.target.value)}
                  placeholder={referenceIssuedBy}
                />
              </div>

              {/* Issued At */}
              <div>
                <span className={labelClass}>Issued At *</span>
                <input
                  className={inputClass}
                  value={issuedAt}
                  onChange={e => setIssuedAt(e.target.value)}
                  placeholder={referenceIssuedAt}
                />
              </div>

              {/* Issued Phone */}
              <div>
                <span className={labelClass}>Issued Phone</span>
                <input
                  className={inputClass}
                  value={issuedPhone}
                  onChange={e => setIssuedPhone(e.target.value)}
                  placeholder={referenceIssuedPhone}
                />
              </div>

              {/* Extra Charges */}
              <div>
                <span className={labelClass}>Extra Charges (Rs.)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={extraCharges}
                  onFocus={(e) => e.target.select()}
                  onChange={e => setExtraCharges(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Tourist Booking Details */}
          <section className="pt-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#287a31]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Tourist Booking Details ({passengers.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPassengers(current => [...current, blankPassenger()])}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#43ad4b] px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#328a39] active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Add Passenger
              </button>
            </div>

            {/* Desktop Table View (visible on md: and above) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#43ad4b] text-white">
                    <th className="w-12 px-3 py-3 text-center font-black">S.No</th>
                    <th className="min-w-48 px-3 py-3 font-black">Name *</th>
                    <th className="w-32 px-3 py-3 font-black">Gender *</th>
                    <th className="w-24 px-3 py-3 font-black">Age *</th>
                    <th className="w-32 px-3 py-3 font-black">Fare (Rs.) *</th>
                    <th className="w-36 px-3 py-3 font-black">Net Fare (Rs.) *</th>
                    <th className="w-28 px-3 py-3 font-black">Seat No</th>
                    <th className="w-12 px-2 py-3 text-center" />
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((passenger, index) => (
                    <tr key={index} className="border-t border-slate-200 bg-white hover:bg-slate-50/50">
                      <td className="px-3 py-2 text-center font-black text-slate-500">{index + 1}</td>
                      <td className="px-2 py-2">
                        <input
                          required
                          className="h-9 w-full rounded-lg border border-slate-200 px-2.5 font-semibold outline-none focus:border-[#43ad4b]"
                          value={passenger.full_name}
                          onChange={e => updatePassenger(index, { full_name: e.target.value })}
                          placeholder="Passenger Name"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <CustomGenderSelect
                          value={passenger.gender}
                          onChange={val => updatePassenger(index, { gender: val })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          max="150"
                          required
                          className="h-9 w-full rounded-lg border border-slate-200 px-2.5 font-semibold outline-none focus:border-[#43ad4b]"
                          value={passenger.age}
                          onFocus={(e) => e.target.select()}
                          onChange={e => updatePassenger(index, { age: e.target.value })}
                          placeholder="Age"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          className="h-9 w-full rounded-lg border border-slate-200 px-2.5 font-semibold outline-none focus:border-[#43ad4b]"
                          value={passenger.fare}
                          onFocus={(e) => e.target.select()}
                          onChange={e => updatePassenger(index, { fare: e.target.value })}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          className="h-9 w-full rounded-lg border border-slate-200 px-2.5 font-semibold outline-none focus:border-[#43ad4b]"
                          value={passenger.net_fare}
                          onFocus={(e) => e.target.select()}
                          onChange={e => updatePassenger(index, { net_fare: e.target.value })}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          className="h-9 w-full rounded-lg border border-slate-200 px-2.5 font-semibold outline-none focus:border-[#43ad4b]"
                          value={passenger.seat_no}
                          onChange={e => updatePassenger(index, { seat_no: e.target.value })}
                          placeholder="e.g. 12"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          disabled={passengers.length === 1}
                          onClick={() =>
                            setPassengers(current => current.filter((_, pIdx) => pIdx !== index))
                          }
                          className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Remove passenger ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (optimized for phones/tablets, no horizontal scroll struggle) */}
            <div className="block md:hidden space-y-3">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#43ad4b] text-[10px] font-black text-white">
                        {index + 1}
                      </span>
                      Passenger {index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={passengers.length === 1}
                      onClick={() =>
                        setPassengers(current => current.filter((_, pIdx) => pIdx !== index))
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  {/* Name */}
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input
                      required
                      className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-[#43ad4b]"
                      value={passenger.full_name}
                      onChange={e => updatePassenger(index, { full_name: e.target.value })}
                      placeholder="Passenger Full Name"
                    />
                  </div>

                  {/* Gender & Age */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Gender *</label>
                      <div className="mt-1">
                        <CustomGenderSelect
                          value={passenger.gender}
                          onChange={val => updatePassenger(index, { gender: val })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Age (Yrs) *</label>
                      <input
                        type="number"
                        min="0"
                        max="150"
                        required
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-[#43ad4b]"
                        value={passenger.age}
                        onFocus={(e) => e.target.select()}
                        onChange={e => updatePassenger(index, { age: e.target.value })}
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  {/* Fare & Net Fare */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Fare (Rs.) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-[#43ad4b]"
                        value={passenger.fare}
                        onFocus={(e) => e.target.select()}
                        onChange={e => updatePassenger(index, { fare: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Net Fare (Rs.) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-[#43ad4b]"
                        value={passenger.net_fare}
                        onFocus={(e) => e.target.select()}
                        onChange={e => updatePassenger(index, { net_fare: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Seat No */}
                  <div>
                    <label className={labelClass}>Seat No (Optional)</label>
                    <input
                      className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold outline-none focus:border-[#43ad4b]"
                      value={passenger.seat_no}
                      onChange={e => updatePassenger(index, { seat_no: e.target.value })}
                      placeholder="e.g. 12 or BOAT-14"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Totals Summary Box */}
          <div className="ml-auto grid w-full max-w-sm gap-2 rounded-2xl border border-[#a9d985] bg-[#f5fbea] p-4 text-xs shadow-xs">
            <div className="flex justify-between text-slate-700">
              <span className="font-bold">Actual Fare ({passengers.length} pax)</span>
              <strong>₹ {totals.actualFare.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-bold">Extra Charges</span>
              <strong>₹ {totals.additional.toFixed(2)}</strong>
            </div>
            <div className="mt-1 flex justify-between border-t border-[#a9d985] pt-2 text-sm font-black text-[#287a31]">
              <span>Net Fare (Total Paid)</span>
              <strong className="text-base">₹ {totals.total.toFixed(2)}</strong>
            </div>
          </div>
        </form>

        {/* Sticky Footer Actions */}
        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="aptdc-booking-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#43ad4b] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-[#43ad4b]/25 transition hover:bg-[#328a39] active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
            {isSubmitting ? 'Creating Booking...' : 'Create APTDC Booking'}
          </button>
        </footer>
      </div>
    </div>
  );
}
