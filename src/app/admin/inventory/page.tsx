'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useInventoryStore, InventoryRow, RoomInventoryRow } from '@/stores/inventoryStore';
import { toast } from 'sonner';
import PremiumSelect from '@/components/ui/PremiumSelect';
import {
  CalendarDays, ChevronLeft, ChevronRight, RefreshCw,
  Lock, Unlock, AlertCircle, CheckCircle2, XCircle,
  Sliders, Loader2, Package, Zap, Bed, Search
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 px-6 py-4">
          <h3 className="text-base font-black text-white">Edit Package Inventory — {row.date}</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Capacity', value: row.total_capacity },
              { label: 'Booked', value: row.booked_count },
              { label: 'Available', value: row.available_seats },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className="mt-1 text-xl font-black text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Maximum Capacity</label>
            <input type="number" min={row.booked_count} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Price Override Modifier (₹)</label>
            <input type="number" placeholder="e.g. 500 or -300" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)}
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
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 pb-6 pt-4">
          <button onClick={handleDelete} disabled={saving || row.booked_count > 0} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Delete</button>
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} disabled={saving || capacity < row.booked_count} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-700">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
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
      await patchRoomInventoryRow(row.room_variant_id, row.date, {
        total_rooms: capacity,
        is_closed: isClosed,
      });
      toast.success(`Room inventory updated for ${row.date}`);
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
      await deleteRoomInventoryRow(row.room_variant_id, row.date);
      toast.success(`Room inventory row deleted for ${row.date}`);
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
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 px-6 py-4">
          <h3 className="text-base font-black text-white">Edit Room Inventory — {row.date}</h3>
        </div>
        <div className="p-6 space-y-5">
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

function GenerateModal({ mode, entityId, currentMonth, onClose, onGenerated }: { mode: 'package' | 'room', entityId: number, currentMonth: string, onClose: () => void, onGenerated: () => void }) {
  const { generateInventory, generateRoomInventory } = useInventoryStore();
  const today = todayIST();
  const minISO = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(minISO);
  const [toDate, setToDate] = useState(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [capacity, setCapacity] = useState(mode === 'package' ? 500 : 20);
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
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0f3d56] px-6 py-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#5ac4d7]" /> Generate {mode === 'package' ? 'Package' : 'Room'} Inventory
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">From Date</label>
            <input type="date" min={minISO} value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">To Date</label>
            <input type="date" min={fromDate} value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Default Capacity per day</label>
            <input type="number" min={1} max={10000} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || (mode === 'package' ? 500 : 20))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400" />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 pb-6 pt-4">
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

function CreateModal({ mode, entityId, dateStr, onClose, onCreated }: { mode: 'package' | 'room', entityId: number, dateStr: string, onClose: () => void, onCreated: () => void }) {
  const { generateInventory, generateRoomInventory } = useInventoryStore();
  const [capacity, setCapacity] = useState(mode === 'package' ? 500 : 20);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (mode === 'package') {
        await generateInventory({ variant_id: entityId, from_date: dateStr, to_date: dateStr, total_capacity: capacity });
      } else {
        await generateRoomInventory({ room_variant_id: entityId, from_date: dateStr, to_date: dateStr, override_total_rooms: capacity });
      }
      toast.success(`Inventory opened for ${dateStr}!`);
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to open inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0f3d56] px-6 py-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#5ac4d7] animate-pulse" /> Open Date — {dateStr}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Default Seats/Rooms</label>
            <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || (mode === 'package' ? 500 : 20))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-400" autoFocus />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-6 pb-6 pt-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f3d56] px-5 py-2.5 text-sm font-black text-white hover:bg-[#1a6b7a] disabled:opacity-50 transition-colors">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Open Date
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
  const rowByDate: Record<string, any> = {};
  if (activeTab === 'packages') {
    for (const r of adminRows) rowByDate[r.date] = r;
  } else {
    for (const r of roomAdminRows) rowByDate[r.date] = r;
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

            <div className="grid grid-cols-7 border-b border-slate-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[90px] border-b border-r border-slate-50 bg-slate-25" />
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const dateStr = isoDate(calYear, calMonth, day);
                const todayStr = today.toISOString().slice(0, 10);
                const isPast = dateStr <= todayStr;
                const row = rowByDate[dateStr];

                let cellStatus = 'NO_INVENTORY';
                if (row) {
                  const avail = activeTab === 'packages' ? row.available_seats : row.available_rooms;
                  if (row.is_closed) cellStatus = 'CLOSED';
                  else if (avail === 0) cellStatus = 'SOLD_OUT';
                  else cellStatus = 'OPEN';
                }

                const bgColor = isPast
                  ? 'bg-slate-50'
                  : row?.is_closed
                    ? 'bg-red-50 hover:bg-red-100'
                    : row
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-white hover:bg-[#5ac4d7]/5 border-dashed border-[#5ac4d7]/25';

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (isPast) return;
                      if (row) {
                        activeTab === 'packages' ? setEditPackageRow(row) : setEditRoomRow(row);
                      } else {
                        setCreateDate(dateStr);
                      }
                    }}
                    className={`min-h-[90px] cursor-pointer border-b border-r border-slate-100 p-2 transition-colors group ${bgColor} ${!isPast ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <p className={`text-sm font-black ${isPast ? 'text-slate-300' : 'text-slate-700'}`}>{day}</p>
                    {isPast ? (
                      <p className="mt-1 text-[9px] text-slate-300 font-semibold">Past</p>
                    ) : row ? (
                      <div className="mt-1.5 space-y-1">
                        <StatusBadge status={cellStatus} />
                        <p className="text-[10px] font-bold text-slate-500">
                          {activeTab === 'packages' ? `${row.available_seats}/${row.total_capacity}` : `${row.available_rooms}/${row.total_rooms}`}
                        </p>
                        {activeTab === 'packages' && row.price_override !== null && row.price_override !== 0 && (
                          <p className="text-[9px] font-bold text-[#1a6b7a]">
                            {row.price_override > 0 ? `+₹${row.price_override}` : `₹${row.price_override}`}
                          </p>
                        )}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Sliders className="h-2.5 w-2.5 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-500">Edit</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex flex-col items-start gap-1">
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
        <CreateModal
          mode={activeTab === 'packages' ? 'package' : 'room'}
          entityId={activeTab === 'packages' ? selectedVariantId! : selectedRoomVariantId!}
          dateStr={createDate}
          onClose={() => setCreateDate(null)}
          onCreated={refresh}
        />
      )}
      {showGenerate && hasSelection && (
        <GenerateModal
          mode={activeTab === 'packages' ? 'package' : 'room'}
          entityId={activeTab === 'packages' ? selectedVariantId! : selectedRoomVariantId!}
          currentMonth={formatMonth(calYear, calMonth)}
          onClose={() => setShowGenerate(false)}
          onGenerated={refresh}
        />
      )}
    </div>
  );
}
