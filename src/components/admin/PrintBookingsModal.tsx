'use client';

import React, { useState } from 'react';
import { Printer, X, Calendar, CalendarRange, Download, ExternalLink } from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

type DateMode = 'single' | 'range';

interface PrintBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintBookingsModal({ isOpen, onClose }: PrintBookingsModalProps) {
  const [dateMode, setDateMode] = useState<DateMode>('single');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const buildReportUrl = () => {
    const params = new URLSearchParams();
    if (dateMode === 'single') {
      if (singleDate) params.set('date', singleDate);
    } else {
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
    }
    if (statusFilter) params.set('status', statusFilter);
    return `/print/bookings-report?${params.toString()}`;
  };

  const isValid = () => {
    if (dateMode === 'single') return Boolean(singleDate);
    return Boolean(startDate || endDate);
  };

  const handleOpen = (newTab = false) => {
    if (!isValid()) return;
    const url = buildReportUrl();
    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(10, 35, 81, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: '1.5px solid #e2e8f0' }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, #0a2351 0%, #1a3a6b 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Print Bookings</h2>
              <p className="text-[11px] text-blue-200 font-medium mt-0.5">Packages only · Admin Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-white/70 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="px-6 py-5 space-y-5">
          {/* Date mode toggle */}
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
              Select Date Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDateMode('single')}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold border transition-all ${
                  dateMode === 'single'
                    ? 'bg-[#0a2351] text-white border-[#0a2351] shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Single Date
              </button>
              <button
                onClick={() => setDateMode('range')}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold border transition-all ${
                  dateMode === 'range'
                    ? 'bg-[#0a2351] text-white border-[#0a2351] shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CalendarRange className="h-4 w-4" />
                Date Range
              </button>
            </div>
          </div>

          {/* Date input(s) */}
          {dateMode === 'single' ? (
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                Select Date
              </label>
              <CustomDatePicker
                value={singleDate}
                onChange={setSingleDate}
                placeholder="Pick a date"
                allowPast={true}
                isAdmin={true}
                align="center"
              />
              {singleDate && (
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Showing all package bookings for{' '}
                  <span className="font-bold text-[#0a2351]">
                    {new Date(singleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                  From Date
                </label>
                <CustomDatePicker
                  value={startDate}
                  onChange={(v) => { setStartDate(v); if (endDate && v > endDate) setEndDate(''); }}
                  placeholder="Start date"
                  allowPast={true}
                  isAdmin={true}
                  align="left"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
                  To Date
                </label>
                <CustomDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End date"
                  min={startDate}
                  allowPast={true}
                  isAdmin={true}
                  align="right"
                />
              </div>
              {(startDate || endDate) && (
                <p className="text-xs text-slate-500 font-medium">
                  {startDate && endDate
                    ? <>Bookings from <span className="font-bold text-[#0a2351]">{new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span> to <span className="font-bold text-[#0a2351]">{new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>
                    : startDate
                    ? <>Bookings from <span className="font-bold text-[#0a2351]">{new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span> onwards</>
                    : <>Bookings up to <span className="font-bold text-[#0a2351]">{new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>
                  }
                </p>
              )}
            </div>
          )}

          {/* Status filter */}
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">
              Status Filter <span className="text-slate-400 font-medium normal-case">(optional)</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0a2351] focus:ring-2 focus:ring-[#0a2351]/10 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="FULLY_PAID">Confirmed Only</option>
              <option value="PARTIAL_PAID">Advance Paid</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Info note */}
          <div
            className="rounded-xl px-4 py-3 text-xs font-semibold"
            style={{ background: '#f0f7ff', color: '#1e3a5f', border: '1px solid #bfdbfe' }}
          >
            <span className="font-black">Note:</span> This report includes <strong>package bookings only</strong> (Boat Rides & Sightseeing). Room/stay bookings are excluded.
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}
        >
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleOpen(true)}
            disabled={!isValid()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isValid()
                ? 'linear-gradient(135deg, #0a2351 0%, #1a3a6b 100%)'
                : '#94a3b8',
              boxShadow: isValid() ? '0 4px 12px rgba(10,35,81,0.25)' : 'none',
            }}
          >
            <Printer className="h-4 w-4" />
            Open Report
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
}
