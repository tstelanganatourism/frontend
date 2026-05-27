'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((opt) => String(opt.value) === String(value));

  const filteredOptions = safeOptions.filter(opt => 
    (opt.label || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => { setIsOpen(false); setSearchQuery(''); }} />
          <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[300px]">
            {/* Search Input */}
            <div className="sticky top-0 bg-white pb-1.5 z-10 px-1 pt-1 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] transition-all"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-xs text-slate-400 text-center font-medium">No results found</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label?.trim() || 'Unnamed Option'}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`flex flex-row items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer text-left mb-1 last:mb-0 ${
                        isSelected
                          ? 'bg-[#5ac4d7]/10 text-[#0f3d56]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="whitespace-normal break-words pr-2 leading-relaxed">{opt.label?.trim() || 'Unnamed Option'}</span>
                      {isSelected && <Check className="h-4 w-4 text-[#0f3d56] shrink-0 ml-2 mt-0.5 self-start" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
