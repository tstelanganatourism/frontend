'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useInventoryStore, InventoryRow, RoomInventoryRow } from '@/stores/inventoryStore';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import {
  CalendarDays, ChevronLeft, ChevronRight, RefreshCw,
  Lock, Unlock, AlertCircle, CheckCircle2, XCircle,
  Sliders, Loader2, Package, Zap, Bed, Search, Info, Users, IndianRupee
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function formatMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay(); // 0=Sun
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Status Cell ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string, label: string }> = {
    OPEN: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Open' },
    CLOSED: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Closed' },
    SOLD_OUT: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Full' },
    NO_INVENTORY: { color: 'bg-slate-100 text-slate-400 border-slate-200', label: 'None' },
  };
  const config = cfg[status] ?? { color: 'bg-slate-100 text-slate-400 border-slate-200', label: status };
  return (
    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${config.color}`}>
      {config.label}
    </span>
  );
}

// ─── Bookings List (Injected) ──────────────────────────────────────────────────

function BookingsList({ mode, variantId, dateStr }: { mode: 'package' | 'room', variantId: number, dateStr: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient.get('/api/v1/admin/bookings', {
      params: {
        start_date: dateStr,
        end_date: dateStr,
        target_filter: mode.toUpperCase(),
        ...(mode === 'package' ? { variant_id: variantId } : { room_variant_id: variantId }),
        limit: 100
      }
    }).then(res => {
      if (isMounted) {
        const active = (res.data.items || []).filter((b: any) => b.status !== 'CANCELLED' && b.status !== 'REJECTED');
        setBookings(active);
        setLoading(false);
      }
    }).catch(err => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false };
  }, [mode, variantId, dateStr]);

  if (loading) return <div className="py-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div>;
  if (bookings.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-[#5ac4d7]/20 bg-[#5ac4d7]/5 p-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f3d56] mb-3 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Existing Bookings ({bookings.length})</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        {bookings.map(b => (
          <div key={b.id} className="flex justify-between items-center rounded-lg bg-white p-2.5 shadow-sm border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">{b.primary_passenger_name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{b.public_id} • {b.adult_count}A {b.child_count}C</p>
            </div>
            <div className="text-right">
              <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600">Confirmed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modals (Packages) ────────────────────────────────────────────────────────

function PackageEditDrawer({ row, onClose, onSaved }: { row: InventoryRow; onClose: () => void; onSaved: () => void }) {
  const { patchInventoryRow, deleteInventoryRow } = useInventoryStore();
  const [capacity, setCapacity] = useState(row.total_capacity);
  const [isClosed, setIsClosed] = useState(row.is_closed);
  const [priceOverride, setPriceOverride] = useState<string>(row.price_override != null ? String(row.price_override) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchInventoryRow(row.variant_id, row.date, {
        total_capacity: capacity,
        is_closed: isClosed,
        price_override: priceOverride !== '' ? parseFloat(priceOverride) : null,
      });
      toast.success(`Inventory updated for ${row.date}`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (row.booked_count > 0) {
      toast.error(`Cannot delete: ${row.booked_count} seats booked. Close the date instead.`);
      return;
    }
    setSaving(true);
    try {
      await deleteInventoryRow(row.variant_id, row.date);
      toast.success(`Inventory row deleted for ${row.date}`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col w-full max-w-lg max-h-[95vh] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <div className="bg-[#0f3d56] px-6 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package className="w-32 h-32 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#5ac4d7] ring-1 ring-white/20 shadow-inner">
              <Package className="h-6 w-6" />
            </div>
            <div className="pt-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5ac4d7] mb-1">Package Inventory</p>
              <h3 className="text-xl font-black text-white tracking-tight leading-none">Edit {row.date}</h3>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Update capacity, apply price modifiers, or close bookings for this specific date block.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6 pb-8 bg-slate-50/50 overflow-y-auto custom-scrollbar">
          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Capacity', value: row.total_capacity, color: 'text-slate-900', bg: 'bg-white', border: 'border-slate-200' },
              { label: 'Booked', value: row.booked_count, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { label: 'Available', value: row.available_seats, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-4 text-center shadow-sm`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {/* Maximum Capacity */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 mb-1.5">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                Maximum Capacity
              </label>
              <input type="number" min={row.booked_count} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900 outline-none transition-all focus:border-[#0f3d56] focus:bg-white focus:ring-4 focus:ring-[#0f3d56]/10" />
            </div>

            {/* Price Override */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 mb-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                Price Override Modifier (₹)
              </label>
              <input type="number" placeholder="e.g. 500 or -300" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900 outline-none transition-all focus:border-[#0f3d56] focus:bg-white focus:ring-4 focus:ring-[#0f3d56]/10" />
            </div>

            {/* Status Toggle */}
            <div className={`flex items-center justify-between rounded-2xl border p-5 shadow-sm transition-colors ${isClosed ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
              <div>
                <p className={`text-sm font-black uppercase tracking-wider ${isClosed ? 'text-red-700' : 'text-emerald-700'}`}>
                  {isClosed ? 'Date is CLOSED' : 'Date is OPEN'}
                </p>
                <p className={`text-xs mt-1 font-medium ${isClosed ? 'text-red-600/80' : 'text-emerald-600/80'}`}>
                  {isClosed ? 'New bookings are blocked for this date.' : 'Customers can actively book this date.'}
                </p>
              </div>
              <button onClick={() => setIsClosed(!isClosed)}
                className={`group flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border-2 transition-all hover:scale-105 active:scale-95 ${isClosed ? 'bg-red-100 border-red-200 text-red-600 hover:bg-red-200' : 'bg-emerald-100 border-emerald-200 text-emerald-600 hover:bg-emerald-200'}`}>
                {isClosed ? <Lock className="h-6 w-6 transition-transform group-hover:-rotate-12" /> : <Unlock className="h-6 w-6 transition-transform group-hover:rotate-12" />}
              </button>
            </div>
          </div>
            <div className="rounded-2xl border border-sky-100 bg-[#5ac4d7]/5 p-5 shadow-sm">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-[#1a6b7a] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-[#0f3d56]">Booking Safety Policy</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Active bookings on this date **will not be affected or deleted** if you close these slots. Closing slots simply blocks any future new reservations from checkout. All existing confirmed bookings remain 100% active and safe.
                  </p>
                </div>
              </div>
            </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between gap-4 bg-slate-100/80 px-6 py-4 border-t border-slate-200">
          <button onClick={handleDelete} disabled={saving || row.booked_count > 0} 
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 disabled:opacity-40">
            <XCircle className="h-4 w-4" /> Delete
          </button>
          
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || capacity < row.booked_count} 
              className="flex items-center gap-2 rounded-xl bg-[#0f3d56] px-6 py-2.5 text-sm font-black text-white shadow-md transition-all hover:bg-[#1a6b7a] hover:shadow-lg disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modals (Rooms) ───────────────────────────────────────────────────────────

function RoomEditDrawer({ row, onClose, onSaved }: { row: RoomInventoryRow; onClose: () => void; onSaved: () => void }) {
  const { patchRoomInventoryRow, deleteRoomInventoryRow } = useInventoryStore();
  const [capacity, setCapacity] = useState(row.total_rooms);
  const [isClosed, setIsClosed] = useState(row.is_closed);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchRoomInventoryRow(row.id, {
        total_rooms: capacity,
        is_closed: isClosed,
      });
      toast.success(`Room inventory updated for slot ${row.slot_start}-${row.slot_end} on ${row.date}`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

    const handleDelete = async () => {
    if (row.booked_rooms > 0) {
      toast.error(`Cannot delete: ${row.booked_rooms} rooms booked. Close the date instead.`);
      return;
    }
    setSaving(true);
    try {
      await deleteRoomInventoryRow(row.id);
      toast.success(`Room inventory slot deleted`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col w-full max-w-md max-h-[95vh] rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 px-6 py-4">
          <h3 className="text-base font-black text-white">Edit Room Inventory — {row.date}</h3>
          <p className="text-xs text-slate-400 mt-1">Slot: {row.slot_start.slice(0, 5)} to {row.slot_end.slice(0, 5)}</p>
        </div>
        <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Rooms', value: row.total_rooms },
              { label: 'Booked', value: row.booked_rooms },
              { label: 'Available', value: row.available_rooms },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className="mt-1 text-xl font-black text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Total Rooms Available</label>
            <input type="number" min={row.booked_rooms} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-800">{isClosed ? 'Date is CLOSED' : 'Date is OPEN'}</p>
            </div>
            <button onClick={() => setIsClosed(!isClosed)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isClosed ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {isClosed ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            </button>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-[#5ac4d7]/5 p-5 shadow-sm">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-[#1a6b7a] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-[#0f3d56]">Booking Safety Policy</p>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Active room bookings on this date **will not be affected or deleted** if you close these slots. Closing slots simply blocks any future new room reservations. All existing bookings remain 100% active and safe.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 pb-6 pt-4">
          <button onClick={handleDelete} disabled={saving || row.booked_rooms > 0} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Delete</button>
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} disabled={saving || capacity < row.booked_rooms} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-700">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Generate/Create Modals (Shared Logic) ───────────────────────────────────

function GenerateModal({ mode, entityId, currentMonth, onClose, onGenerated, defaultCapacity }: { mode: 'package' | 'room', entityId: number, currentMonth: string, onClose: () => void, onGenerated: () => void, defaultCapacity?: number }) {
  const { generateInventory, generateRoomInventory } = useInventoryStore();
  const today = todayIST();
  const minISO = today.toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(minISO);
  const [toDate, setToDate] = useState(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [capacity, setCapacity] = useState(defaultCapacity ?? (mode === 'package' ? 500 : 20));
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let result;
      if (mode === 'package') {
        result = await generateInventory({ variant_id: entityId, from_date: fromDate, to_date: toDate, total_capacity: capacity });
      } else {
        result = await generateRoomInventory({ room_variant_id: entityId, from_date: fromDate, to_date: toDate, override_total_rooms: capacity });
      }
      toast.success(result.message);
      onGenerated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0f3d56] px-6 py-4 rounded-t-2xl">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#5ac4d7]" /> Generate {mode === 'package' ? 'Package' : 'Room'} Inventory
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">From Date</label>
            <CustomDatePicker value={fromDate} onChange={setFromDate} min={minISO} />
          </div>
          <div className="relative z-40">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">To Date</label>
            <CustomDatePicker value={toDate} onChange={setToDate} min={fromDate} />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Default Capacity per day</label>
            <input type="number" min={1} max={10000} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || (mode === 'package' ? 500 : 20))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400" />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 pb-6 pt-4 rounded-b-2xl">
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleGenerate} disabled={loading || !fromDate || !toDate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-5 py-2.5 text-sm font-black text-white hover:bg-[#1a6b7a] disabled:opacity-50 transition-colors">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Generate
          </button>
        </div>
      </div>
    </div>
  );
}

function DateManageModal({ mode, entityId, dateStr, rows, onClose, onRefresh }: { mode: 'package' | 'room', entityId: number, dateStr: string, rows: any[], onClose: () => void, onRefresh: () => void }) {
  const { generateInventory, generateRoomInventory, patchInventoryRow, patchRoomInventoryRow, deleteInventoryRow, deleteRoomInventoryRow } = useInventoryStore();
  const [capacity, setCapacity] = useState(mode === 'package' ? 500 : 20);
  const [loading, setLoading] = useState(false);

  const hasInventory = rows.length > 0;
  const allClosed = hasInventory && rows.every(r => r.is_closed);
  const unitLabel = mode === 'package' ? 'seats' : 'rooms';
  const itemLabel = mode === 'package' ? 'Package seats' : 'Room slots';
  const defaultCapacity = mode === 'package' ? 500 : 20;
  const totalCapacity = rows.reduce((acc, r) => acc + (mode === 'package' ? r.total_capacity : r.total_rooms), 0);
  const totalBooked = rows.reduce((acc, r) => acc + (mode === 'package' ? r.booked_count : r.booked_rooms), 0);
  const totalAvailable = rows.reduce((acc, r) => acc + (mode === 'package' ? r.available_seats : r.available_rooms), 0);
  const hasBookings = totalBooked > 0;
  const openRows = rows.filter(r => !r.is_closed).length;

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (mode === 'package') {
        await generateInventory({ variant_id: entityId, from_date: dateStr, to_date: dateStr, total_capacity: capacity });
      } else {
        await generateRoomInventory({ room_variant_id: entityId, from_date: dateStr, to_date: dateStr, override_total_rooms: capacity });
      }
      toast.success(`Inventory opened for ${dateStr}!`);
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to open inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClose = async () => {
    setLoading(true);
    const targetClosed = !allClosed;
    try {
      if (mode === 'package') {
        const promises = rows
          .filter(r => r.is_closed !== targetClosed)
          .map(() => patchInventoryRow(entityId, dateStr, { is_closed: targetClosed }));
        await Promise.all(promises);
      } else {
        const promises = rows
          .filter(r => r.is_closed !== targetClosed)
          .map(r => patchRoomInventoryRow(r.id, { is_closed: targetClosed }));
        await Promise.all(promises);
      }
      toast.success(targetClosed ? `All slots closed for ${dateStr}` : `All slots reopened for ${dateStr}`);
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    const booked = rows.reduce((acc, r) => acc + (mode === 'package' ? r.booked_count : r.booked_rooms), 0);
    if (booked > 0) {
      toast.error(`Cannot delete: ${booked} seats/rooms already booked on this date.`);
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'package') {
        await deleteInventoryRow(entityId, dateStr);
      } else {
        const promises = rows.map(r => deleteRoomInventoryRow(r.id));
        await Promise.all(promises);
      }
      toast.success(`All slots deleted for ${dateStr}`);
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete slots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col w-full max-w-lg max-h-[95vh] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <div className="bg-[#0f3d56] px-6 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CalendarDays className="w-32 h-32 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#5ac4d7] ring-1 ring-white/20 shadow-inner">
              {mode === 'package' ? <Package className="h-6 w-6" /> : <Bed className="h-6 w-6" />}
            </div>
            <div className="pt-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5ac4d7] mb-1">{itemLabel}</p>
              <h3 className="text-xl font-black text-white tracking-tight leading-none">Manage {dateStr}</h3>
              <p className="mt-2 text-sm font-medium text-slate-300">
                {hasInventory
                  ? `${rows.length} ${mode === 'package' ? 'inventory block' : 'time slot'}${rows.length === 1 ? '' : 's'} found. ${openRows} currently open.`
                  : `No ${mode === 'package' ? 'package inventory' : 'room slots'} exists for this date yet.`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6 pb-8 bg-slate-50/50 overflow-y-auto custom-scrollbar">
          {/* Status Cards */}
          {hasInventory ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: totalCapacity, color: 'text-slate-900', bg: 'bg-white', border: 'border-slate-200' },
                { label: 'Booked', value: totalBooked, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { label: 'Available', value: totalAvailable, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-2xl border ${stat.border} ${stat.bg} p-4 text-center shadow-sm`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color} leading-none`}>{stat.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
              <div className="rounded-full bg-sky-100 p-2 text-sky-600 mt-0.5">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Open this date for booking</p>
                <p className="mt-1 text-sm font-medium text-slate-600 leading-relaxed">
                  Create availability for this single date using the capacity below.
                </p>
              </div>
            </div>
          )}

          {/* Capacity Input */}
          {!hasInventory && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Starting Capacity
                  </label>
                  <p className="mt-1.5 text-sm font-medium text-slate-500">
                    Use this capacity for {dateStr}.
                  </p>
                  <div className="relative mt-3">
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value) || defaultCapacity)}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-4 pr-20 py-3.5 text-lg font-black text-slate-900 outline-none transition-all focus:border-[#0f3d56] focus:bg-white focus:ring-4 focus:ring-[#0f3d56]/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{unitLabel}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={loading || capacity < 1}
                  className="flex h-[56px] items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-6 text-sm font-black text-white shadow-md transition-all hover:bg-[#1a6b7a] hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-md sm:min-w-[160px]"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Open Date
                </button>
              </div>
            </div>
          )}

          {/* Destructive Actions */}
          {hasInventory && (
            <div className="pt-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-slate-200"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bulk Actions</p>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleToggleClose}
                  disabled={loading}
                  className={`group relative flex min-h-[100px] flex-col justify-center gap-2 rounded-2xl border-2 p-4 text-left transition-all disabled:opacity-50 overflow-hidden ${
                    allClosed 
                      ? 'border-emerald-200/50 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-100/50' 
                      : 'border-amber-200/50 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-100/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500 animate-duration-500" />
                    ) : allClosed ? (
                      <Unlock className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-110" />
                    ) : (
                      <Lock className="h-4 w-4 text-amber-600 transition-transform group-hover:scale-110" />
                    )}
                    <span className={`text-sm font-black ${allClosed ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {allClosed ? 'Reopen All ' : 'Close All '} {mode === 'package' ? 'Seats' : 'Slots'}
                    </span>
                  </div>
                  <span className={`text-[13px] font-medium leading-snug ${allClosed ? 'text-emerald-800/80' : 'text-amber-800/80'}`}>
                    {allClosed ? 'Allow customers to book this date again.' : 'Hide date from new bookings. Existing bookings remain safe.'}
                  </span>
                </button>

                <button
                  onClick={handleDeleteAll}
                  disabled={loading || hasBookings}
                  className="group relative flex min-h-[100px] flex-col justify-center gap-2 rounded-2xl border-2 border-red-200/50 bg-red-50/50 p-4 text-left transition-all hover:border-red-300 hover:bg-red-100/50 disabled:opacity-50 overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500 animate-duration-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 transition-transform group-hover:scale-110" />
                    )}
                    <span className="text-sm font-black text-red-700">Delete Inventory</span>
                  </div>
                  <span className="text-[13px] font-medium leading-snug text-red-700/80">
                    {hasBookings ? `Blocked: ${totalBooked} ${unitLabel} already booked.` : 'Completely remove this date from the calendar.'}
                  </span>
                </button>
              </div>
            </div>
          )}
          {hasInventory && (
            <div className="rounded-2xl border border-sky-100 bg-[#5ac4d7]/5 p-5 shadow-sm">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-[#1a6b7a] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-[#0f3d56]">Booking Safety Policy</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Active bookings on this date **will not be affected or deleted** if you close these slots. Closing slots simply blocks any future new reservations from checkout. All existing confirmed bookings remain 100% active and safe.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between gap-4 bg-slate-100/80 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
             <Info className="h-4 w-4 text-slate-400" />
             <span className="text-xs font-bold text-slate-500">
               {hasInventory ? (allClosed ? 'All slots are currently closed.' : 'Inventory is actively accepting bookings.') : 'Ready to create inventory blocks.'}
             </span>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminInventoryPage() {
  const { packages: adminPackages, rooms: adminRooms, fetchPackages, fetchRooms } = useAdminStore();
  const {
    adminRows, isLoading, fetchAdminInventory,
    roomAdminRows, roomIsLoading, fetchRoomAdminInventory
  } = useInventoryStore();

  const today = todayIST();

  // Tabs
  const [activeTab, setActiveTab] = useState<'packages' | 'rooms'>('packages');

  // Selectors
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomVariantId, setSelectedRoomVariantId] = useState<number | null>(null);

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);

  const [editPackageRow, setEditPackageRow] = useState<InventoryRow | null>(null);
  const [editRoomRow, setEditRoomRow] = useState<RoomInventoryRow | null>(null);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);

  // Load baseline data
  useEffect(() => {
    fetchPackages();
    fetchRooms();
  }, [fetchPackages, fetchRooms]);

  const packageList = Array.isArray(adminPackages) ? adminPackages : [];
  const roomList = Array.isArray(adminRooms) ? adminRooms : [];

  const selectedPackage = typeof packageList.find === 'function' ? packageList.find((p) => p.id === selectedPackageId) : undefined;
  const variants = selectedPackage?.variants ?? [];

  const selectedRoom = typeof roomList.find === 'function' ? roomList.find((r) => r.id === selectedRoomId) : undefined;
  const roomVariants = selectedRoom?.variants ?? [];

  // Auto-select package
  useEffect(() => {
    if (activeTab === 'packages' && packageList.length > 0) {
      if (!selectedPackageId || !packageList.some(p => p.id === selectedPackageId)) {
        setSelectedPackageId(packageList[0].id);
      }
    }
  }, [packageList, selectedPackageId, activeTab]);

  // Auto-select package variant
  useEffect(() => {
    if (activeTab === 'packages' && variants.length > 0) {
      if (!selectedVariantId || !variants.some((v: any) => v.id === selectedVariantId)) {
        setSelectedVariantId(variants[0].id);
      }
    }
  }, [selectedPackageId, variants, selectedVariantId, activeTab]);

  // Auto-select room
  useEffect(() => {
    if (activeTab === 'rooms' && roomList.length > 0) {
      if (!selectedRoomId || !roomList.some(r => r.id === selectedRoomId)) {
        setSelectedRoomId(roomList[0].id);
      }
    }
  }, [roomList, selectedRoomId, activeTab]);

  // Auto-select room variant
  useEffect(() => {
    if (activeTab === 'rooms' && roomVariants.length > 0) {
      if (!selectedRoomVariantId || !roomVariants.some((v: any) => v.id === selectedRoomVariantId)) {
        setSelectedRoomVariantId(roomVariants[0].id);
      }
    }
  }, [selectedRoomId, roomVariants, selectedRoomVariantId, activeTab]);

  // Calendar Refreshw
  const refresh = useCallback(() => {
    const monthStr = formatMonth(calYear, calMonth);
    if (activeTab === 'packages' && selectedVariantId) {
      fetchAdminInventory(selectedVariantId, monthStr);
    } else if (activeTab === 'rooms' && selectedRoomVariantId) {
      fetchRoomAdminInventory(selectedRoomVariantId, monthStr);
    }
  }, [activeTab, selectedVariantId, selectedRoomVariantId, calYear, calMonth, fetchAdminInventory, fetchRoomAdminInventory]);

  useEffect(() => { refresh(); }, [refresh]);

  // Build current view row lookup
  const rowsByDate: Record<string, any[]> = {};
  if (activeTab === 'packages') {
    for (const r of adminRows) {
      if (!rowsByDate[r.date]) rowsByDate[r.date] = [];
      rowsByDate[r.date].push(r);
    }
  } else {
    for (const r of roomAdminRows) {
      if (!rowsByDate[r.date]) rowsByDate[r.date] = [];
      rowsByDate[r.date].push(r);
    }
  }

  const totalDays = daysInMonth(calYear, calMonth);
  const startDay = firstDayOfMonth(calYear, calMonth);

  const prevMonth = () => { if (calMonth === 1) { setCalYear(calYear - 1); setCalMonth(12); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 12) { setCalYear(calYear + 1); setCalMonth(1); } else setCalMonth(calMonth + 1); };

  const monthLabel = new Date(calYear, calMonth - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  // Stats
  const activeRows = activeTab === 'packages' ? adminRows : roomAdminRows;
  const loadingState = activeTab === 'packages' ? isLoading : roomIsLoading;

  const statCounts = activeRows.reduce(
    (acc, r: any) => {
      const avail = activeTab === 'packages' ? r.available_seats : r.available_rooms;
      if (r.is_closed) acc.closed++;
      else if (avail === 0) acc.soldOut++;
      else acc.open++;
      return acc;
    },
    { open: 0, closed: 0, soldOut: 0 }
  );

  const hasSelection = (activeTab === 'packages' && selectedVariantId) || (activeTab === 'rooms' && selectedRoomVariantId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventory Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Manage date-wise availability and capacity.</p>
        </div>
        {hasSelection && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGenerate(true)}
              className="flex items-center gap-2 rounded-xl bg-[#0f3d56] px-4 py-2.5 text-sm font-black text-white hover:bg-[#1a6b7a] transition-colors shadow-md">
              <Zap className="h-4 w-4" /> Generate Dates
            </button>
            <button onClick={refresh} disabled={loadingState}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
              <RefreshCw className={`h-4 w-4 ${loadingState ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-slate-100/50 rounded-2xl border border-slate-200 w-full max-w-sm">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'packages' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
        >
          <Package className="h-4 w-4" /> Packages
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'rooms' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
        >
          <Bed className="h-4 w-4" /> Rooms
        </button>
      </div>

      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        {activeTab === 'packages' ? (
          <>
            <div>
              <PremiumSelect
                label="Package"
                value={selectedPackageId}
                onChange={(val) => setSelectedPackageId(val ? Number(val) : null)}
                options={packageList.map((p) => ({ value: p.id, label: p.title }))}
                placeholder="— Select a package —"
              />
            </div>
            <div>
              <PremiumSelect
                label="Variant"
                value={selectedVariantId}
                onChange={(val) => setSelectedVariantId(val ? Number(val) : null)}
                options={variants.map((v: any) => ({ value: v.id, label: v.title?.trim() || `Unnamed Variant (ID: ${v.id})` }))}
                placeholder="— Select a variant —"
                disabled={variants.length === 0}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <PremiumSelect
                label="Lodge / Property"
                value={selectedRoomId}
                onChange={(val) => setSelectedRoomId(val ? Number(val) : null)}
                options={roomList.map((r) => ({ value: r.id, label: r.lodge_name }))}
                placeholder="— Select a lodge —"
              />
            </div>
            <div>
              <PremiumSelect
                label="Room Category / Variant"
                value={selectedRoomVariantId}
                onChange={(val) => setSelectedRoomVariantId(val ? Number(val) : null)}
                options={roomVariants.map((v: any) => ({ value: v.id, label: v.variant_name?.trim() || `Unnamed Variant (ID: ${v.id})` }))}
                placeholder="— Select a room category —"
                disabled={roomVariants.length === 0}
              />
            </div>
          </>
        )}
      </div>

      {!hasSelection ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          {activeTab === 'packages' ? <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" /> : <Bed className="mx-auto mb-4 h-12 w-12 text-slate-300" />}
          <p className="text-base font-black text-slate-400">Select {activeTab === 'packages' ? 'a package and variant' : 'a lodge and room category'} to view inventory</p>
          <p className="text-sm text-slate-400 mt-1">Use the selectors above to get started.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Open Dates', value: statCounts.open, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Closed Dates', value: statCounts.closed, icon: XCircle, color: 'text-red-500 bg-red-50' },
              { label: 'Sold Out', value: statCounts.soldOut, icon: AlertCircle, color: 'text-amber-500 bg-amber-50' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className={`inline-flex items-center justify-center rounded-xl p-2 ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-2xl font-black text-slate-900">{s.value}</p>
                  <p className="text-xs font-semibold text-slate-400">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Calendar */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#1a6b7a]" />
                <span className="text-base font-black text-slate-900">{monthLabel}</span>
                {loadingState && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </div>
              <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px] sm:min-w-0">
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[132px] border-b border-r border-slate-50 bg-slate-25 sm:min-h-[90px]" />
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const dateStr = isoDate(calYear, calMonth, day);
                const todayStr = today.toISOString().slice(0, 10);
                const isPast = dateStr < todayStr;
                const rows = rowsByDate[dateStr] || [];
                const hasInventory = rows.length > 0;

                const bgColor = isPast
                  ? 'bg-slate-50'
                  : hasInventory && rows.every(r => r.is_closed)
                    ? 'bg-red-50'
                    : hasInventory
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-white hover:bg-[#5ac4d7]/5 border-dashed border-[#5ac4d7]/25';

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (isPast) return;
                      setCreateDate(dateStr);
                    }}
                    className={`min-h-[132px] flex flex-col border-b border-r border-slate-100 p-2.5 transition-colors group sm:min-h-[110px] ${bgColor} ${!isPast && !hasInventory ? 'cursor-pointer' : ''}`}
                  >
                    <p className={`text-sm font-black shrink-0 ${isPast ? 'text-slate-300' : 'text-slate-700'}`}>{day}</p>
                    {isPast ? (
                      <p className="mt-1 text-[9px] text-slate-300 font-semibold shrink-0">Past</p>
                    ) : hasInventory ? (
                      <div className="mt-1 flex-1 overflow-y-auto space-y-1.5 pr-1" style={{ maxHeight: '140px' }}>
                        {rows.map((r, idx) => {
                          const avail = activeTab === 'packages' ? r.available_seats : r.available_rooms;
                          const total = activeTab === 'packages' ? r.total_capacity : r.total_rooms;
                          const booked = activeTab === 'packages' ? r.booked_count : r.booked_rooms;
                          
                          let cellStatus = 'NO_INVENTORY';
                          if (r.is_closed) cellStatus = 'CLOSED';
                          else if (avail === 0) cellStatus = 'SOLD_OUT';
                          else cellStatus = 'OPEN';

                          return (
                            <div 
                              key={r.id || idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                activeTab === 'packages' ? setEditPackageRow(r) : setEditRoomRow(r);
                              }}
                              className="border border-slate-200 rounded-md p-2 bg-white shadow-sm cursor-pointer hover:border-slate-400 transition-colors"
                            >
                              {activeTab === 'rooms' && r.slot_start && (
                                <p className="text-[10px] font-black text-slate-700 mb-1 tracking-tight whitespace-nowrap">
                                  {r.slot_start.slice(0,5)} – {r.slot_end.slice(0,5)}
                                </p>
                              )}
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <StatusBadge status={cellStatus} />
                                <span className="text-[9px] font-bold text-slate-500">
                                  {avail}/{total}
                                </span>
                              </div>
                              <div className="hidden md:flex justify-between text-[8px] text-slate-400 font-medium">
                                <span>Cap: {total}</span>
                                <span>Book: {booked}</span>
                                <span>Rem: {avail}</span>
                              </div>
                              {activeTab === 'packages' && r.price_override !== null && r.price_override !== 0 && (
                                <p className="text-[9px] font-bold text-[#1a6b7a] mt-0.5">
                                  {r.price_override > 0 ? `+₹${r.price_override}` : `₹${r.price_override}`}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : loadingState ? (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <div className="h-3 w-10 rounded-full bg-slate-100 animate-pulse" />
                        <div className="h-2 w-7 rounded-full bg-slate-100 animate-pulse" />
                      </div>
                    ) : (
                      <div className="mt-1.5 flex flex-col items-start gap-1 shrink-0">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                          No data
                        </span>
                        <span className="text-[9px] font-black text-[#5ac4d7] bg-[#5ac4d7]/10 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200">
                          + Open
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-400" /> Open</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-400" /> Closed</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400" /> Sold Out</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-slate-200" /> No Inventory</span>
          </div>
        </>
      )}

      {/* Modals */}
      {editPackageRow && (
        <PackageEditDrawer row={editPackageRow} onClose={() => setEditPackageRow(null)} onSaved={refresh} />
      )}
      {editRoomRow && (
        <RoomEditDrawer row={editRoomRow} onClose={() => setEditRoomRow(null)} onSaved={refresh} />
      )}
      {createDate && hasSelection && (
        <DateManageModal
          mode={activeTab === 'packages' ? 'package' : 'room'}
          entityId={activeTab === 'packages' ? selectedVariantId! : selectedRoomVariantId!}
          dateStr={createDate}
          rows={rowsByDate[createDate] || []}
          onClose={() => setCreateDate(null)}
          onRefresh={refresh}
        />
      )}
      {showGenerate && hasSelection && (() => {
        const selectedRoomVariant = roomVariants.find((v: any) => v.id === selectedRoomVariantId);
        return (
          <GenerateModal
            mode={activeTab === 'packages' ? 'package' : 'room'}
            entityId={activeTab === 'packages' ? selectedVariantId! : selectedRoomVariantId!}
            currentMonth={formatMonth(calYear, calMonth)}
            onClose={() => setShowGenerate(false)}
            onGenerated={refresh}
            defaultCapacity={activeTab === 'rooms' && selectedRoomVariant?.total_rooms ? selectedRoomVariant.total_rooms : undefined}
          />
        );
      })()}
    </div>
  );
}
