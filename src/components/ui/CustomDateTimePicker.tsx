'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, X, Check, Sparkles } from 'lucide-react';

interface CustomDateTimePickerProps {
  label?: string;
  value: string; // ISO format: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDateTimePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date & time',
  disabled = false,
  required = false,
  className = '',
}: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse current value or fallback
  const parsed = useMemo(() => {
    if (value && value.includes('T')) {
      const [datePart, timePart] = value.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [hh, mm] = timePart.split(':').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return {
          year: y,
          month: m - 1,
          day: d,
          hour24: isNaN(hh) ? 12 : hh,
          minute: isNaN(mm) ? 0 : mm,
        };
      }
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour24: now.getHours(),
      minute: Math.floor(now.getMinutes() / 5) * 5,
    };
  }, [value]);

  // Working state when modal is open
  const [workYear, setWorkYear] = useState(parsed.year);
  const [workMonth, setWorkMonth] = useState(parsed.month);
  const [workDay, setWorkDay] = useState(parsed.day);
  const [workHour12, setWorkHour12] = useState(() => {
    const h = parsed.hour24 % 12;
    return h === 0 ? 12 : h;
  });
  const [workMinute, setWorkMinute] = useState(parsed.minute);
  const [workAmPm, setWorkAmPm] = useState<'AM' | 'PM'>(() => (parsed.hour24 >= 12 ? 'PM' : 'AM'));

  // Sync working state when opening
  useEffect(() => {
    if (isOpen) {
      setWorkYear(parsed.year);
      setWorkMonth(parsed.month);
      setWorkDay(parsed.day);
      const h = parsed.hour24 % 12;
      setWorkHour12(h === 0 ? 12 : h);
      setWorkMinute(parsed.minute);
      setWorkAmPm(parsed.hour24 >= 12 ? 'PM' : 'AM');
    }
  }, [isOpen, parsed]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (workMonth === 0) {
      setWorkMonth(11);
      setWorkYear(workYear - 1);
    } else {
      setWorkMonth(workMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (workMonth === 11) {
      setWorkMonth(0);
      setWorkYear(workYear + 1);
    } else {
      setWorkMonth(workMonth + 1);
    }
  };

  const handleApply = () => {
    let h24 = workHour12 % 12;
    if (workAmPm === 'PM') h24 += 12;
    const yStr = String(workYear);
    const mStr = String(workMonth + 1).padStart(2, '0');
    const dStr = String(workDay).padStart(2, '0');
    const hhStr = String(h24).padStart(2, '0');
    const mmStr = String(workMinute).padStart(2, '0');
    const result = `${yStr}-${mStr}-${dStr}T${hhStr}:${mmStr}`;
    onChange(result);
    setIsOpen(false);
  };

  const handleSetNow = () => {
    const now = new Date();
    setWorkYear(now.getFullYear());
    setWorkMonth(now.getMonth());
    setWorkDay(now.getDate());
    const h = now.getHours();
    setWorkAmPm(h >= 12 ? 'PM' : 'AM');
    const h12 = h % 12;
    setWorkHour12(h12 === 0 ? 12 : h12);
    setWorkMinute(now.getMinutes());
  };

  // Formatted display
  const displayString = useMemo(() => {
    if (!value || !value.includes('T')) return '';
    try {
      const [dPart, tPart] = value.split('T');
      const [y, m, d] = dPart.split('-').map(Number);
      const [hh, mm] = tPart.split(':').map(Number);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return value;
      const dateObj = new Date(y, m - 1, d, hh || 0, mm || 0);
      return dateObj.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return value;
    }
  }, [value]);

  const daysInCurrentMonth = getDaysInMonth(workYear, workMonth);
  const firstDayOfWeek = getFirstDayOfMonth(workYear, workMonth);

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
          {label} {required && <span className="text-emerald-600">*</span>}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`mt-1 flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm font-semibold transition outline-none ${
          disabled
            ? 'cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
            : isOpen
            ? 'border-[#43ad4b] ring-2 ring-[#43ad4b]/20 text-slate-900 shadow-sm'
            : 'border-slate-300 text-slate-800 hover:border-[#43ad4b] focus:border-[#43ad4b] focus:ring-2 focus:ring-[#43ad4b]/15'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarDays className="h-4 w-4 text-[#43ad4b] shrink-0" />
          <span className={displayString ? 'font-bold text-slate-900' : 'text-slate-400 font-normal'}>
            {displayString || placeholder}
          </span>
        </span>
        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {/* Custom styled modal popover */}
      {isOpen && isMounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#287a31] to-[#3a9e44] px-5 py-3.5 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <CalendarDays className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-100">APTDC Calendar</h3>
                  <p className="text-sm font-black text-white">
                    {workDay} {MONTHS[workMonth]} {workYear} • {String(workHour12).padStart(2, '0')}:{String(workMinute).padStart(2, '0')} {workAmPm}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Close date picker"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Month Switcher */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-1.5 border border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white hover:shadow-sm"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-black tracking-wide text-slate-800">
                  {MONTHS[workMonth]} {workYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white hover:shadow-sm"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  {DAYS_OF_WEEK.map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}

                  {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected = workDay === dayNum;
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setWorkDay(dayNum)}
                        className={`h-8 w-full rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#43ad4b] text-white font-black shadow-md shadow-[#43ad4b]/30 scale-105'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selector */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-[#287a31]" /> Time Selection
                  </span>
                  <button
                    type="button"
                    onClick={handleSetNow}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-[#287a31] hover:underline"
                  >
                    <Sparkles className="h-3 w-3" /> Set to Now
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Hour */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Hour</label>
                    <select
                      value={workHour12}
                      onChange={e => setWorkHour12(Number(e.target.value))}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs font-bold text-slate-800 outline-none focus:border-[#43ad4b]"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Minute */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Minute</label>
                    <select
                      value={workMinute}
                      onChange={e => setWorkMinute(Number(e.target.value))}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs font-bold text-slate-800 outline-none focus:border-[#43ad4b]"
                    >
                      {Array.from({ length: 60 }, (_, i) => i).map(m => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>

                  {/* AM / PM */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Period</label>
                    <div className="flex h-9 rounded-lg border border-slate-300 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setWorkAmPm('AM')}
                        className={`flex-1 rounded-md text-[11px] font-black transition ${
                          workAmPm === 'AM' ? 'bg-[#43ad4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkAmPm('PM')}
                        className={`flex-1 rounded-md text-[11px] font-black transition ${
                          workAmPm === 'PM' ? 'bg-[#43ad4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Common quick time presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[
                    { label: '06:00 AM', h: 6, m: 0, ap: 'AM' },
                    { label: '08:30 AM', h: 8, m: 30, ap: 'AM' },
                    { label: '11:00 AM', h: 11, m: 0, ap: 'AM' },
                    { label: '05:30 PM', h: 5, m: 30, ap: 'PM' },
                    { label: '07:00 PM', h: 7, m: 0, ap: 'PM' },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setWorkHour12(preset.h);
                        setWorkMinute(preset.m);
                        setWorkAmPm(preset.ap as 'AM' | 'PM');
                      }}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:border-[#43ad4b] hover:text-[#287a31] transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#43ad4b] px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-[#328a39] active:scale-95 transition"
              >
                <Check className="h-3.5 w-3.5" />
                Set Date &amp; Time
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
