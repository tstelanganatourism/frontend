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
  const [openUpward, setOpenUpward] = useState(false);
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

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than 280px, open upward
      setOpenUpward(spaceBelow < 280);
    }
    setIsOpen(!isOpen);
  };

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
        onClick={handleToggle}
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
          <div className="fixed inset-0 z-[9990] cursor-default" onClick={() => { setIsOpen(false); setSearchQuery(''); }} />
          <div className={`absolute left-0 right-0 z-[9999] rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in fade-in duration-150 flex flex-col max-h-[280px] ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
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

            {/* Options List */}
            <div className="overflow-y-auto flex-1 space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-slate-200">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs font-semibold text-slate-400">
                  No options match "{searchQuery}"
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = String(option.value) === String(value);
                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#5ac4d7]/10 text-[#0f3d56]'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-[#1598a1] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
