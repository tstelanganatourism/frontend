'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface PremiumMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function PremiumMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  className = ''
}: PremiumMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        className="min-h-[56px] w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-3 text-sm font-semibold outline-none transition-all cursor-pointer flex flex-wrap items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span key={opt.value} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold">
              {opt.label}
              <X 
                className="h-3 w-3 hover:text-emerald-950" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(opt.value);
                }} 
              />
            </span>
          ))
        )}
        <div className="ml-auto">
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-xl">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div 
                key={option.value}
                className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleToggle(option.value)}
              >
                <div className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm font-bold text-slate-700">{option.label}</span>
              </div>
            );
          })}
          {options.length === 0 && (
            <div className="px-5 py-4 text-sm text-slate-400 font-medium">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}
