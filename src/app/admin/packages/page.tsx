'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Copy,
  ChevronRight,
  ShieldAlert,
  ChevronDown,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

function CustomFilterSelect({ 
  value, 
  options, 
  onChange,
  placeholder
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-bold text-slate-700 cursor-pointer shadow-sm hover:border-slate-350 transition-all outline-none min-w-[150px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 shrink-0" />
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 z-50 rounded-xl border border-slate-150 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 min-w-[160px]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-black cursor-pointer transition-all ${
                  opt.value === value
                    ? 'bg-[#5ac4d7]/10 text-[#0f3d56]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPackagesPage() {
  const { packages, isLoading, fetchPackages, updatePackage, deletePackage, createPackage } = useAdminStore();
  const [searchVal, setSearchVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Status toggle states
  const [selectedPackageToToggle, setSelectedPackageToToggle] = useState<any | null>(null);
  const [futureBookingsList, setFutureBookingsList] = useState<any[]>([]);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isTogglingState, setIsTogglingState] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchVal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  useEffect(() => {
    fetchPackages(searchQuery, statusFilter);
  }, [fetchPackages, searchQuery, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (selectedPackageId) {
      await deletePackage(selectedPackageId);
      toast.success('Package archived/deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedPackageId(null);
    }
  };

  const handleToggleActive = async (pkg: any) => {
    if (pkg.is_active) {
      // Admin is turning the package INACTIVE. Let's fetch future bookings first!
      setIsTogglingState(true);
      try {
        const response = await apiClient.get(`/api/v1/admin/packages/${pkg.id}/future-bookings`);
        if (response.data && response.data.length > 0) {
          // Future bookings exist! Open the confirmation dialog with bookings list!
          setFutureBookingsList(response.data);
          setSelectedPackageToToggle(pkg);
          setIsToggleModalOpen(true);
        } else {
          // No future bookings! Instantly make it inactive.
          await updatePackage(pkg.id, { is_active: false });
          toast.success(`"${pkg.title}" is now closed / inactive for bookings`);
          fetchPackages(searchQuery, statusFilter);
        }
      } catch (err: any) {
        toast.error('Failed to check future bookings');
      } finally {
        setIsTogglingState(false);
      }
    } else {
      // Admin is turning the package ACTIVE. No future bookings check needed.
      try {
        await updatePackage(pkg.id, { is_active: true });
        toast.success(`"${pkg.title}" is now active and accepting bookings`);
        fetchPackages(searchQuery, statusFilter);
      } catch (err: any) {
        toast.error('Failed to activate package');
      }
    }
  };

  const handleConfirmToggleInactive = async () => {
    if (selectedPackageToToggle) {
      try {
        await updatePackage(selectedPackageToToggle.id, { is_active: false });
        toast.success(`"${selectedPackageToToggle.title}" is now closed / inactive for bookings`);
        setIsToggleModalOpen(false);
        setSelectedPackageToToggle(null);
        setFutureBookingsList([]);
        fetchPackages(searchQuery, statusFilter);
      } catch (err: any) {
        toast.error('Failed to close package');
      }
    }
  };


  const handleDuplicate = async (pkg: any) => {
    try {
      // 1. Fetch full package details from the API including all nested lists
      const response = await apiClient.get(`/api/v1/admin/packages/${pkg.id}`);
      const fullPkg = response.data;

      // 2. Clone the full data
      const duplicatedData = {
        ...fullPkg,
        title: `${fullPkg.title} (Copy)`,
        slug: `${fullPkg.slug}-copy-${Date.now()}`,
        status: 'DRAFT',
      };

      // Helper function to remove database primary/foreign/timestamp keys from children
      const cleanChildArray = (arr: any[]) => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(item => {
          const cleanItem = { ...item };
          delete cleanItem.id;
          delete cleanItem.package_id;
          delete cleanItem.created_at;
          delete cleanItem.updated_at;
          delete cleanItem.deleted_at;
          return cleanItem;
        });
      };

      // 3. Eager load and deep clone children
      duplicatedData.variants = cleanChildArray(fullPkg.variants);
      duplicatedData.gallery = cleanChildArray(fullPkg.gallery);
      duplicatedData.itinerary = cleanChildArray(fullPkg.itinerary);
      duplicatedData.highlights = cleanChildArray(fullPkg.highlights);
      duplicatedData.inclusions = cleanChildArray(fullPkg.inclusions);
      duplicatedData.exclusions = cleanChildArray(fullPkg.exclusions);
      duplicatedData.boarding_points = cleanChildArray(fullPkg.boarding_points);
      duplicatedData.faqs = cleanChildArray(fullPkg.faqs);
      duplicatedData.policies = cleanChildArray(fullPkg.policies);

      // 4. Remove root-level database generated keys
      delete duplicatedData.id;
      delete duplicatedData.created_at;
      delete duplicatedData.updated_at;
      delete duplicatedData.deleted_at;
      delete duplicatedData.starting_price;
      delete duplicatedData.generated_brochure_url;
      delete duplicatedData.brochure_pdf_url; // Clear so new copy gets a clean brochure cycle

      await createPackage(duplicatedData);
      toast.success('Package duplicated successfully with all details!');
      fetchPackages(searchQuery, statusFilter);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to duplicate package');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DRAFT': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ARCHIVED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Tours & Packages</h1>
          <p className="text-slate-500 mt-1">Manage and curate public tour experiences and trips.</p>
        </div>
        <Link 
          href="/admin/packages/create"
          prefetch={false}
          className="flex items-center gap-2 self-start rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create New Package
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search packages by title or description..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
          />
        </div>
        <div className="flex gap-4">
          <CustomFilterSelect
            value={statusFilter}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'ARCHIVED', label: 'Archived' }
            ]}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Active Booking</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent inline-block" />
                  </td>
                </tr>
              ) : !Array.isArray(packages) || packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-700">No packages found</h3>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or create a new package.</p>
                  </td>
                </tr>
              ) : (
                Array.isArray(packages) && packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                          {pkg.cover_image_url ? (
                            <img src={pkg.cover_image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">No Image</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-[#5ac4d7] transition-colors">{pkg.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{pkg.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 capitalize">{pkg.type.toLowerCase()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500 uppercase">{pkg.region || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        disabled={isTogglingState}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                          pkg.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${pkg.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {pkg.is_active ? 'Accepting Bookings' : 'Closed / Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const newStatus = 
                              pkg.status === 'DRAFT' ? 'PUBLISHED' :
                              pkg.status === 'PUBLISHED' ? 'ARCHIVED' : 'DRAFT';
                            await updatePackage(pkg.id, {
                              status: newStatus
                            });
                            await fetchPackages(searchQuery, statusFilter);
                            toast.success(`Package "${pkg.title}" status updated to ${newStatus}`);
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to update package status');
                          }
                        }}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all ${getStatusColor(pkg.status)}`}
                      >
                        {pkg.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const updatedFeatured = !pkg.is_featured;
                              await updatePackage(pkg.id, {
                                is_featured: updatedFeatured
                              });
                              await fetchPackages(searchQuery, statusFilter);
                              toast.success(`Package "${pkg.title}" is now ${updatedFeatured ? 'Featured' : 'Not Featured'}`);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to toggle featured status');
                            }
                          }}
                          className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                            pkg.is_featured ? 'bg-amber-500' : 'bg-slate-350'
                          }`}
                        >
                          <div
                            className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              pkg.is_featured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${pkg.is_featured ? 'text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md' : 'text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md'}`}>
                          {pkg.is_featured ? 'Featured' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/packages/${pkg.slug}`}
                          target="_blank"
                          prefetch={false}
                          title="View Public Page"
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(pkg)}
                          title="Duplicate"
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <Link 
                          href={`/admin/packages/edit/${pkg.id}`}
                          prefetch={false}
                          title="Edit"
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedPackageId(pkg.id);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete/Archive"
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Archival"
        message="Are you sure you want to archive/delete this tour package? This will take it offline."
        confirmText="Archive Package"
        cancelText="Cancel"
        type="danger"
      />

      {/* Active Booking Future Warnings Modal */}
      <AnimatePresence>
        {isToggleModalOpen && selectedPackageToToggle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setIsToggleModalOpen(false)} 
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />

              {/* Header Info */}
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Active Future Bookings Found</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    You are trying to turn off bookings for <span className="font-bold text-slate-800">"{selectedPackageToToggle.title}"</span>. The following customers have active bookings scheduled:
                  </p>
                </div>
              </div>

              {/* List of Bookings */}
              <div className="max-h-60 overflow-y-auto border border-slate-150 rounded-2xl divide-y divide-slate-100 bg-slate-50 p-2 space-y-2 mb-6">
                {futureBookingsList.map((booking: any) => (
                  <div key={booking.id} className="p-3.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#0f3d56] bg-[#0f3d56]/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{booking.public_id}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-bold mt-1">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>
                          {new Date(booking.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-black text-slate-900 block text-sm">₹{booking.total_amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1">
                        <Users className="h-3 w-3 text-slate-350" />
                        {booking.adult_count} A / {booking.child_count} C
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs font-bold text-rose-600 mb-6 bg-rose-50/70 border border-rose-100/70 rounded-xl p-3.5 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-black">Warning to Administrator</p>
                  <p className="text-slate-500 font-bold text-[11px] mt-0.5 leading-relaxed">
                    Inactivating this package will block all new bookings immediately. However, you must honor the existing bookings above or manually cancel them in operations.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsToggleModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50 hover:border-slate-350 active:scale-95 transition-all outline-none"
                >
                  Cancel, Keep Active
                </button>
                <button
                  onClick={handleConfirmToggleInactive}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shadow-md shadow-rose-200 outline-none"
                >
                  Yes, Inactivate Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

