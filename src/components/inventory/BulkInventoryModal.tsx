'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  X, 
  Lock, 
  Unlock, 
  Sliders, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Car
} from 'lucide-react';
import { TransportOptionInfo } from '@/stores/inventoryStore';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

interface BulkInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => Promise<any>;
  type: 'package' | 'room' | 'transport';
  entityId: number; // variant_id, room_variant_id, or package_id
  transportOptions?: TransportOptionInfo[];
  entityName?: string;
}

export function BulkInventoryModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  entityId,
  transportOptions = [],
  entityName,
}: BulkInventoryModalProps) {
  const getTodayISO = () => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getFutureISO = (daysAhead: number) => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [fromDate, setFromDate] = useState(getTodayISO());
  const [toDate, setToDate] = useState(getFutureISO(14));
  const [action, setAction] = useState<'CLOSE' | 'OPEN' | 'UPDATE_CAPACITY' | 'DELETE'>('CLOSE');
  
  // Package/Room capacity
  const [capacity, setCapacity] = useState<string>(type === 'package' ? '500' : '20');
  
  // Transport counts { optionId: count }
  const [optionCounts, setOptionCounts] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize transport options counts
  useEffect(() => {
    if (type === 'transport' && transportOptions.length > 0) {
      const initial: Record<string, string> = {};
      transportOptions.forEach(opt => {
        initial[String(opt.id)] = String(opt.capacity || 1);
      });
      setOptionCounts(initial);
    }
  }, [type, transportOptions]);

  // Reset error when inputs change
  useEffect(() => {
    setErrorMessage(null);
  }, [fromDate, toDate, action, capacity]);

  if (!isOpen) return null;

  const setPreset = (days: number) => {
    const today = getTodayISO();
    setFromDate(today);
    setToDate(getFutureISO(days));
  };

  const setThisMonthPreset = () => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const y = d.getFullYear();
    const m = d.getMonth();
    const startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    setFromDate(startStr);
    setToDate(endStr);
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      setErrorMessage('Please select both From and To dates.');
      return;
    }
    if (fromDate > toDate) {
      setErrorMessage('From date must be earlier than or equal to To date.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const payload: any = {
        from_date: fromDate,
        to_date: toDate,
        action,
      };
      
      if (type === 'package') {
        payload.variant_id = entityId;
        if (action === 'UPDATE_CAPACITY') {
          const capVal = parseInt(capacity || '0', 10);
          if (capVal < 1) {
            setErrorMessage('Capacity must be at least 1.');
            setIsSubmitting(false);
            return;
          }
          payload.total_capacity = capVal;
        }
      } else if (type === 'room') {
        payload.room_variant_id = entityId;
        if (action === 'UPDATE_CAPACITY') {
          const capVal = parseInt(capacity || '0', 10);
          if (capVal < 0) {
            setErrorMessage('Room capacity cannot be negative.');
            setIsSubmitting(false);
            return;
          }
          payload.total_rooms = capVal;
        }
      } else if (type === 'transport') {
        payload.package_id = entityId;
        if (action === 'UPDATE_CAPACITY') {
          payload.option_counts = {};
          Object.entries(optionCounts).forEach(([k, v]) => {
            if (v !== '') payload.option_counts[k] = parseInt(v, 10);
          });
        }
      }
      
      await onConfirm(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to apply bulk action. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actions = [
    {
      id: 'CLOSE' as const,
      label: 'Close Slots',
      desc: 'Block new bookings across date range',
      icon: Lock,
      color: 'amber',
      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      id: 'OPEN' as const,
      label: 'Open Slots',
      desc: 'Reopen dates for public reservations',
      icon: Unlock,
      color: 'emerald',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'UPDATE_CAPACITY' as const,
      label: 'Update Capacity',
      desc: type === 'room' ? 'Adjust total rooms available' : 'Adjust available seats/vehicles',
      icon: Sliders,
      color: 'blue',
      badgeClass: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      id: 'DELETE' as const,
      label: 'Delete Slots',
      desc: 'Remove unbooked inventory rows',
      icon: Trash2,
      color: 'rose',
      badgeClass: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3.5 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="flex flex-col w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f3d56] px-5 sm:px-6 py-4 sm:py-5 relative overflow-hidden text-white shrink-0">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#5ac4d7] ring-1 ring-white/20">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black tracking-tight truncate">Bulk Inventory Actions</h3>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                  {entityName || (type === 'package' ? 'Package Inventory' : type === 'room' ? 'Room Inventory' : 'Transport Inventory')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors shrink-0 -mr-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600">Select Date Range</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreset(7)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-[#0f3d56] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(14)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-[#0f3d56] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(30)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-[#0f3d56] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  30 Days
                </button>
                <button
                  type="button"
                  onClick={setThisMonthPreset}
                  className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-[#0f3d56] bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date</span>
                <CustomDatePicker
                  value={fromDate}
                  onChange={(val) => {
                    setFromDate(val);
                    if (toDate && val > toDate) setToDate(val);
                  }}
                  allowPast={true}
                  isAdmin={true}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date</span>
                <CustomDatePicker
                  value={toDate}
                  min={fromDate}
                  onChange={(val) => setToDate(val)}
                  allowPast={true}
                  isAdmin={true}
                />
              </div>
            </div>
          </div>

          {/* Action Choice Grid */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600">Choose Action</label>
            <div className="grid grid-cols-2 gap-2.5">
              {actions.map((act) => {
                const Icon = act.icon;
                const isSelected = action === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setAction(act.id)}
                    className={`flex flex-col text-left p-3 rounded-2xl border-2 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-[#0f3d56] bg-[#0f3d56]/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg border ${act.badgeClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-[#0f3d56]" />
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-900">{act.label}</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{act.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Action Input: Update Capacity */}
          {action === 'UPDATE_CAPACITY' && type !== 'transport' && (
            <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 animate-in fade-in duration-150">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {type === 'package' ? 'New Total Seats per Date' : 'New Total Rooms per Date'}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  max="10000"
                  value={capacity} 
                  onChange={(e) => setCapacity(e.target.value)} 
                  placeholder="Enter new capacity"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-black text-slate-900 outline-none focus:border-[#0f3d56]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {type === 'package' ? 'Seats' : 'Rooms'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Note: Will fail on dates where current bookings already exceed this capacity.
              </p>
            </div>
          )}

          {/* Dynamic Action Input: Transport Options Capacity */}
          {action === 'UPDATE_CAPACITY' && type === 'transport' && transportOptions.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Transport Capacity</label>
                <p className="text-[11px] text-slate-500 mt-0.5">Specify vehicle count or seats for each option (leave blank to skip)</p>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {transportOptions.map((opt) => (
                  <div key={opt.id} className="grid grid-cols-[1fr_110px] items-center gap-2 rounded-xl bg-white border border-slate-200 p-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-900">{opt.title}</p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {opt.type === 'SHARED' ? `Shared (${opt.capacity} seats)` : 'Separate Vehicle'}
                      </p>
                    </div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Count"
                      value={optionCounts[opt.id] ?? ''}
                      onChange={(e) => setOptionCounts({ ...optionCounts, [opt.id]: e.target.value })}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-right text-xs font-black text-slate-900 outline-none focus:border-[#0f3d56] focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete Warning */}
          {action === 'DELETE' && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 animate-in fade-in duration-150">
              <Trash2 className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-black text-rose-900">Safety Guard Active</p>
                <p className="mt-0.5 leading-relaxed font-medium">
                  Slots with confirmed bookings will <span className="font-bold underline">not</span> be deleted. Only unbooked inventory in the date range will be removed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/80 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isSubmitting}
            className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={isSubmitting || !fromDate || !toDate}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md transition-all disabled:opacity-50 ${
              action === 'DELETE' 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-[#0f3d56] hover:bg-[#1a6b7a]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              `Apply ${action.replace('_', ' ')}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}