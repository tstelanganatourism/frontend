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
}: {
  label?: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  allowPast?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const baseDate = useMemo(() => {
    if (value) return new Date(value);
    if (min) return new Date(min);
    return new Date();
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

  const handleDaySelect = (day: number) => {
    onChange(toYYYYMMDD(calYear, calMonth, day));
    setIsOpen(false);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else { setCalMonth(calMonth + 1); }
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!allowPast) {
      const minD = min ? new Date(min) : new Date();
      if (calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth())) return;
    }
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else { setCalMonth(calMonth - 1); }
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    const minDateStr = min ? min : new Date().toISOString().slice(0, 10);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toYYYYMMDD(calYear, calMonth, i);
      const isPast = !allowPast && dateStr < minDateStr;
      const isSelected = dateStr === value;
      days.push(
        <button
          key={i}
          type="button"
          disabled={isPast}
          onClick={() => handleDaySelect(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isPast ? 'text-slate-200 cursor-not-allowed line-through' : isSelected ? 'bg-[#1a6b7a] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100 cursor-pointer'}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const formattedDate = value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left rounded-lg border px-3 py-2 text-sm font-semibold transition-all h-[42px] flex items-center gap-2 ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-85 text-slate-400' : 'bg-white border-slate-300 cursor-pointer hover:border-[#1a6b7a] focus:border-[#1a6b7a] focus:ring-1 focus:ring-[#1a6b7a]'}`}
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
