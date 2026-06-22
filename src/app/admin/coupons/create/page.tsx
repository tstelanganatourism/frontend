'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Tag, 
  Percent, 
  Coins, 
  CalendarDays, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import PremiumMultiSelect from '@/components/ui/PremiumMultiSelect';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

export default function AdminCouponCreatePage() {
  const router = useRouter();
  const { packages, rooms, isLoading, fetchPackages, fetchRooms, createCoupon } = useAdminStore();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [minTickets, setMinTickets] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [applicablePackageIds, setApplicablePackageIds] = useState<string[]>([]);
  const [applicableRoomIds, setApplicableRoomIds] = useState<string[]>([]);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isWeekendOnly, setIsWeekendOnly] = useState(false);
  const [targetMode, setTargetMode] = useState<'GLOBAL' | 'PACKAGES_ONLY' | 'ROOMS_ONLY' | 'CUSTOM'>('GLOBAL');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPackages(undefined, undefined, 1, 1000);
    fetchRooms(undefined, undefined, 1, 1000);
  }, [fetchPackages, fetchRooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      let finalPackages: number[] = [];
      let finalRooms: number[] = [];

      if (targetMode === 'GLOBAL') {
        finalPackages = [];
        finalRooms = [];
      } else if (targetMode === 'PACKAGES_ONLY') {
        finalPackages = [-1];
        finalRooms = [];
      } else if (targetMode === 'ROOMS_ONLY') {
        finalPackages = [];
        finalRooms = [-1];
      } else if (targetMode === 'CUSTOM') {
        finalPackages = applicablePackageIds.map(Number);
        finalRooms = applicableRoomIds.map(Number);
      }

      const payload = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_booking_amount: minBookingAmount ? Number(minBookingAmount) : null,
        max_discount_amount: discountType === 'PERCENTAGE' && maxDiscountAmount ? Number(maxDiscountAmount) : null,
        min_tickets: minTickets ? Number(minTickets) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        applicable_package_ids: finalPackages,
        applicable_room_ids: finalRooms,
        valid_from: validFrom ? new Date(validFrom).toISOString() : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        is_active: isActive,
        is_weekend_only: isWeekendOnly
      };

      await createCoupon(payload);
      toast.success('Coupon created successfully');
      router.push('/admin/coupons');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 px-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-150 pb-6">
        <Link 
          href="/admin/coupons"
          className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all hover:scale-105 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Create Promo Coupon</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Configure discount amounts, validity thresholds, and product scope parameters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Core Discount Parameters</h2>
              <p className="text-[10px] font-semibold text-slate-400">Specify unique code and type of discount.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coupon Code *</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.G. PAPISUMMER50"
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Only alphabets and numbers. Auto-converted to uppercase.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDiscountType('PERCENTAGE')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-xs font-black uppercase tracking-wider transition-all ${
                    discountType === 'PERCENTAGE' 
                      ? 'border-sky-500 bg-sky-50/50 text-sky-700' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Percent className="h-4 w-4" /> Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('FLAT')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-xs font-black uppercase tracking-wider transition-all ${
                    discountType === 'FLAT' 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <Coins className="h-4 w-4" /> Flat Rupees
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Discount Value ({discountType === 'PERCENTAGE' ? '%' : '₹'}) *
              </label>
              <input 
                type="number" 
                value={discountValue} 
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENTAGE' ? '10' : '500'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            {discountType === 'PERCENTAGE' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Maximum discount limit cap (₹)</label>
                <input 
                  type="number" 
                  value={maxDiscountAmount} 
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                  min="0"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Locks maximum flat discount deduction even if calculation exceeds it.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Constraint Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Usage Thresholds & Constraints</h2>
              <p className="text-[10px] font-semibold text-slate-400">Configure min totals, dates, and campaign scopes.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Booking amount (₹)</label>
              <input 
                type="number" 
                value={minBookingAmount} 
                onChange={(e) => setMinBookingAmount(e.target.value)}
                placeholder="2000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                min="0"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Only triggers if booking total matches or exceeds this value.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Passengers/Tickets</label>
              <input 
                type="number" 
                value={minTickets} 
                onChange={(e) => setMinTickets(e.target.value)}
                placeholder="5"
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                min="1"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Only triggers if the passenger count matches or exceeds this value.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Limit (Usage Count Cap)</label>
              <input 
                type="number" 
                value={usageLimit} 
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="100"
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                min="1"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold">Maximum times this coupon can be redeemed across the system.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Start Date</label>
              <CustomDatePicker
                value={validFrom}
                onChange={setValidFrom}
                placeholder="Start Date"
                allowPast={true}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Expiry Date</label>
              <CustomDatePicker
                value={validUntil}
                min={validFrom}
                onChange={setValidUntil}
                placeholder="End Date"
                allowPast={true}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Target Application Mode</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { id: 'GLOBAL', label: 'Global (All)' },
                { id: 'PACKAGES_ONLY', label: 'Packages Only' },
                { id: 'ROOMS_ONLY', label: 'Rooms Only' },
                { id: 'CUSTOM', label: 'Custom Target' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTargetMode(mode.id as any)}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                    targetMode === mode.id 
                      ? 'border-[#5ac4d7] bg-[#5ac4d7]/10 text-[#0f3d56]' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {targetMode === 'CUSTOM' && (
              <div className="grid gap-6 sm:grid-cols-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Restrict to specific packages</label>
                  <PremiumMultiSelect
                    options={packages.map(p => ({ value: p.id.toString(), label: p.title }))}
                    value={applicablePackageIds}
                    onChange={setApplicablePackageIds}
                    placeholder="Select Packages..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Restrict to specific rooms</label>
                  <PremiumMultiSelect
                    options={rooms.map(r => ({ value: r.id.toString(), label: r.lodge_name }))}
                    value={applicableRoomIds}
                    onChange={setApplicableRoomIds}
                    placeholder="Select Rooms..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-100 pt-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Active</label>
              <div className="flex items-center gap-4 h-[54px]">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                    isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  {isActive ? 'Active Campaign' : 'Paused / Inactive'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weekend Only Validity</label>
              <div className="flex items-center gap-4 h-[54px]">
                <button
                  type="button"
                  onClick={() => setIsWeekendOnly(!isWeekendOnly)}
                  className={`flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                    isWeekendOnly ? 'bg-purple-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      isWeekendOnly ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  {isWeekendOnly ? 'Weekends Only (Sat/Sun)' : 'Valid Any Day'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/coupons"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-black tracking-wider uppercase text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-10 py-4 text-sm font-black tracking-wider uppercase text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Coupon
          </button>
        </div>

      </form>
    </div>
  );
}
