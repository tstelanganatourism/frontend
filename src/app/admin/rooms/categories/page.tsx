'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  X, 
  Home as RoomIcon, 
  Loader2, 
  FolderPlus,
  Layers,
  Search,
  CheckCircle2,
  BedDouble,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuthStore } from '@/stores/authStore';

type CategoryRoom = {
  id: number;
  lodge_name: string;
  slug: string;
  starting_price: number | null;
  cover_image_url: string | null;
};

type RoomCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  room_count: number;
  rooms: CategoryRoom[];
};

type AllRoomItem = {
  id: number;
  lodge_name: string;
  slug: string;
  cover_image_url: string | null;
};

export default function AdminRoomCategoriesPage() {
  const { isHydrated, accessToken } = useAuthStore();
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [allRooms, setAllRooms] = useState<AllRoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_image_url: '',
    is_active: true,
    sort_order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [deletingCatId, setDeletingCatId] = useState<number | null>(null);

  // Assign Rooms Drawer/Modal state
  const [assigningCat, setAssigningCat] = useState<RoomCategory | null>(null);
  const [searchRoomQuery, setSearchRoomQuery] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, roomRes] = await Promise.all([
        apiClient.get('/api/v1/admin/rooms/categories'),
        apiClient.get('/api/v1/admin/rooms?limit=100'),
      ]);
      setCategories(catRes.data || []);
      setAllRooms(roomRes.data?.items || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load room categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchData();
    }
  }, [isHydrated, accessToken]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      cover_image_url: '',
      is_active: true,
      sort_order: categories.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: RoomCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      cover_image_url: cat.cover_image_url || '',
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading image to Cloudinary...');
    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await apiClient.post('/api/v1/admin/packages/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url;
      setFormData(prev => ({ ...prev, cover_image_url: url }));
      toast.success('Image uploaded successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload image.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await apiClient.patch(`/api/v1/admin/rooms/categories/${editingCategory.id}`, formData);
        toast.success(`Room category "${formData.name}" updated`);
      } else {
        await apiClient.post('/api/v1/admin/rooms/categories', formData);
        toast.success(`Room category "${formData.name}" created`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save room category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCatId) return;
    try {
      await apiClient.delete(`/api/v1/admin/rooms/categories/${deletingCatId}`);
      toast.success('Room category deleted');
      setDeletingCatId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete room category');
    }
  };

  const handleRemoveRoom = async (catId: number, roomId: number) => {
    try {
      await apiClient.delete(`/api/v1/admin/rooms/categories/${catId}/rooms/${roomId}`);
      toast.success('Stay removed from category');
      fetchData();
      if (assigningCat && assigningCat.id === catId) {
        setAssigningCat(prev => prev ? {
          ...prev,
          rooms: prev.rooms.filter(r => r.id !== roomId),
          room_count: Math.max(0, prev.room_count - 1),
        } : null);
      }
    } catch (err: any) {
      toast.error('Failed to remove stay');
    }
  };

  const handleAssignRooms = async () => {
    if (!assigningCat || selectedRoomIds.length === 0) return;
    try {
      setIsAssigning(true);
      await apiClient.post(`/api/v1/admin/rooms/categories/${assigningCat.id}/rooms`, {
        room_ids: selectedRoomIds,
      });
      toast.success(`Added ${selectedRoomIds.length} stay(s) to "${assigningCat.name}"`);
      setSelectedRoomIds([]);
      fetchData();
      const updatedRes = await apiClient.get('/api/v1/admin/rooms/categories');
      setCategories(updatedRes.data || []);
      const updatedCat = updatedRes.data.find((c: RoomCategory) => c.id === assigningCat.id);
      if (updatedCat) setAssigningCat(updatedCat);
    } catch (err: any) {
      toast.error('Failed to assign stays');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/rooms"
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Room / Stay Categories</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Group rooms/stays into categories (e.g. Bamboo Huts, Forest Resorts). Stays can belong to 1 or more categories.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 text-emerald-400" />
          Create New Category
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BedDouble className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Room Categories Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Create categories to group stays e.g. "Kolluru Bamboo Huts", "Bhadrachalam Pilgrim Lodges" for easy browsing.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Room Category
          </button>
        </div>
      ) : (
        /* Categories Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Header */}
                <div className="relative h-40 bg-slate-100">
                  {cat.cover_image_url ? (
                    <Image
                      src={cat.cover_image_url}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-emerald-700 flex items-center justify-center text-white/30">
                      <BedDouble className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                    cat.is_active ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                  }`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Title & Count */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-lg text-white truncate">{cat.name}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <RoomIcon className="w-3.5 h-3.5 text-emerald-400" />
                      {cat.room_count} {cat.room_count === 1 ? 'Stay' : 'Stays'} Assigned
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4">
                  <p className="text-slate-600 text-xs line-clamp-2 min-h-[32px] mb-3">
                    {cat.description || 'No description provided.'}
                  </p>

                  {/* Assigned Rooms List Preview */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Assigned Stays ({cat.rooms.length}):
                    </span>
                    {cat.rooms.length === 0 ? (
                      <span className="text-xs text-slate-400 italic block py-1">No stays assigned yet</span>
                    ) : (
                      cat.rooms.slice(0, 4).map((r) => (
                        <div key={r.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                          <span className="font-semibold truncate max-w-[200px]">{r.lodge_name}</span>
                          <button
                            onClick={() => handleRemoveRoom(cat.id, r.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Remove stay from category"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                    {cat.rooms.length > 4 && (
                      <span className="text-[11px] text-emerald-600 font-semibold block pt-1">
                        + {cat.rooms.length - 4} more stays
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setAssigningCat(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Manage Stays
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Edit category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCatId(cat.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {editingCategory ? 'Edit Room Category' : 'Create Room Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bamboo Huts & Eco Stays"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of stays in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Cover Image Upload Option */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cover Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                
                {formData.cover_image_url ? (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group mb-2">
                    <Image
                      src={formData.cover_image_url}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold text-slate-800 hover:bg-white cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_image_url: '' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 mb-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-1" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    )}
                    <span className="text-xs font-bold text-slate-700 block">
                      {isUploading ? 'Uploading to Cloudinary...' : 'Click to Upload Cover Image File'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">JPG, PNG, WEBP allowed</span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Or paste direct image URL https://..."
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:outline-none text-center"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="room_cat_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="room_cat_is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Category is Active (Visible on site)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Rooms Drawer / Modal */}
      {assigningCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  Manage Stays in "{assigningCat.name}"
                </h3>
                <p className="text-xs text-slate-500">
                  A stay can belong to 1 or more categories. Check stays below to add them to this category.
                </p>
              </div>
              <button onClick={() => setAssigningCat(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Currently Assigned */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Currently Assigned Stays ({assigningCat.rooms.length})
                </h4>
                {assigningCat.rooms.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">No stays in this category yet.</p>
                ) : (
                  <div className="space-y-2">
                    {assigningCat.rooms.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                        <span className="font-semibold text-sm text-slate-800">{r.lodge_name}</span>
                        <button
                          onClick={() => handleRemoveRoom(assigningCat.id, r.id)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Stays */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Add Existing Stays
                </h4>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search available stays..."
                    value={searchRoomQuery}
                    onChange={(e) => setSearchRoomQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Available Rooms Checkbox List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {allRooms
                    .filter((r) => !assigningCat.rooms.some((ar) => ar.id === r.id))
                    .filter((r) => r.lodge_name.toLowerCase().includes(searchRoomQuery.toLowerCase()))
                    .map((room) => {
                      const isChecked = selectedRoomIds.includes(room.id);
                      return (
                        <label
                          key={room.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{room.lodge_name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoomIds([...selectedRoomIds, room.id]);
                              } else {
                                setSelectedRoomIds(selectedRoomIds.filter((id) => id !== room.id));
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                          />
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setAssigningCat(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleAssignRooms}
                disabled={selectedRoomIds.length === 0 || isAssigning}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Selected ({selectedRoomIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCatId)}
        onClose={() => setDeletingCatId(null)}
        onConfirm={handleDelete}
        title="Delete Room Category?"
        message="Are you sure you want to delete this category? Stays in this category will NOT be deleted, only unassigned from this category."
        confirmText="Delete Category"
      />
    </div>
  );
}
