'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export const CustomDatePicker = ({
  label,
  value,
  min,
  onChange,
  placeholder = 'Select Date',
  disabled = false,
  align = 'left',
  allowPast = false,
  availableDates,
  onMonthChange,
  isAdmin = false,
}: {
  label?: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  allowPast?: boolean;
  availableDates?: Set<string>;
  onMonthChange?: (monthStr: string) => void;
  isAdmin?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseDateLocal = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const baseDate = useMemo(() => {
    if (value) return parseDateLocal(value);
    if (min) return parseDateLocal(min);
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  }, [value, min]);

  const [calYear, setCalYear] = useState(baseDate.getFullYear());
  const [calMonth, setCalMonth] = useState(baseDate.getMonth());

  useEffect(() => {
    setCalYear(baseDate.getFullYear());
    setCalMonth(baseDate.getMonth());
  }, [baseDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const toYYYYMMDD = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };
  const todayIST = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  };

  const getLocalToday = () => {
    const d = todayIST();
    return toYYYYMMDD(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const handleDaySelect = (day: number) => {
    onChange(toYYYYMMDD(calYear, calMonth, day));
    setIsOpen(false);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    let y = calYear;
    let m = calMonth + 1;
    if (m === 12) { m = 0; y = y + 1; }
    setCalMonth(m); setCalYear(y);
    if (onMonthChange) onMonthChange(`${y}-${String(m + 1).padStart(2, '0')}`);
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!allowPast) {
      const minD = min ? parseDateLocal(min) : todayIST();
      if (calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth())) return;
    }
    let y = calYear;
    let m = calMonth - 1;
    if (m === -1) { m = 11; y = y - 1; }
    setCalMonth(m); setCalYear(y);
    if (onMonthChange) onMonthChange(`${y}-${String(m + 1).padStart(2, '0')}`);
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    const minDateStr = min ? min : getLocalToday();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toYYYYMMDD(calYear, calMonth, i);
      const isPast = !allowPast && dateStr < minDateStr;
      
      // Check availableDates (admins can bypass)
      const isUnavailable = !isAdmin && availableDates !== undefined && !availableDates.has(dateStr);
      
      const isDisabled = isPast || isUnavailable;
      const isSelected = dateStr === value;
      
      days.push(
        <button
          key={i}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDaySelect(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isPast ? 'text-slate-200 cursor-not-allowed line-through' : isUnavailable ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : isSelected ? 'bg-[#1a6b7a] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100 cursor-pointer'}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const formattedDate = value ? parseDateLocal(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all h-[42px] flex items-center gap-2 outline-none ${
          disabled 
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-85 text-slate-400' 
            : isOpen
            ? 'border-[#1a6b7a] bg-white ring-2 ring-[#1a6b7a]/15 shadow-md shadow-[#1a6b7a]/5 text-slate-900 font-extrabold'
            : 'border-slate-200 bg-white hover:border-[#1a6b7a]/50 text-slate-800'
        }`}
      >
        <CalendarDays className="h-4 w-4 text-[#1a6b7a]" />
        <span>{formattedDate}</span>
      </button>
      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} top-[calc(100%+6px)] z-50 rounded-xl border border-slate-150 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 w-[330px]`}>
          <div className="flex justify-between items-center mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#1a6b7a] transition-all disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider">{monthNames[calMonth]} {calYear}</div>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#1a6b7a] transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-8 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 justify-items-center">{renderDays()}</div>
        </div>
      )}
    </div>
  );
};
