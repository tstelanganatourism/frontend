'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  Check,
  RotateCcw,
  ListOrdered,
  Bed,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface RoomItem {
  id: number;
  lodge_name: string;
  slug: string;
  order_priority: number;
  is_featured: boolean;
  cover_image_url?: string | null;
  starting_price?: number | string | null;
  address?: string | null;
  status?: string;
}

interface ReorderRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomItem[];
  onSave: (items: { id: number; order_priority: number }[]) => Promise<void>;
}

export default function ReorderRoomsModal({
  isOpen,
  onClose,
  rooms,
  onSave,
}: ReorderRoomsModalProps) {
  const [items, setItems] = useState<RoomItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && rooms) {
      // Sort rooms by order_priority ascending initially
      const sorted = [...rooms].sort(
        (a, b) => (a.order_priority ?? 9999) - (b.order_priority ?? 9999) || a.id - b.id
      );
      setItems(sorted);
      setHasChanges(false);
    }
  }, [isOpen, rooms]);

  if (!isOpen) return null;

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Reassign sequential order_priority numbers
    const renumbered = newItems.map((item, idx) => ({
      ...item,
      order_priority: idx + 1,
    }));

    setItems(renumbered);
    setHasChanges(true);
  };

  const handlePriorityChange = (index: number, newPriority: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], order_priority: newPriority };
    setItems(newItems);
    setHasChanges(true);
  };

  const handleAutoNumber = () => {
    const renumbered = items.map((item, idx) => ({
      ...item,
      order_priority: idx + 1,
    }));
    setItems(renumbered);
    setHasChanges(true);
    toast.info('Re-numbered lodges/rooms sequentially (1, 2, 3...)');
  };

  const handleSortByCurrentPriority = () => {
    const sorted = [...items].sort(
      (a, b) => (a.order_priority ?? 9999) - (b.order_priority ?? 9999) || a.id - b.id
    );
    setItems(sorted);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = items.map((item, idx) => ({
        id: item.id,
        order_priority: Number(item.order_priority) || idx + 1,
      }));
      await onSave(payload);
      toast.success('Room display sequence saved successfully!');
      setHasChanges(false);
      onClose();
    } catch (err: any) {
      toast.error('Failed to save room order');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute live Home Page featured ranking for rooms
  const featuredRankMap = new Map<number, number>();
  const featuredSorted = [...items]
    .filter((r) => r.is_featured)
    .sort((a, b) => (a.order_priority ?? 9999) - (b.order_priority ?? 9999) || a.id - b.id);
  featuredSorted.forEach((r, idx) => {
    featuredRankMap.set(r.id, idx + 1);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-8 py-5 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1598a1] text-white shadow-md shadow-[#1598a1]/20">
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Reorder Hotels & Bamboo Stays
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Set exact order everywhere: Storefront Stays, Category pages & Home Page Hero
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Home Page Featured Info Box */}
        <div className="bg-amber-50/70 border-b border-amber-100/80 px-5 sm:px-8 py-3 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 text-amber-900">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Top 3 Featured Stays</strong> appear in the "Hotels & Bamboo Stays" section on the Home Page. Lower priority number = shown first!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoNumber}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100/50 cursor-pointer shadow-xs transition-all"
              title="Re-assign order numbers 1, 2, 3... sequentially based on visible order"
            >
              <ListOrdered className="h-3.5 w-3.5 text-amber-700" />
              Auto-Number (1..N)
            </button>
            <button
              type="button"
              onClick={handleSortByCurrentPriority}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100/50 cursor-pointer shadow-xs transition-all"
              title="Sort list rows ascending by current Order # values"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
              Apply Order Sort
            </button>
          </div>
        </div>

        {/* Scrollable Room List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No lodges or stays to display.
            </div>
          ) : (
            items.map((room, idx) => {
              const homeRank = featuredRankMap.get(room.id);
              const isTop3Home = room.is_featured && homeRank !== undefined && homeRank <= 3;

              return (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 sm:gap-4 py-3.5 px-3 rounded-2xl transition-all ${
                    isTop3Home
                      ? 'bg-amber-50/40 border border-amber-200/60 shadow-xs my-1'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Up/Down buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, 'up')}
                      title="Move Up"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, 'down')}
                      title="Move Down"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Priority Number Input */}
                  <div className="flex flex-col items-center w-14 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={room.order_priority ?? idx + 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        handlePriorityChange(idx, isNaN(val) ? 0 : val);
                      }}
                      className="w-14 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-black text-slate-900 focus:border-[#1598a1] focus:ring-2 focus:ring-[#1598a1]/20 outline-none shadow-xs"
                      title="Click and type sequence number"
                    />
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                      Seq #{idx + 1}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="h-12 w-16 sm:h-14 sm:w-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={room.cover_image_url || 'https://res.cloudinary.com/r929tquv/image/upload/v1785917189/ts_boat_tourism/images/kk1enmetydnvtwall1aw.webp'}
                      alt={room.lodge_name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://res.cloudinary.com/r929tquv/image/upload/v1785917189/ts_boat_tourism/images/kk1enmetydnvtwall1aw.webp';
                      }}
                    />
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {room.lodge_name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {room.address || room.slug}
                    </p>
                  </div>

                  {/* Home Page Rank Status Badge */}
                  <div className="shrink-0 flex items-center">
                    {isTop3Home ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 fill-current" />
                        ★ Home Stay #{homeRank}
                      </span>
                    ) : room.is_featured ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                        Featured (Home #{homeRank})
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Not Featured
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 sm:px-8 py-4 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-medium">
            {hasChanges ? (
              <span className="text-amber-700 font-bold">● Unsaved sequence changes</span>
            ) : (
              'All order changes saved'
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f3d56] hover:bg-[#1598a1] text-white text-xs font-black tracking-wide shadow-md shadow-[#0f3d56]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Stay Sequence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
