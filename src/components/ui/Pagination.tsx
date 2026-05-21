'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';

function CustomPageSizeSelect({ 
  value, 
  options, 
  onChange 
}: {
  value: number;
  options: number[];
  onChange: (val: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer shadow-sm hover:border-slate-300 transition-all outline-none justify-between min-w-[60px]"
      >
        <span>{value}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-full mb-1.5 z-50 rounded-xl border border-slate-150 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150 min-w-[70px]">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-center px-2 py-2 rounded-lg text-xs font-black cursor-pointer transition-all ${
                  opt === value
                    ? 'bg-[#5ac4d7]/10 text-[#0f3d56]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) {
  const safeTotalItems = Number(totalItems) || 0;
  const safePageSize = Number(pageSize) || 10;
  const safeCurrentPage = Number(currentPage) || 1;

  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
  
  // Calculate range showing
  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;
  const endItem = Math.min(safeTotalItems, safeCurrentPage * safePageSize);

  // Generate page numbers to display (sliding window of 5 pages)
  const maxVisiblePages = 5;
  let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white/50 px-6 py-4 backdrop-blur-sm">
      {/* Items Range Info */}
      <div className="text-xs font-bold text-slate-500 order-2 sm:order-1">
        Showing <span className="text-[#0d2f5e]">{startItem}</span> to{' '}
        <span className="text-[#0d2f5e]">{endItem}</span> of{' '}
        <span className="text-[#0d2f5e]">{totalItems}</span> entries
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center gap-3 order-1 sm:order-2">
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Per Page:</span>
            <CustomPageSizeSelect 
              value={pageSize}
              options={[10, 25, 50, 100]}
              onChange={onPageSizeChange}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-[#0d2f5e] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Prev Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-[#0d2f5e] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Numeric Page Buttons */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                page === currentPage
                  ? 'bg-[#5ac4d7] text-white shadow-md shadow-[#5ac4d7]/20 scale-105'
                  : 'text-slate-650 hover:bg-white hover:text-[#0d2f5e]'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-[#0d2f5e] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-[#0d2f5e] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
