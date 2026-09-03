'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  Phone,
  Mail,
  User,
  MessageSquare,
  ChevronRight,
  Check,
  Clock,
  MapPin,
  Building,
  Navigation,
  ShieldCheck,
  Globe,
} from 'lucide-react';

import { PreBookingPackage } from '../prebookingData';

interface Props {
  pkg: PreBookingPackage;
}

// ── Calendar constants ────────────────────────────────────────────────────────
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SEPT = { year: 2026, month: 8 }; // month 0-indexed

function daysInMonth(y: number, m: number) {
  if (m === 1 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) return 29;
  return MONTH_DAYS[m];
}

const CLOUDINARY_FALLBACKS: Record<string, string> = {
  'bhadrachalam-to-papikondalu-one-day-package':
    'https://res.cloudinary.com/r929tquv/image/upload/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp',
  'bhadrachalam-to-pochavaram-only-boat-point-package':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613527/ts_boat_tourism/packages/njh2in4fbo0vuwmjiczg.jpg',
  'bhadrachalam-to-papikondalu-maredumilli-resort-package-2days':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613500/ts_boat_tourism/packages/xolfujndmsrwgk22xqu2.jpg',
  'bhadrachalam-to-papikondalu-resort-package-2days':
    'https://res.cloudinary.com/r929tquv/image/upload/v1784613516/ts_boat_tourism/packages/ioijftrzlz2hzwera7y2.jpg',
};

const DEFAULT_TOUR_IMAGE =
  'https://res.cloudinary.com/r929tquv/image/upload/v1785917181/ts_boat_tourism/images/haotjawjrhmnnzvm7yqz.webp';

function getPackageImage(pkg: PreBookingPackage): string {
  if (pkg.cover_image_url && pkg.cover_image_url.trim() && pkg.cover_image_url.startsWith('http')) {
    return pkg.cover_image_url;
  }
  if (CLOUDINARY_FALLBACKS[pkg.slug]) {
    return CLOUDINARY_FALLBACKS[pkg.slug];
  }
  return DEFAULT_TOUR_IMAGE;
}

function getTypeLabel(type?: string) {
  if (type === 'TOUR') return 'Resort Stay';
  if (type === 'STAY') return 'Resort Stay';
  if (type === 'TRIP') return 'Boat Tour';
  return 'Tour Package';
}

// ── Office Details Section (At end of page) ───────────────────────────────────
function OfficeDetailsSection() {
  return (
    <section className="mt-10 bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-2xs text-[#0F3D56]">
      <div className="border-b border-gray-200 pb-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-white shrink-0 p-0.5">
            <Image
              src="/ts-boat-tourism-logo.png"
              alt="TS Boat Tourism Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#0F3D56]">
              TS Boat Tourism — Official Office
            </h4>
            <p className="text-xs text-gray-500">Bhadrachalam Head Booking Center</p>
          </div>
        </div>
        <a
          href="https://g.page/r/CcdqZmyXuAhxEAI"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-[#0F3D56] px-3 py-1.5 rounded-lg transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-[#1598a1]" />
          <span>View on Maps</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Address */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1598a1] uppercase tracking-wider mb-2">
            <Building className="w-3.5 h-3.5 shrink-0" />
            <span>Office Address</span>
          </div>
          <p className="text-xs font-bold text-[#0F3D56]">
            Door No. 10-1-2/1, Ground Floor
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Om Shanthi Building Sataram,<br />
            Kalyana Mandapam Road,<br />
            Bhadrachalam, Telangana — 507111
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1598a1] uppercase tracking-wider mb-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>Helpline Numbers</span>
          </div>
          <p className="text-xs font-bold text-[#0F3D56]">
            <a href="tel:+919951369573" className="hover:text-[#1598a1]">+91 99513 69573</a>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <a href="tel:+917780119268" className="hover:text-[#1598a1]">+91 77801 19268</a>
          </p>
          <p className="text-[11px] text-[#1598a1] mt-2 font-medium break-all">
            <a href="mailto:tstelanganatourism@gmail.com">tstelanganatourism@gmail.com</a>
          </p>
        </div>

        {/* Timings */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1598a1] uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Timings & Reporting</span>
          </div>
          <p className="text-xs font-bold text-[#0F3D56]">
            Office: 7:00 AM – 9:00 PM
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Open 7 Days a Week
          </p>
          <p className="text-[11px] text-[#1598a1] mt-2 font-semibold">
            Cruise Reporting: 7:00 AM – 7:30 AM
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Step Indicators ───────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ['Select Date', 'Your Details', 'Confirm'];
  return (
    <div className="flex items-center justify-center gap-0 mb-7">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${
                  done
                    ? 'bg-[#1598a1] text-white'
                    : active
                    ? 'bg-[#0F3D56] text-white ring-4 ring-[#0F3D56]/10'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-bold ${
                  active
                    ? 'text-[#0F3D56]'
                    : done
                    ? 'text-[#1598a1]'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mb-5 mx-2 transition-all ${
                  i < current ? 'bg-[#1598a1]' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Compact Calendar ──────────────────────────────────────────────────────────
function Calendar_({
  selected,
  onSelect,
  availability = {},
  requestedTickets = 1,
}: {
  selected: string;
  onSelect: (d: string) => void;
  availability?: Record<string, number>;
  requestedTickets?: number;
}) {
  const today = new Date();
  const { year, month } = SEPT;
  const total = daysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);

  const isSelected = (d: number) => {
    if (!selected) return false;
    const [sy, sm, sd] = selected.split('-').map(Number);
    return sy === year && sm - 1 === month && sd === d;
  };
  const isPast = (d: number) => new Date(year, month, d) < today;
  const isToday = (d: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d;

  const formatDate = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
      <div className="bg-[#0F3D56] text-white text-center py-3.5 px-4">
        <p className="font-extrabold text-sm tracking-wide flex items-center justify-center gap-2">
          <span>📅</span>
          <span>September 2026 Travel Dates</span>
        </p>
        <p className="text-[11px] text-white/75 mt-0.5">
          100 seats available per day · Click your preferred travel date below
        </p>
      </div>

      <div className="p-3 sm:p-4 bg-white">
        <div className="grid grid-cols-7 mb-1.5">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] sm:text-xs font-bold text-gray-400 py-1 uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} className="p-1" />;
            const past = isPast(day);
            const sel = isSelected(day);
            const tod = isToday(day);
            const dateStr = formatDate(day);
            const availableSeats = availability[dateStr] ?? 100;
            const isSoldOut = availableSeats <= 0;
            const isFillingFast = availableSeats > 0 && availableSeats <= 25;
            const cannotAccommodate = availableSeats > 0 && availableSeats < requestedTickets;

            return (
              <button
                key={day}
                type="button"
                disabled={past || isSoldOut}
                onClick={() => {
                  if (past || isSoldOut) return;
                  onSelect(dateStr);
                }}
                className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl transition-all relative min-h-[52px] sm:min-h-[58px] border text-center
                  ${
                    sel
                      ? 'bg-[#1598a1] text-white border-[#1598a1] shadow-sm ring-2 ring-[#1598a1]/30 font-bold'
                      : isSoldOut
                      ? 'bg-gray-100/80 border-gray-200 text-gray-400 cursor-not-allowed'
                      : cannotAccommodate
                      ? 'bg-amber-50/60 border-amber-200 text-gray-700 hover:border-amber-400 cursor-pointer'
                      : tod
                      ? 'bg-white border-[#1598a1] text-[#0F3D56] shadow-2xs hover:bg-[#f0faf9]'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#1598a1] hover:bg-[#f0faf9] cursor-pointer'
                  }
                `}
              >
                <span
                  className={`text-xs sm:text-sm font-black leading-tight ${
                    sel ? 'text-white' : 'text-[#0F3D56]'
                  }`}
                >
                  {day}
                </span>

                {/* Available seats count */}
                {isSoldOut ? (
                  <span className="text-[8px] sm:text-[9px] font-bold text-red-500 uppercase tracking-tight mt-0.5 leading-none">
                    Full
                  </span>
                ) : sel ? (
                  <span className="text-[8px] sm:text-[9px] font-semibold text-white/95 mt-0.5 leading-none">
                    {availableSeats} left
                  </span>
                ) : isFillingFast ? (
                  <span className="text-[8px] sm:text-[9px] font-bold text-amber-600 mt-0.5 leading-none">
                    {availableSeats} left
                  </span>
                ) : (
                  <span className="text-[8px] sm:text-[9px] font-medium text-[#1598a1] mt-0.5 leading-none">
                    {availableSeats} left
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Seat Capacity Info */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-[10px] sm:text-[11px] text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1598a1]" />
            <span className="font-semibold text-gray-700">100 seats / day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>&le; 25 left</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Full</span>
          </div>
        </div>
        <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
          Live Demand Updated
        </span>
      </div>
    </div>
  );
}

// ── Ticket Stepper ────────────────────────────────────────────────────
function Stepper({
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-bold text-[#0F3D56]">{label}</p>
        {sub && <p className="text-xs text-gray-600 font-medium mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg hover:border-[#1598a1] hover:text-[#1598a1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center font-black text-[#0F3D56] text-base">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg hover:border-[#1598a1] hover:text-[#1598a1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────
function SuccessScreen({
  pkg,
  date,
  adults,
  children,
  refId,
  waUrl,
  name,
}: {
  pkg: PreBookingPackage;
  date: string;
  adults: number;
  children: number;
  refId: string;
  waUrl: string;
  name: string;
}) {
  const travelDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const pax = `${adults} Adult${adults !== 1 ? 's' : ''}${
    children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''
  }`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Confirmation Card */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-[#0F3D56] px-6 py-7 text-center">
              <div className="w-14 h-14 bg-[#1598a1] rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Pre-Booking Confirmed!</h1>
              <p className="text-white/80 text-sm mt-1">
                PNR Number: <strong className="text-[#4dd9e4] font-black tracking-wider text-base sm:text-lg">{refId}</strong>
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                Hi <strong>{name.split(' ')[0]}</strong>! Your early pre-booking for{' '}
                <strong className="text-[#1598a1]">{pkg.title}</strong> has been registered. ✅<br />
                A confirmation email has been sent to your inbox. Our team will contact you within <strong>24 hours</strong> to verify and confirm your booking.
              </p>

              <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Booking Summary
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Package', value: pkg.title, highlight: true },
                    { label: 'Travel Date', value: travelDate, highlight: false },
                    { label: 'Travellers', value: pax, highlight: false },
                    { label: 'PNR Number', value: refId, highlight: true },
                    {
                      label: 'Status',
                      value: '✓ Registered · Awaiting Confirmation',
                      highlight: false,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-3 px-4 py-3">
                      <span className="text-xs text-gray-500 font-medium">
                        {row.label}
                      </span>
                      <span
                        className={`text-xs font-semibold text-right ${
                          row.highlight ? 'text-[#1598a1]' : 'text-[#0F3D56]'
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm py-3.5 px-5 rounded-xl w-full transition-colors shadow-2xs cursor-pointer"
                >
                  <span className="text-lg">💬</span>
                  <span>Contact Us on WhatsApp</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="tel:+919951369573"
                  className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-sm py-3 px-5 rounded-xl w-full hover:border-[#1598a1] hover:text-[#1598a1] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#1598a1]" />
                  <span>Call Office Helpline: +91 99513 69573</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Next Steps & Guarantees */}
          <div className="lg:col-span-5 mt-6 lg:mt-0 space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <p className="text-xs font-bold text-[#1598a1] mb-4 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1598a1]" />
                <span>What Happens Next?</span>
              </p>
              <div className="space-y-4">
                {[
                  {
                    n: '1',
                    t: 'Slot Under Review',
                    d: 'We check tour boat and stay availability for your travel date.',
                  },
                  {
                    n: '2',
                    t: 'Our Team Contacts You',
                    d: 'Call or WhatsApp within 24 hours to confirm group details.',
                  },
                  {
                    n: '3',
                    t: 'Lock in Your Booking',
                    d: 'Receive tickets & travel guide through our official portal.',
                  },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1598a1] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F3D56]">{s.t}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f0faf9] border border-[#1598a1]/25 rounded-2xl p-5 shadow-2xs">
              <p className="text-xs font-bold text-[#1598a1] mb-2 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1598a1]" />
                <span>Official Tourism Assurance</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                TS Boat Tourism is the authorized operator for Godavari river cruises, Kolluru &amp; Sirivaka bamboo huts, and temple tours. Your reservation request is saved with high priority.
              </p>
              <div className="flex gap-3 mt-4 pt-3 border-t border-[#1598a1]/20">
                <Link
                  href="/prebooking"
                  className="flex-1 text-center border border-gray-200 bg-white text-gray-700 font-semibold text-xs py-2.5 rounded-xl hover:border-[#1598a1] hover:text-[#1598a1] transition-colors"
                >
                  ← More Packages
                </Link>
                <Link
                  href="/"
                  className="flex-1 text-center bg-[#0F3D56] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#1598a1] transition-colors"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <OfficeDetailsSection />
      </div>
    </div>
  );
}

// ── Sticky Reservation Summary Sidebar ─────────────────────────────────────────
function ReservationSummarySidebar({
  pkg,
  selectedDate,
  travelDateDisplay,
  adults,
  children,
  availableSeats,
}: {
  pkg: PreBookingPackage;
  selectedDate: string;
  travelDateDisplay: string;
  adults: number;
  children: number;
  availableSeats: number | null;
}) {
  const totalTickets = adults + children;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
          <Image
            src={getPackageImage(pkg)}
            alt={pkg.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 420px"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-white/95 text-[#1598a1] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-[#1598a1]/20">
              {getTypeLabel(pkg.type)}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-[#1598a1] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Sep 2026 Season
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h3 className="font-extrabold text-[#0F3D56] text-base leading-snug">
            {pkg.title}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {pkg.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1598a1]" />
                {pkg.duration}
              </span>
            )}
            {pkg.place && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1598a1]" />
                {pkg.place.split('-')[0].trim()}
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Live Selection Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1598a1]" />
                Travel Date
              </span>
              <span className="font-bold text-[#0F3D56] text-right">
                {selectedDate ? travelDateDisplay : 'Select a date'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1598a1]" />
                Travellers
              </span>
              <span className="font-bold text-[#0F3D56]">
                {totalTickets} ({adults} Adult{adults > 1 ? 's' : ''}
                {children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''})
              </span>
            </div>

            {/* Live Pricing Breakdown */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1.5 text-xs">
              {pkg.adult_price ? (
                <div className="flex justify-between text-gray-600">
                  <span>{adults} Adult{adults > 1 ? 's' : ''} × ₹{pkg.adult_price.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-[#0F3D56]">₹{(adults * pkg.adult_price).toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              {children > 0 && pkg.child_price ? (
                <div className="flex justify-between text-gray-600">
                  <span>{children} Child{children > 1 ? 'ren' : ''} × ₹{pkg.child_price.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-[#0F3D56]">₹{(children * pkg.child_price).toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              {pkg.adult_price ? (
                <div className="border-t border-gray-200 pt-1.5 flex justify-between font-extrabold text-[#0F3D56]">
                  <span>Estimated Total</span>
                  <span className="text-sm text-[#1598a1]">
                    ₹{((adults * pkg.adult_price) + (children * (pkg.child_price || 0))).toLocaleString('en-IN')}
                  </span>
                </div>
              ) : null}
            </div>

            {selectedDate && availableSeats !== null && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-gray-400 font-medium">Daily Capacity</span>
                <span className={`font-bold ${availableSeats <= 25 ? 'text-amber-600' : 'text-[#1598a1]'}`}>
                  {availableSeats} of 100 seats left
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Pricing Guarantee */}
          <div className="bg-[#f0faf9] border border-[#1598a1]/25 rounded-xl p-3.5 text-center">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#1598a1]">
              Free Reservation Guarantee
            </p>
            <p className="text-base font-black text-[#0F3D56] mt-0.5">
              100% Free · Zero Deposit
            </p>
            {pkg.adult_price && pkg.child_price ? (
              <p className="text-[11px] text-gray-600 mt-1 font-medium">
                ₹{pkg.adult_price.toLocaleString('en-IN')} / Adult · ₹{pkg.child_price.toLocaleString('en-IN')} / Child
              </p>
            ) : pkg.starting_price && pkg.starting_price > 0 ? (
              <p className="text-[11px] text-gray-500 mt-1">
                Tour fare: ₹{pkg.starting_price.toLocaleString('en-IN')}/person
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Trust Badges Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
          Booking Benefits &amp; Guarantee
        </p>
        <div className="space-y-2.5 text-xs text-gray-600">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1598a1] shrink-0 mt-0.5" />
            <span>Govt. Authorized Telangana Tourism Booking Center</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#1598a1] shrink-0 mt-0.5" />
            <span>Instant PNR Number &amp; email confirmation</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#1598a1] shrink-0 mt-0.5" />
            <span>Dedicated coordinator calls within 24 hours</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <a
            href="https://wa.me/919951369573?text=Hello%20TS%20Boat%20Tourism!%20I%20have%20a%20question%20about%20pre-booking."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold py-3 px-3 rounded-xl transition-colors w-full shadow-2xs"
          >
            <span>💬</span>
            <span>Need Help? Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Booking Flow Component ───────────────────────────────────────────────
export default function BookingFlowClient({ pkg }: Props) {
  const [step, setStep] = useState(0); // 0: date, 1: details, 2: confirm
  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [result, setResult] = useState<{ refId: string; waUrl: string } | null>(
    null
  );
  const [availability, setAvailability] = useState<Record<string, number>>({});

  const topRef = useRef<HTMLDivElement>(null);

  const fetchAvailability = useCallback(() => {
    fetch(`/api/v1/pre-bookings/availability?package_id=${encodeURIComponent(pkg.slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.availability) {
          setAvailability(data.availability);
        }
      })
      .catch(() => {});
  }, [pkg.slug]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const scrollTop = () =>
    setTimeout(
      () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      50
    );

  // Step 0 → 1 validation
  const goToStep1 = () => {
    if (!selectedDate) {
      setErrors({ date: 'Please select a travel date to continue.' });
      return;
    }
    const avail = availability[selectedDate] ?? 100;
    const requested = adults + children;
    if (avail <= 0) {
      setErrors({ date: 'This travel date is fully booked. Please choose another date.' });
      return;
    }
    if (requested > avail) {
      setErrors({
        date: `Only ${avail} seat${avail === 1 ? '' : 's'} available on this date. You requested ${requested} tickets.`,
      });
      return;
    }
    setErrors({});
    setStep(1);
    scrollTop();
  };

  // Step 1 validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Please enter your full name.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address.';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10)
      errs.phone = 'Enter a valid 10-digit phone number.';
    return errs;
  };

  const goToStep2 = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
    scrollTop();
  };

  const handleSubmit = async () => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const cleanDigits = form.phone.replace(/\D/g, '');
      const normalizedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : form.phone.trim();

      const res = await fetch('/api/v1/pre-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: pkg.slug,
          package_name: pkg.title,
          travel_date: selectedDate,
          adult_count: adults,
          child_count: children,
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          customer_phone: normalizedPhone,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.pnr_number || data.ref_id)) {
        setResult({ refId: data.pnr_number || data.ref_id, waUrl: data.whatsapp_url });
        setAvailability((prev) => ({
          ...prev,
          [selectedDate]: Math.max(0, (prev[selectedDate] ?? 100) - (adults + children)),
        }));
      } else {
        setApiError(
          data.detail || data.message || 'Something went wrong. Please try again.'
        );
      }
    } catch {
      setApiError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const travelDateDisplay = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const paxDisplay = `${adults} Adult${adults !== 1 ? 's' : ''}${
    children > 0 ? ` + ${children} Child${children > 1 ? 'ren' : ''}` : ''
  }`;

  const phoneDisplay = form.phone.trim().startsWith('+91')
    ? form.phone.trim()
    : `+91 ${form.phone.trim()}`;

  // ── Success View ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <SuccessScreen
        pkg={pkg}
        date={selectedDate}
        adults={adults}
        children={children}
        refId={result.refId}
        waUrl={result.waUrl}
        name={form.name}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7]" ref={topRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/prebooking"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1598a1] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <span>Back to all packages</span>
        </Link>

        {/* 2-Column Responsive Split Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Main Booking Column (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Package Overview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
                <div className="relative w-full sm:w-48 aspect-[16/10] sm:aspect-auto sm:h-36 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={getPackageImage(pkg)}
                    alt={pkg.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 200px"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/95 text-[#1598a1] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-[#1598a1]/20">
                      {getTypeLabel(pkg.type)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-1.5 bg-[#1598a1]/10 text-[#1598a1] text-[10px] font-bold px-2.5 py-0.5 rounded-md mb-2 w-fit">
                    <span className="w-1.5 h-1.5 bg-[#1598a1] rounded-full animate-pulse" />
                    <span>Sep 2026 Pre-Booking Open · 100 Seats/Day</span>
                  </div>
                  <h1 className="font-extrabold text-[#0F3D56] text-xl sm:text-2xl leading-tight">
                    {pkg.title}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                    {pkg.duration && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#1598a1]" />
                        <span>{pkg.duration}</span>
                      </span>
                    )}
                    {pkg.place && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#1598a1]" />
                        <span>{pkg.place}</span>
                      </span>
                    )}
                  </div>
                  {pkg.starting_price && pkg.starting_price > 0 && (
                    <p className="text-base font-black text-[#0F3D56] mt-2.5">
                      ₹{pkg.starting_price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-gray-400 ml-1.5">
                        / person onwards (100% Free Reservation)
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Steps Progress */}
            <Steps current={step} />

            {/* ── STEP 0: DATE & TICKETS ── */}
            {step === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-2xs">
                <h2 className="font-bold text-[#0F3D56] text-base mb-1">
                  Choose Your Travel Date &amp; Tickets
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Select when you&apos;d like to travel in September 2026 and how many tickets are required.
                </p>

                {/* Ticket count (2-column on tablet/desktop) */}
                <div className="border border-gray-200 rounded-xl p-4 sm:p-5 mb-6 bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1598a1]" />
                    <span>Number of Tickets</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-2">
                      <Stepper
                        label="Adults"
                        sub={pkg.adult_price ? `12+ years · ₹${pkg.adult_price.toLocaleString('en-IN')}/person` : '12+ years'}
                        value={adults}
                        min={1}
                        max={30}
                        onChange={setAdults}
                      />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-2">
                      <Stepper
                        label="Children"
                        sub={pkg.child_price ? `5–11 years · ₹${pkg.child_price.toLocaleString('en-IN')}/child` : '5–11 years'}
                        value={children}
                        min={0}
                        max={20}
                        onChange={setChildren}
                      />
                    </div>
                  </div>

                  {pkg.adult_price ? (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <span>Estimated Fare:</span>
                        <span className="text-gray-400">({adults}A{children > 0 ? ` + ${children}C` : ''})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#0F3D56] text-sm sm:text-base">
                          ₹{((adults * pkg.adult_price) + (children * (pkg.child_price || 0))).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-[#1598a1] ml-1.5 bg-[#f0faf9] border border-[#1598a1]/20 px-2 py-0.5 rounded">
                          Free Reservation
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <p className="text-[10px] text-gray-400 mt-2.5">
                    Children under 5 years travel free · No advance deposit required
                  </p>
                </div>

                {/* The Full Width Spacious Calendar */}
                <Calendar_
                  selected={selectedDate}
                  availability={availability}
                  requestedTickets={adults + children}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setErrors({});
                  }}
                />

                {selectedDate && (
                  <div className="mt-5 bg-[#f0faf9] border border-[#1598a1]/25 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#1598a1] shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Selected Travel Date</p>
                        <p className="text-sm font-bold text-[#0F3D56]">{travelDateDisplay}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#1598a1] bg-white border border-[#1598a1]/30 px-3 py-1 rounded-lg">
                        {availability[selectedDate] ?? 100} of 100 seats available
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDate('')}
                        className="text-gray-300 hover:text-gray-500 text-lg leading-none cursor-pointer"
                        aria-label="Clear date"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {errors.date && (
                  <p className="mt-3 text-xs text-red-500 flex items-center gap-1.5">
                    ⚠️ {errors.date}
                  </p>
                )}

                <div className="mt-7 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={goToStep1}
                    disabled={!selectedDate}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#0F3D56] hover:bg-[#1598a1] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <span>Continue to Your Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 1: DETAILS ── */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-2xs">
                <h2 className="font-bold text-[#0F3D56] text-base mb-1">Enter Your Details</h2>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ll send your pre-booking confirmation email and our team will contact you.
                </p>

                {/* Summary bar */}
                <div className="bg-[#f0faf9] border border-[#1598a1]/25 rounded-xl px-4 py-3 mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Travel Date</p>
                    <p className="text-sm font-bold text-[#0F3D56] mt-0.5">{travelDateDisplay}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Travellers</p>
                    <p className="text-sm font-bold text-[#0F3D56] mt-0.5">{paxDisplay}</p>
                  </div>
                </div>

                {/* Form fields: 2-column for Name & Phone */}
                <div className="space-y-4.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="pb-name" className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 select-none">
                        <User className="w-4 h-4 text-[#1598a1] shrink-0" />
                        <span>
                          Full Name <span className="text-red-500 font-bold">*</span>
                        </span>
                      </label>
                      <input
                        id="pb-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, name: e.target.value }));
                          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                        }}
                        placeholder="e.g. Ramesh Kumar"
                        className={`w-full border rounded-xl px-4 py-3 text-sm text-[#0F3D56] placeholder-gray-300 outline-none transition-colors focus:border-[#1598a1] ${
                          errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        autoComplete="name"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠️ {errors.name}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="pb-phone" className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 select-none">
                        <Phone className="w-4 h-4 text-[#1598a1] shrink-0" />
                        <span>
                          Phone Number <span className="text-red-500 font-bold">*</span>
                        </span>
                      </label>
                      <div className={`flex rounded-xl border bg-white overflow-hidden transition-colors ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus-within:border-[#1598a1]'
                      }`}>
                        <span className="inline-flex items-center px-3.5 bg-gray-50 border-r border-gray-200 text-sm font-bold text-gray-600 select-none">
                          +91
                        </span>
                        <input
                          id="pb-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, phone: e.target.value }));
                            if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                          }}
                          placeholder="99513 69573"
                          className="w-full px-3.5 py-3 text-sm text-[#0F3D56] placeholder-gray-300 outline-none bg-transparent"
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠️ {errors.phone}</p>}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="pb-email" className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 select-none">
                      <Mail className="w-4 h-4 text-[#1598a1] shrink-0" />
                      <span>
                        Email Address <span className="text-red-500 font-bold">*</span>
                      </span>
                    </label>
                    <input
                      id="pb-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, email: e.target.value }));
                        if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                      }}
                      placeholder="yourname@gmail.com"
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-[#0F3D56] placeholder-gray-300 outline-none transition-colors focus:border-[#1598a1] ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠️ {errors.email}</p>}
                    <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5">
                      <span className="text-xs text-[#1598a1]">📧</span>
                      <span>Confirmation email with your PNR number will be dispatched to this address</span>
                    </p>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label htmlFor="pb-notes" className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2 select-none">
                      <MessageSquare className="w-4 h-4 text-[#1598a1] shrink-0" />
                      <span>
                        Special Requests <span className="text-gray-400 font-normal">(optional)</span>
                      </span>
                    </label>
                    <textarea
                      id="pb-notes"
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any specific preferences, senior citizen assistance, or pickup queries..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0F3D56] placeholder-gray-300 outline-none focus:border-[#1598a1] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 mt-8 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(0);
                      setErrors({});
                      scrollTop();
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={goToStep2}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F3D56] hover:bg-[#1598a1] text-white font-bold text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <span>Review &amp; Confirm</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: CONFIRM ── */}
            {step === 2 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-2xs">
                <h2 className="font-bold text-[#0F3D56] text-base mb-1">Review &amp; Confirm</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Please verify your information before submitting your free pre-booking.
                </p>

                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Pre-Booking Summary
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[
                      { label: 'Package', value: pkg.title, highlight: true },
                      { label: 'Travel Date', value: travelDateDisplay },
                      { label: 'Travellers', value: paxDisplay },
                      ...(pkg.adult_price ? [{
                        label: 'Estimated Fare',
                        value: `₹${((adults * pkg.adult_price) + (children * (pkg.child_price || 0))).toLocaleString('en-IN')} (Adult: ₹${pkg.adult_price}${pkg.child_price ? `, Child: ₹${pkg.child_price}` : ''})`,
                      }] : []),
                      { label: 'Name', value: form.name },
                      { label: 'Phone', value: phoneDisplay },
                      { label: 'Email', value: form.email },
                      ...(form.notes ? [{ label: 'Notes', value: form.notes }] : []),
                      { label: 'Payment', value: '100% Free · Zero Deposit Required' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-3 px-4 py-3">
                        <span className="text-xs text-gray-400 font-medium shrink-0">
                          {row.label}
                        </span>
                        <span
                          className={`text-xs font-semibold text-right ${
                            (row as { highlight?: boolean }).highlight
                              ? 'text-[#1598a1]'
                              : 'text-[#0F3D56]'
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f0faf9] border border-[#1598a1]/25 rounded-xl p-4 mb-6">
                  <p className="text-xs text-[#0F3D56] leading-relaxed">
                    🔒 <strong>This is a 100% free pre-booking reservation.</strong> No deposit or credit card required. Our team will contact you at <strong>{phoneDisplay}</strong> within 24 hours to confirm date openings and assist with travel arrangements.
                  </p>
                </div>

                {apiError && (
                  <div className="border border-red-200 bg-red-50 rounded-xl p-4 mb-4 text-xs text-red-600 flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrors({});
                      scrollTop();
                    }}
                    className="order-2 sm:order-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-semibold text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2.5 px-6 py-4 sm:py-3.5 rounded-xl bg-[#0F3D56] hover:bg-[#1598a1] active:bg-[#0c2e40] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm sm:text-base transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Pre-Booking...</span>
                      </>
                    ) : (
                      <>
                        <span className="tracking-wide">Confirm Pre-Booking</span>
                        <span className="w-5 h-5 rounded-full bg-[#1598a1] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-2xs">
                          ✓
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Reservation Summary & Trust Sidebar (desktop only, hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-4 lg:mt-0 lg:sticky lg:top-24">
            <ReservationSummarySidebar
              pkg={pkg}
              selectedDate={selectedDate}
              travelDateDisplay={travelDateDisplay}
              adults={adults}
              children={children}
              availableSeats={selectedDate ? (availability[selectedDate] ?? 100) : null}
            />
          </div>
        </div>

        {/* Quick contact helper under the columns */}
        <div className="text-center text-xs text-gray-500 mt-10 mb-2 flex items-center justify-center gap-2 flex-wrap">
          <span>Need help with pre-booking?</span>
          <a href="tel:+919951369573" className="inline-flex items-center gap-1 font-bold text-[#1598a1] hover:underline">
            <Phone className="w-3 h-3" />
            <span>+91 99513 69573</span>
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="https://wa.me/919951369573?text=Hello%20TS%20Boat%20Tourism!%20I%20need%20help%20with%20pre-booking."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#25D366] hover:underline"
          >
            <span>💬 WhatsApp</span>
          </a>
        </div>

        {/* Full office address & details at end of page */}
        <OfficeDetailsSection />
      </div>
    </div>
  );
}
