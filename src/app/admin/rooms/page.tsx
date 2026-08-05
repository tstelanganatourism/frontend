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
  Tv,
  Wifi,
  Wind,
  ChevronDown,
  Loader2,
  FolderPlus
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';

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

export default function AdminRoomsPage() {
  const { 
    rooms, 
    roomsTotal,
    roomsPage,
    roomsLimit,
    isLoading, 
    fetchRooms, 
    deleteRoom, 
    createRoom, 
    updateRoom 
  } = useAdminStore();
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Status toggle states
  const [selectedRoomToToggle, setSelectedRoomToToggle] = useState<any | null>(null);
  const [futureBookingsList, setFutureBookingsList] = useState<any[]>([]);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState<number | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    fetchRooms('', statusFilter, 1, roomsLimit).then(() => setHasFetched(true));
  }, [fetchRooms, statusFilter, roomsLimit]);



  const handleDeleteConfirm = async () => {
    if (selectedRoomId) {
      await deleteRoom(selectedRoomId);
      toast.success('Room/Lodge deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedRoomId(null);
    }
  };

  const handleDuplicate = async (room: any) => {
    try {
      // 1. Fetch full room/lodge details from the API including all nested lists
      const response = await apiClient.get(`/api/v1/admin/rooms/${room.id}`);
      const fullRoom = response.data;

      // 2. Clone the full data
      const duplicatedData = {
        ...fullRoom,
        lodge_name: `${fullRoom.lodge_name} (Copy)`,
        slug: `${fullRoom.slug}-copy-${Date.now()}`,
        status: 'DRAFT',
      };

      // Helper function to remove database primary/foreign/timestamp keys from children
      const cleanChildArray = (arr: any[]) => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(item => {
          const cleanItem = { ...item };
          delete cleanItem.id;
          delete cleanItem.room_id;
          delete cleanItem.created_at;
          delete cleanItem.updated_at;
          delete cleanItem.deleted_at;
          return cleanItem;
        });
      };

      // 3. Eager load and deep clone children
      duplicatedData.variants = cleanChildArray(fullRoom.variants);
      duplicatedData.gallery = cleanChildArray(fullRoom.gallery);
      duplicatedData.highlights = cleanChildArray(fullRoom.highlights);
      duplicatedData.faqs = cleanChildArray(fullRoom.faqs);
      duplicatedData.policies = cleanChildArray(fullRoom.policies);
      // Clean booking slots if present
      duplicatedData.booking_slots = cleanChildArray(fullRoom.booking_slots);

      // 4. Remove root-level database generated keys
      delete duplicatedData.id;
      delete duplicatedData.created_at;
      delete duplicatedData.updated_at;
      delete duplicatedData.deleted_at;
      delete duplicatedData.starting_price;

      await createRoom(duplicatedData);
      toast.success('Lodge duplicated successfully with all details!');
      fetchRooms('', statusFilter, 1, roomsLimit, true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to duplicate room');
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

  const handleToggleActive = async (room: any) => {
    if (togglingActiveId) return;
    setTogglingActiveId(room.id);
    if (room.is_active) {
      // Admin is turning the room INACTIVE. Let's fetch future bookings first!
      try {
        const response = await apiClient.get(`/api/v1/admin/rooms/${room.id}/future-bookings`);
        if (response.data && response.data.length > 0) {
          // Future bookings exist! Open the confirmation dialog with bookings list!
          setFutureBookingsList(response.data);
          setSelectedRoomToToggle(room);
          setIsToggleModalOpen(true);
          setTogglingActiveId(null);
        } else {
          // No future bookings! Instantly make it inactive.
          await updateRoom(room.id, { is_active: false });
          toast.success(`${room.lodge_name} is now closed / inactive`);
          fetchRooms('', statusFilter, roomsPage, roomsLimit, true);
          setTogglingActiveId(null);
        }
      } catch (err: any) {
        toast.error('Failed to check future bookings');
        setTogglingActiveId(null);
      }
    } else {
      // Admin is turning the room ACTIVE. No future bookings check needed.
      try {
        await updateRoom(room.id, { is_active: true });
        toast.success(`${room.lodge_name} is now active and accepting bookings`);
        fetchRooms('', statusFilter, roomsPage, roomsLimit, true);
      } catch (err: any) {
        toast.error('Failed to activate room');
      } finally {
        setTogglingActiveId(null);
      }
    }
  };

  const handleToggleStatus = async (room: any) => {
    if (togglingStatusId) return;
    setTogglingStatusId(room.id);
    try {
      const newStatus = 
        room.status === 'DRAFT' ? 'PUBLISHED' :
        room.status === 'PUBLISHED' ? 'ARCHIVED' : 'DRAFT';

      if (newStatus === 'ARCHIVED' || newStatus === 'DRAFT') {
        const response = await apiClient.get(`/api/v1/admin/rooms/${room.id}/future-bookings`);
        if (response.data && response.data.length > 0) {
          setFutureBookingsList(response.data);
          setSelectedRoomToToggle({ ...room, intent: 'STATUS', newStatus });
          setIsToggleModalOpen(true);
          setTogglingStatusId(null);
          return;
        }
      }

      await updateRoom(room.id, { status: newStatus });
      toast.success(`Lodge "${room.lodge_name}" status updated to ${newStatus}`);
      fetchRooms('', statusFilter, roomsPage, roomsLimit, true);
    } catch (err: any) {
      toast.error('Failed to update lodge status');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleConfirmToggleInactive = async () => {
    if (selectedRoomToToggle) {
      setIsConfirming(true);
      try {
        if (selectedRoomToToggle.intent === 'STATUS') {
          await updateRoom(selectedRoomToToggle.id, { status: selectedRoomToToggle.newStatus });
          toast.success(`Lodge "${selectedRoomToToggle.lodge_name}" status updated to ${selectedRoomToToggle.newStatus}`);
        } else {
          await updateRoom(selectedRoomToToggle.id, { is_active: false });
          toast.success(`${selectedRoomToToggle.lodge_name} is now closed / inactive`);
        }
        setIsToggleModalOpen(false);
        setSelectedRoomToToggle(null);
        setFutureBookingsList([]);
        fetchRooms('', statusFilter, roomsPage, roomsLimit, true);
      } catch (err: any) {
        toast.error('Failed to update room');
      } finally {
        setIsConfirming(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Hotels & Lodges</h1>
          <p className="text-slate-500 mt-1">Manage and configure room inventories and occupancy rules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/rooms/categories"
            prefetch={false}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <FolderPlus className="h-4 w-4 text-emerald-600" />
            Manage Categories
          </Link>
          <Link 
            href="/admin/rooms/create"
            prefetch={false}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create New Lodge
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search lodges by name, address or description..."
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
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Lodge / Property</th>
                <th className="px-6 py-4">Total Rooms</th>
                <th className="px-6 py-4">Check-in / Out Slots</th>
                <th className="px-6 py-4">Active Booking</th>
                <th className="px-6 py-4">Publish State</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading || !hasFetched ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent inline-block" />
                  </td>
                </tr>
              ) : (() => {
                let filteredRooms = Array.isArray(rooms)
                  ? rooms.filter(room => 
                      searchVal === '' || 
                      (room.lodge_name && room.lodge_name.toLowerCase().includes(searchVal.toLowerCase())) || 
                      (room.slug && room.slug.toLowerCase().includes(searchVal.toLowerCase()))
                    )
                  : [];

                // Region Filter (AP vs TS based on address)
                if (regionFilter === 'AP') {
                  filteredRooms = filteredRooms.filter(room => 
                    room.address && (
                      room.address.toLowerCase().includes('kolluru') || 
                      room.address.toLowerCase().includes('ap') || 
                      room.address.toLowerCase().includes('andhra')
                    )
                  );
                } else if (regionFilter === 'TS') {
                  filteredRooms = filteredRooms.filter(room => 
                    room.address && (
                      room.address.toLowerCase().includes('bhadrachalam') || 
                      room.address.toLowerCase().includes('ts') || 
                      room.address.toLowerCase().includes('telangana')
                    )
                  );
                }

                // Featured Filter
                if (featuredFilter === 'featured') {
                  filteredRooms = filteredRooms.filter(room => room.is_featured === true);
                } else if (featuredFilter === 'non-featured') {
                  filteredRooms = filteredRooms.filter(room => room.is_featured !== true);
                }

                // Sort By
                if (sortBy === 'bookings-desc') {
                  filteredRooms.sort((a, b) => (b.active_booking_count || 0) - (a.active_booking_count || 0));
                } else if (sortBy === 'price-asc') {
                  filteredRooms.sort((a, b) => Number(a.starting_price || 0) - Number(b.starting_price || 0));
                } else if (sortBy === 'price-desc') {
                  filteredRooms.sort((a, b) => Number(b.starting_price || 0) - Number(a.starting_price || 0));
                }
                  
                if (filteredRooms.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400">
                        <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-700">No rooms/lodges found</h3>
                        <p className="text-xs text-slate-400 mt-1">Try resetting filters or create a new lodge.</p>
                      </td>
                    </tr>
                  );
                }

                return filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                          <img
                            src={room.cover_image_url || '/images/stays-banner-2026.webp'}
                            alt={room.lodge_name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/stays-banner-2026.webp';
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{room.lodge_name}</h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-[11px] text-slate-400 max-w-[140px] truncate">{room.slug}</span>
                            {room.categories && room.categories.length > 0 ? (
                              room.categories.map((cat: any) => (
                                <span key={cat.id} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                                  <span>{cat.icon || '🛖'}</span>
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
                    <td className="px-6 py-4 font-semibold text-slate-700">{room.total_rooms} rooms</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{room.slot_start} - {room.slot_end}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-black text-indigo-700 ring-1 ring-inset ring-indigo-200" title="Total Active Bookings">
                          {room.active_booking_count || 0}
                        </span>
                        <button
                          onClick={() => handleToggleActive(room)}
                          disabled={togglingActiveId === room.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer disabled:opacity-70 disabled:cursor-wait ${
                            togglingActiveId === room.id
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : room.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {togglingActiveId === room.id ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Updating</>
                          ) : (
                            <>
                              <span className={`h-2 w-2 rounded-full ${room.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {room.is_active ? 'Accepting Bookings' : 'Closed / Inactive'}
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={togglingStatusId === room.id}
                        onClick={() => handleToggleStatus(room)}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 disabled:active:scale-100 ${
                          togglingStatusId === room.id ? 'bg-slate-100 text-slate-500 border-slate-200' : getStatusColor(room.status)
                        }`}
                      >
                        {togglingStatusId === room.id ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Updating</>
                        ) : room.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const updatedFeatured = !room.is_featured;
                               await updateRoom(room.id, {
                                 is_featured: updatedFeatured
                               });
                               await fetchRooms('', statusFilter, roomsPage, roomsLimit, true);
                               toast.success(`Lodge "${room.lodge_name}" is now ${updatedFeatured ? 'Featured' : 'Not Featured'}`);
                            } catch (err: any) {
                              toast.error(err.message || 'Failed to toggle featured status');
                            }
                          }}
                          className={`flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                            room.is_featured ? 'bg-amber-500' : 'bg-slate-350'
                          }`}
                        >
                          <div
                            className={`h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                              room.is_featured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${room.is_featured ? 'text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md' : 'text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md'}`}>
                          {room.is_featured ? 'Featured' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/rooms/${room.slug}`}
                          target="_blank"
                          prefetch={false}
                          title="View Public Page"
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(room)}
                          title="Duplicate"
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <Link 
                          href={`/admin/rooms/edit/${room.id}`}
                          prefetch={false}
                          title="Edit"
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete"
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
          currentPage={roomsPage}
          totalItems={roomsTotal}
          pageSize={roomsLimit}
          onPageChange={(page) => fetchRooms('', statusFilter, page, roomsLimit)}
          onPageSizeChange={(size) => fetchRooms('', statusFilter, 1, size)}
        />
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to delete this property lodge? This will remove all rooms associated with it."
        confirmText="Delete Lodge"
        cancelText="Cancel"
        type="danger"
      />

      {/* Active Booking Future Warnings Modal */}
      <AnimatePresence>
        {isToggleModalOpen && selectedRoomToToggle && (
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
                    You are trying to turn off bookings for <span className="font-bold text-slate-800">"{selectedRoomToToggle.lodge_name}"</span>. The following customers have active bookings scheduled:
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
                    Inactivating this lodge will block all new bookings immediately. However, you must honor the existing bookings above or manually cancel them in operations.
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
                  Yes, {selectedRoomToToggle?.intent === 'STATUS' ? `Change to ${selectedRoomToToggle.newStatus}` : 'Inactivate Anyway'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
