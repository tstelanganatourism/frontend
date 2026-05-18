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
import PremiumSelect from '@/components/ui/PremiumSelect';

export default function AdminCouponCreatePage() {
  const router = useRouter();
  const { packages, isLoading, fetchPackages, createCoupon } = useAdminStore();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [packageId, setPackageId] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

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
      const payload = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_booking_amount: minBookingAmount ? Number(minBookingAmount) : null,
        max_discount_amount: discountType === 'PERCENTAGE' && maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        package_id: packageId ? Number(packageId) : null,
        valid_from: validFrom ? new Date(validFrom).toISOString() : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        is_active: isActive
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
    <div className="max-w-4xl mx-auto space-y-8">
      
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
              <input 
                type="datetime-local" 
                value={validFrom} 
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Expiry Date</label>
              <input 
                type="datetime-local" 
                value={validUntil} 
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-55 px-5 py-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <PremiumSelect
                label="Restrict to specific package"
                value={packageId}
                onChange={(val) => setPackageId(val || '')}
                options={[
                  { value: '', label: 'Apply Globally (All Packages)' },
                  ...(Array.isArray(packages) ? packages.map((pkg) => ({ value: String(pkg.id), label: pkg.title })) : []),
                ]}
                placeholder="Apply Globally (All Packages)"
              />
            </div>
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
