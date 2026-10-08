'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
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
  Users,
  Loader2,
  FolderPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import ReorderPackagesModal from '@/components/admin/ReorderPackagesModal';

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
  const packages = useAdminStore((s) => s.packages);
  const packagesTotal = useAdminStore((s) => s.packagesTotal);
  const packagesPage = useAdminStore((s) => s.packagesPage);
  const packagesLimit = useAdminStore((s) => s.packagesLimit);
  const isLoading = useAdminStore((s) => s.isLoading);
  const error = useAdminStore((s) => s.error);
  const fetchPackages = useAdminStore((s) => s.fetchPackages);
  const updatePackage = useAdminStore((s) => s.updatePackage);
  const deletePackage = useAdminStore((s) => s.deletePackage);
  const createPackage = useAdminStore((s) => s.createPackage);
  const reorderPackages = useAdminStore((s) => s.reorderPackages);

  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [savingPriorityId, setSavingPriorityId] = useState<number | null>(null);

  // Status toggle states
  const [selectedPackageToToggle, setSelectedPackageToToggle] = useState<any | null>(null);
  const [futureBookingsList, setFutureBookingsList] = useState<any[]>([]);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState<number | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    fetchPackages('', statusFilter, 1, packagesLimit).finally(() => setHasFetched(true));
  }, [statusFilter, packagesLimit]);

  const handleInlinePrioritySave = async (pkgId: number, newPriority: number) => {
    try {
      setSavingPriorityId(pkgId);
      await updatePackage(pkgId, { order_priority: newPriority });
      toast.success(`Display order updated to #${newPriority}`);
      await fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
    } catch (err: any) {
      toast.error('Failed to update order priority');
    } finally {
      setSavingPriorityId(null);
    }
  };

  const handleMovePackage = async (index: number, direction: 'up' | 'down', currentList: any[]) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const currentPkg = currentList[index];
    const targetPkg = currentList[targetIndex];

    const currentOrder = currentPkg.order_priority ?? index + 1;
    const targetOrder = targetPkg.order_priority ?? targetIndex + 1;

    const newCurrentOrder = targetOrder === currentOrder 
      ? (direction === 'up' ? Math.max(0, currentOrder - 1) : currentOrder + 1) 
      : targetOrder;
    const newTargetOrder = currentOrder;

    try {
      setSavingPriorityId(currentPkg.id);
      await reorderPackages([
        { id: currentPkg.id, order_priority: newCurrentOrder },
        { id: targetPkg.id, order_priority: newTargetOrder },
      ]);
      toast.success(`Moved "${currentPkg.title}" ${direction}`);
      await fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
    } catch (err) {
      toast.error('Failed to move package');
    } finally {
      setSavingPriorityId(null);
    }
  };

  const featuredRankMap = React.useMemo(() => {
    const map = new Map<number, number>();
    if (!packages || !Array.isArray(packages)) return map;
    const sortedFeatured = [...packages]
      .filter((p) => p.is_featured)
      .sort((a, b) => {
        const pA = a.order_priority ?? 9999;
        const pB = b.order_priority ?? 9999;
        if (pA !== pB) return pA - pB;
        return a.id - b.id;
      });
    sortedFeatured.forEach((pkg, idx) => {
      map.set(pkg.id, idx + 1);
    });
    return map;
  }, [packages]);


  const handleDeleteConfirm = async () => {
    if (selectedPackageId) {
      await deletePackage(selectedPackageId);
      toast.success('Package archived/deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedPackageId(null);
    }
  };

  const handleToggleActive = async (pkg: any) => {
    if (togglingActiveId) return;
    setTogglingActiveId(pkg.id);
    if (pkg.is_active) {
      // Admin is turning the package INACTIVE. Let's fetch future bookings first!
      try {
        const response = await apiClient.get(`/api/v1/admin/packages/${pkg.id}/future-bookings`);
        if (response.data && response.data.length > 0) {
          // Future bookings exist! Open the confirmation dialog with bookings list!
          setFutureBookingsList(response.data);
          setSelectedPackageToToggle(pkg);
          setIsToggleModalOpen(true);
          setTogglingActiveId(null);
        } else {
          // No future bookings! Instantly make it inactive.
          await updatePackage(pkg.id, { is_active: false });
          toast.success(`"${pkg.title}" is now closed / inactive for bookings`);
          fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
          setTogglingActiveId(null);
        }
      } catch (err: any) {
        toast.error('Failed to check future bookings');
        setTogglingActiveId(null);
      }
    } else {
      // Admin is turning the package ACTIVE. No future bookings check needed.
      try {
        await updatePackage(pkg.id, { is_active: true });
        toast.success(`"${pkg.title}" is now active and accepting bookings`);
        fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
      } catch (err: any) {
        toast.error('Failed to activate package');
      } finally {
        setTogglingActiveId(null);
      }
    }
  };

  const handleToggleStatus = async (pkg: any) => {
    if (togglingStatusId) return;
    setTogglingStatusId(pkg.id);
    try {
      const newStatus = 
        pkg.status === 'DRAFT' ? 'PUBLISHED' :
        pkg.status === 'PUBLISHED' ? 'ARCHIVED' : 'DRAFT';

      if (newStatus === 'ARCHIVED' || newStatus === 'DRAFT') {
        const response = await apiClient.get(`/api/v1/admin/packages/${pkg.id}/future-bookings`);
        if (response.data && response.data.length > 0) {
          setFutureBookingsList(response.data);
          setSelectedPackageToToggle({ ...pkg, intent: 'STATUS', newStatus });
          setIsToggleModalOpen(true);
          setTogglingStatusId(null);
          return;
        }
      }

      await updatePackage(pkg.id, { status: newStatus });
      toast.success(`Package "${pkg.title}" status updated to ${newStatus}`);
      fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
    } catch (err: any) {
      toast.error('Failed to update package status');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleConfirmToggleInactive = async () => {
    if (selectedPackageToToggle) {
      setIsConfirming(true);
      try {
        if (selectedPackageToToggle.intent === 'STATUS') {
          await updatePackage(selectedPackageToToggle.id, { status: selectedPackageToToggle.newStatus });
          toast.success(`Package "${selectedPackageToToggle.title}" status updated to ${selectedPackageToToggle.newStatus}`);
        } else {
          await updatePackage(selectedPackageToToggle.id, { is_active: false });
          toast.success(`"${selectedPackageToToggle.title}" is now closed / inactive for bookings`);
        }
        setIsToggleModalOpen(false);
        setSelectedPackageToToggle(null);
        setFutureBookingsList([]);
        fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
      } catch (err: any) {
        toast.error('Failed to close package');
      } finally {
        setIsConfirming(false);
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
      fetchPackages('', statusFilter, 1, packagesLimit, true);
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
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setIsReorderModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
          >
            <ArrowUpDown className="h-4 w-4 text-[#1598a1] shrink-0" />
            <span>Reorder Packages</span>
          </button>
          <Link 
            href="/admin/packages/categories"
            prefetch={false}
            className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <FolderPlus className="h-4 w-4 text-[#1598a1] shrink-0" />
            <span>Manage Categories</span>
          </Link>
          <Link 
            href="/admin/packages/create"
            prefetch={false}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Create New Package</span>
          </Link>
        </div>
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
        <div className="flex flex-wrap gap-3">
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
          <CustomFilterSelect
            value={regionFilter}
            options={[
              { value: 'all', label: 'All Regions' },
              { value: 'AP', label: 'Andhra Pradesh (AP)' },
              { value: 'TS', label: 'Telangana (TS)' },
            ]}
            onChange={setRegionFilter}
            placeholder="All Regions"
          />
          <CustomFilterSelect
            value={featuredFilter}
            options={[
              { value: 'all', label: 'All Features' },
              { value: 'featured', label: 'Featured Only' },
              { value: 'non-featured', label: 'Non-Featured Only' },
            ]}
            onChange={setFeaturedFilter}
            placeholder="All Features"
          />
          <CustomFilterSelect
            value={sortBy}
            options={[
              { value: 'default', label: 'Sort: Default' },
              { value: 'bookings-desc', label: 'Sort: Highest Bookings' },
              { value: 'price-asc', label: 'Sort: Price (Low to High)' },
              { value: 'price-desc', label: 'Sort: Price (High to Low)' },
            ]}
            onChange={setSortBy}
            placeholder="Sort: Default"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm max-w-full">
        <div className="md:hidden px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>← Swipe horizontally to view all columns & actions →</span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[880px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-4 text-center w-28" title="Order Priority: lower numbers appear first across website and categories">Order #</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Active Booking</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Home / Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {error && (!packages || packages.length === 0) ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-bold text-red-600">{error}</p>
                      <button
                        type="button"
                        onClick={() => fetchPackages('', statusFilter, 1, packagesLimit)}
                        className="px-4 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold cursor-pointer transition-colors"
                      >
                        Retry Loading Packages
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (!hasFetched && (!packages || packages.length === 0)) ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent inline-block" />
                  </td>
                </tr>
              ) : (() => {
                let filteredPackages = Array.isArray(packages) 
                  ? packages.filter(pkg => 
                      searchVal === '' || 
                      (pkg.title && pkg.title.toLowerCase().includes(searchVal.toLowerCase())) || 
                      (pkg.slug && pkg.slug.toLowerCase().includes(searchVal.toLowerCase()))
                    )
                  : [];

                // Region Filter
                if (regionFilter !== 'all') {
                  filteredPackages = filteredPackages.filter(pkg => pkg.region === regionFilter);
                }

                // Featured Filter
                if (featuredFilter === 'featured') {
                  filteredPackages = filteredPackages.filter(pkg => pkg.is_featured === true);
                } else if (featuredFilter === 'non-featured') {
                  filteredPackages = filteredPackages.filter(pkg => pkg.is_featured !== true);
                }

                // Sort By
                if (sortBy === 'default') {
                  filteredPackages.sort((a, b) => {
                    const orderA = a.order_priority !== null && a.order_priority !== undefined ? a.order_priority : 9999;
                    const orderB = b.order_priority !== null && b.order_priority !== undefined ? b.order_priority : 9999;
                    if (orderA !== orderB) return orderA - orderB;
                    return a.id - b.id;
                  });
                } else if (sortBy === 'bookings-desc') {
                  filteredPackages.sort((a, b) => (b.active_booking_count || 0) - (a.active_booking_count || 0));
                } else if (sortBy === 'price-asc') {
                  filteredPackages.sort((a, b) => Number(a.starting_price || 0) - Number(b.starting_price || 0));
                } else if (sortBy === 'price-desc') {
                  filteredPackages.sort((a, b) => Number(b.starting_price || 0) - Number(a.starting_price || 0));
                }
                  
                if (filteredPackages.length === 0) {
                  return (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-400">
                        <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-700">No packages found</h3>
                        <p className="text-xs text-slate-400 mt-1 mb-4">Try resetting filters, or click below to reload packages.</p>
                        <button
                          type="button"
                          onClick={() => {
                            fetchPackages('', statusFilter, 1, packagesLimit);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#5ac4d7]/10 text-[#0f3d56] hover:bg-[#5ac4d7]/20 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          ⚡ Reload Packages List
                        </button>
                      </td>
                    </tr>
                  );
                }

                return filteredPackages.map((pkg, index) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Order # Priority Cell */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMovePackage(index, 'up', filteredPackages)}
                            disabled={index === 0 || savingPriorityId === pkg.id}
                            title="Move Up"
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePackage(index, 'down', filteredPackages)}
                            disabled={index === filteredPackages.length - 1 || savingPriorityId === pkg.id}
                            title="Move Down"
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="999"
                            defaultValue={pkg.order_priority ?? 0}
                            key={`${pkg.id}-${pkg.order_priority}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val !== pkg.order_priority) {
                                handleInlinePrioritySave(pkg.id, val);
                              }
                            }}
                            disabled={savingPriorityId === pkg.id}
                            className="w-14 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1.5 text-center text-xs font-black text-slate-800 focus:bg-white focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] outline-none transition-all"
                            title="Click and type sequence number (press Enter to save)"
                          />
                          {savingPriorityId === pkg.id && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5ac4d7]"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                          <img
                            src={pkg.cover_image_url || 'https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png'}
                            alt={pkg.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png';
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-[#5ac4d7] transition-colors">{pkg.title}</h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-[11px] text-slate-400 max-w-[140px] truncate">{pkg.slug}</span>
                            {pkg.categories && pkg.categories.length > 0 ? (
                              pkg.categories.map((cat: any) => (
                                <span key={cat.id} className="px-2 py-0.5 rounded-md bg-[#1598a1]/10 text-[#0f3d56] text-[10px] font-bold border border-[#1598a1]/20 inline-flex items-center gap-1">
                                  <span>{cat.icon || '📁'}</span>
                                  <span>{cat.name}</span>
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-medium">Uncategorized</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {pkg.type === 'TOUR' ? 'Boat Rides' : pkg.type === 'TRIP' ? 'Sightseeing' : pkg.type}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500 uppercase">{pkg.region || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-black text-indigo-700 ring-1 ring-inset ring-indigo-200" title="Total Active Bookings">
                          {pkg.active_booking_count || 0}
                        </span>
                        <button
                          onClick={() => handleToggleActive(pkg)}
                          disabled={togglingActiveId === pkg.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer disabled:opacity-70 disabled:cursor-wait ${
                            togglingActiveId === pkg.id
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : pkg.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {togglingActiveId === pkg.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Updating</>
                          ) : (
                            <>
                              <span className={`h-2 w-2 rounded-full ${pkg.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {pkg.is_active ? 'Accepting Bookings' : 'Closed / Inactive'}
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={togglingStatusId === pkg.id}
                        onClick={() => handleToggleStatus(pkg)}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 disabled:active:scale-100 ${
                          togglingStatusId === pkg.id ? 'bg-slate-100 text-slate-500 border-slate-200' : getStatusColor(pkg.status)
                        }`}
                      >
                        {togglingStatusId === pkg.id ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Updating</>
                        ) : pkg.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const updatedFeatured = !pkg.is_featured;
                              await updatePackage(pkg.id, {
                                is_featured: updatedFeatured
                              });
                              await fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
                              toast.success(`Package "${pkg.title}" ${updatedFeatured ? 'is now FEATURED on Home Page' : 'removed from Home Page'}`);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to toggle featured status');
                            }
                          }}
                          title={pkg.is_featured ? "Click to remove from Home Page" : "Click to feature on Home Page"}
                          className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                            pkg.is_featured ? 'bg-amber-500 ring-2 ring-amber-200' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              pkg.is_featured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        {(() => {
                          if (!pkg.is_featured) {
                            return (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                Hidden
                              </span>
                            );
                          }
                          const homeRank = featuredRankMap.get(pkg.id);
                          if (homeRank && homeRank <= 3) {
                            return (
                              <span 
                                title="Featured in the Top 3 hero cards on the TS Boat Tourism Home Page!"
                                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 px-2 py-0.5 rounded-md shadow-xs animate-pulse"
                              >
                                <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
                                <span>★ Home #{homeRank}</span>
                              </span>
                            );
                          }
                          return (
                            <span 
                              title={`Featured package (Home rank #${homeRank}), shown on Home Page 'View All'`}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"
                            >
                              <span>Home #{homeRank}</span>
                            </span>
                          );
                        })()}
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
                ));
              })()}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={packagesPage}
          totalItems={packagesTotal}
          pageSize={packagesLimit}
          onPageChange={(page) => fetchPackages('', statusFilter, page, packagesLimit)}
          onPageSizeChange={(size) => fetchPackages('', statusFilter, 1, size)}
        />
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

      {/* Visual Bulk Reorder Packages Modal */}
      <ReorderPackagesModal 
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        packages={packages || []}
        onSave={async (items) => {
          await reorderPackages(items);
          await fetchPackages('', statusFilter, packagesPage, packagesLimit, true);
        }}
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

              {/* Summary of Bookings (Simplified as requested) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 mb-6 text-center">
                <p className="text-sm font-bold text-slate-700">
                  There are <span className="text-rose-600 font-black text-lg">{futureBookingsList.length}</span> active future bookings.
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Active bookings won't be deleted, and no further bookings will be allowed until you reopen.
                </p>
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
                  disabled={isConfirming}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50 hover:border-slate-350 active:scale-95 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel, Keep Active
                </button>
                <button
                  onClick={handleConfirmToggleInactive}
                  disabled={isConfirming}
                  className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shadow-md shadow-rose-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isConfirming && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  Yes, {selectedPackageToToggle?.intent === 'STATUS' ? `Change to ${selectedPackageToToggle.newStatus}` : 'Inactivate Anyway'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

