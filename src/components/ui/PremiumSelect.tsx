'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface PremiumSelectOption {
  value: string | number;
  label: string;
}

interface PremiumSelectProps {
  value: string | number | null | undefined;
  options: PremiumSelectOption[];
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export default function PremiumSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  label,
  error,
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        disabled={disabled}
        title={selectedOption ? (selectedOption.label?.trim() || 'Unnamed Option') : placeholder}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold text-slate-800 transition-all outline-none text-left cursor-pointer ${
          disabled 
            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-[#5ac4d7] bg-white ring-2 ring-[#5ac4d7]/15 shadow-md shadow-[#5ac4d7]/5'
            : 'border-slate-200 bg-white hover:border-[#5ac4d7]/50 shadow-sm'
        } ${error ? 'border-red-300 ring-2 ring-red-100' : ''}`}
      >
        <span className={!selectedOption ? 'text-slate-400 font-medium' : 'text-slate-800 font-bold'}>
          {selectedOption ? (selectedOption.label?.trim() || 'Unnamed Option') : placeholder}
        </span>
        <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#5ac4d7]' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-60 overflow-y-auto">
            {safeOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">No options available</div>
            ) : (
              safeOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label?.trim() || 'Unnamed Option'}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`flex flex-row items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#5ac4d7]/10 text-[#0f3d56]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{opt.label?.trim() || 'Unnamed Option'}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#0f3d56] shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
