'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  ShieldAlert,
  Percent,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PremiumSelect from '@/components/ui/PremiumSelect';

export default function AdminCouponsPage() {
  const { coupons, packages, rooms, isLoading, fetchCoupons, fetchPackages, fetchRooms, updateCoupon, deleteCoupon } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState<'ALL' | 'PACKAGES' | 'ROOMS'>('ALL');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCoupons(searchQuery),
      fetchPackages(),
      fetchRooms()
    ]).finally(() => {
      setIsInitialMount(false);
    });
  }, [fetchCoupons, fetchPackages, fetchRooms, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (selectedCouponId) {
      await deleteCoupon(selectedCouponId);
      toast.success('Coupon deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedCouponId(null);
    }
  };

  const packageMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    const packageList = Array.isArray(packages) ? packages : [];
    packageList.forEach((pkg) => {
      map[pkg.id] = pkg.title;
    });
    return map;
  }, [packages]);

  const roomMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    const roomList = Array.isArray(rooms) ? rooms : [];
    roomList.forEach((rm) => {
      map[rm.id] = rm.lodge_name;
    });
    return map;
  }, [rooms]);

  const filteredCoupons = React.useMemo(() => {
    return coupons.filter(coupon => {
      const isGlobal = (!coupon.applicable_package_ids || coupon.applicable_package_ids.length === 0) && 
                       (!coupon.applicable_room_ids || coupon.applicable_room_ids.length === 0);
      if (targetFilter === 'ALL') return true;
      if (targetFilter === 'PACKAGES') return coupon.applicable_package_ids && coupon.applicable_package_ids.length > 0;
      if (targetFilter === 'ROOMS') return coupon.applicable_room_ids && coupon.applicable_room_ids.length > 0;
      return true;
    });
  }, [coupons, targetFilter]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date constraint';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Discount Coupons</h1>
          <p className="text-slate-500 mt-1">Manage marketing campaigns, percentage discounts, and pricing constraints.</p>
        </div>
        <Link 
          href="/admin/coupons/create"
          className="flex items-center gap-2 self-start rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create New Coupon
        </Link>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search coupons by code name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
          />
        </div>
        <div className="relative w-full md:w-56">
          <PremiumSelect
            value={targetFilter}
            onChange={(val) => setTargetFilter(val)}
            options={[
              { value: 'ALL', label: 'All Targets' },
              { value: 'PACKAGES', label: 'Packages Only' },
              { value: 'ROOMS', label: 'Rooms Only' },
            ]}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Discount Value</th>
                <th className="px-6 py-4">Applicable Products</th>
                <th className="px-6 py-4">Valid Period</th>
                <th className="px-6 py-4">Usage Tracker</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(isLoading || isInitialMount) ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent inline-block" />
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-700">No promo coupons found</h3>
                    <p className="text-xs text-slate-400 mt-1">Create a new coupon to launch promo campaign.</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = coupon.valid_until ? new Date(coupon.valid_until) < new Date() : false;
                  return (
                    <tr key={coupon.id} className={`hover:bg-slate-50/50 transition-colors group ${isExpired ? 'opacity-85 bg-rose-50/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <Tag className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 uppercase tracking-wider">{coupon.code}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                            Min booking: ₹{Number(coupon.min_booking_amount || 0).toLocaleString('en-IN')}
                            {coupon.min_tickets ? ` | Min pax: ${coupon.min_tickets}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        {coupon.discount_type === 'PERCENTAGE' ? (
                          <>
                            <Percent className="h-4 w-4 text-sky-500" />
                            <span>{Number(coupon.discount_value)}% Off</span>
                            {coupon.max_discount_amount && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-bold">Max ₹{Number(coupon.max_discount_amount)}</span>
                            )}
                          </>
                        ) : (
                          <span className="font-black text-emerald-600">₹{Number(coupon.discount_value).toLocaleString('en-IN')} Flat Off</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <div className="flex flex-col gap-1">
                        {(!coupon.applicable_package_ids || coupon.applicable_package_ids.length === 0) && (!coupon.applicable_room_ids || coupon.applicable_room_ids.length === 0) ? (
                          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md inline-block max-w-max">Global (All)</span>
                        ) : (
                          <>
                            {coupon.applicable_package_ids && coupon.applicable_package_ids.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {coupon.applicable_package_ids.map((id: number) => (
                                  <span key={`pkg-${id}`} className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded border border-indigo-100 max-w-[120px] truncate" title={packageMap[id]}>
                                    📦 {packageMap[id] || `Pkg ${id}`}
                                  </span>
                                ))}
                              </div>
                            )}
                            {coupon.applicable_room_ids && coupon.applicable_room_ids.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {coupon.applicable_room_ids.map((id: number) => (
                                  <span key={`rm-${id}`} className="text-[10px] bg-orange-50 text-orange-600 font-bold px-1.5 py-0.5 rounded border border-orange-100 max-w-[120px] truncate" title={roomMap[id]}>
                                    🏨 {roomMap[id] || `Rm ${id}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className={`h-3.5 w-3.5 ${isExpired ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                        <span className="text-xs flex items-center gap-1.5 flex-wrap">
                          {coupon.valid_from || coupon.valid_until ? (
                            <>
                              <span className={isExpired ? 'text-rose-600 line-through opacity-70 font-semibold' : ''}>
                                {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                              </span>
                              {isExpired && (
                                <span className="inline-flex text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-black uppercase tracking-wider scale-95 origin-left">
                                  Expired
                                </span>
                              )}
                            </>
                          ) : (
                            'Always Valid'
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {coupon.usage_count} / {coupon.usage_limit || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const updatedStatus = !coupon.is_active;
                              await updateCoupon(coupon.id, {
                                code: coupon.code,
                                discount_type: coupon.discount_type,
                                discount_value: Number(coupon.discount_value),
                                min_booking_amount: coupon.min_booking_amount ? Number(coupon.min_booking_amount) : null,
                                max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
                                min_tickets: coupon.min_tickets ? Number(coupon.min_tickets) : null,
                                usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : null,
                                applicable_package_ids: coupon.applicable_package_ids || [],
                                applicable_room_ids: coupon.applicable_room_ids || [],
                                valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString() : null,
                                valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString() : null,
                                is_active: updatedStatus
                              });
                              await fetchCoupons(searchQuery);
                              toast.success(`Coupon ${coupon.code} is now ${updatedStatus ? 'Active' : 'Inactive'}`);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to toggle coupon status');
                            }
                          }}
                          className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                            coupon.is_active ? 'bg-emerald-500' : 'bg-slate-350'
                          }`}
                        >
                          <div
                            className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              coupon.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isExpired 
                            ? 'text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md animate-pulse' 
                            : coupon.is_active 
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md' 
                              : 'text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md'
                        }`}>
                          {isExpired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/coupons/edit/${coupon.id}`}
                          title="Edit"
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedCouponId(coupon.id);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete"
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-55 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Coupon Deletion"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete Coupon"
        cancelText="Cancel"
        type="danger"
      />

    </div>
  );
}
