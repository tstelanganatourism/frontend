'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function SortDropdown({ options, value, onChange, label = 'Sort By', disabled = false }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[var(--color-brand-river)] shadow-sm transition-all hover:border-[var(--color-brand-teal)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">
            {label}
          </span>
          {selectedOption.label}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 origin-bottom overflow-hidden rounded-xl border border-border bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="py-1">
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                disabled={disabled}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  value === option.value
                    ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
                {value === option.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
