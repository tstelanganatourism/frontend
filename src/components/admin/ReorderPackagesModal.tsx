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
  Ship,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface PackageItem {
  id: number;
  title: string;
  slug: string;
  order_priority: number;
  is_featured: boolean;
  cover_image_url?: string | null;
  starting_price?: number | string | null;
  type?: string;
  status?: string;
}

interface ReorderPackagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageItem[];
  onSave: (items: { id: number; order_priority: number }[]) => Promise<void>;
}

export default function ReorderPackagesModal({
  isOpen,
  onClose,
  packages,
  onSave,
}: ReorderPackagesModalProps) {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && packages) {
      // Sort packages by order_priority ascending initially
      const sorted = [...packages].sort(
        (a, b) => (a.order_priority ?? 9999) - (b.order_priority ?? 9999) || a.id - b.id
      );
      setItems(sorted);
      setHasChanges(false);
    }
  }, [isOpen, packages]);

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
    // Renumber sequentially 1..N based on current visible order
    const renumbered = items.map((item, idx) => ({
      ...item,
      order_priority: idx + 1,
    }));
    setItems(renumbered);
    setHasChanges(true);
    toast.info('Re-numbered packages sequentially (1, 2, 3...)');
  };

  const handleSortByCurrentPriority = () => {
    const sorted = [...items].sort(
      (a, b) => (a.order_priority ?? 9999) - (b.order_priority ?? 9999) || a.id - b.id
    );
    setItems(sorted);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = items.map((item, idx) => ({
        id: item.id,
        order_priority: Number(item.order_priority) || idx + 1,
      }));
      await onSave(payload);
      toast.success('Package display order saved successfully!');
      setHasChanges(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save package order');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute which packages appear on the Home Page (top 3 with is_featured === true)
  const featuredRankMap = new Map<number, number>();
  let featuredCount = 0;
  items.forEach((item) => {
    if (item.is_featured) {
      featuredCount++;
      featuredRankMap.set(item.id, featuredCount);
    }
  });

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 25, 45, 0.65)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-[#0f3d56] text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2.5">
              <ListOrdered className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">
                Package Display Order &amp; Sequence
              </h2>
              <p className="text-xs text-cyan-200/80 font-medium mt-0.5">
                Controls package order across Category pages, Catalog, and Home Page
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Home Page Info Alert */}
        <div className="px-6 py-3 bg-amber-50/90 border-b border-amber-200/60 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-black">Home Page Display Rules:</span> The top 3 packages with{' '}
            <span className="font-bold underline decoration-amber-500">Featured</span> turned ON appear in the{' '}
            <strong>Featured Packages (Top 3)</strong> hero section on the Home Page. Lower priority number = shown first!
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Total {items.length} Packages
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
              ★ {featuredCount} Featured on Home
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoNumber}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
              title="Re-assign sequential numbers 1, 2, 3... from top to bottom"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              Auto-Number (1..N)
            </button>
            <button
              type="button"
              onClick={handleSortByCurrentPriority}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
              title="Sort list by the numbers entered in the inputs"
            >
              Sort by Number
            </button>
          </div>
        </div>

        {/* List of packages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 divide-y-0">
          {items.map((pkg, idx) => {
            const homeRank = featuredRankMap.get(pkg.id);
            const isTop3Home = homeRank && homeRank <= 3;

            return (
              <div
                key={pkg.id}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  isTop3Home
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Up / Down buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0 || isSaving}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1 || isSaving}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Priority input box */}
                <div className="shrink-0 flex flex-col items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                    Order #
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={pkg.order_priority ?? idx + 1}
                    onChange={(e) => handlePriorityChange(idx, parseInt(e.target.value) || 0)}
                    className="w-14 text-center rounded-lg border border-slate-300 bg-slate-50 py-1 text-sm font-black text-[#0f3d56] focus:border-[#1598a1] focus:bg-white outline-none"
                  />
                </div>

                {/* Thumbnail */}
                <div className="h-11 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={
                      pkg.cover_image_url ||
                      'https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png'
                    }
                    alt={pkg.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-extrabold text-slate-900 text-sm truncate">
                      {pkg.title}
                    </p>
                    {isTop3Home && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 text-[10px] font-black tracking-wide shadow-xs shrink-0">
                        ★ Home #{homeRank}
                      </span>
                    )}
                    {homeRank && homeRank > 3 && (
                      <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[9px] font-black shrink-0">
                        Featured (#{homeRank})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                    <span className="capitalize">{pkg.type === 'TRIP' ? 'Sightseeing' : 'Boat Ride'}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">/{pkg.slug}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            {hasChanges ? (
              <span className="font-bold text-amber-600">● Unsaved order changes</span>
            ) : (
              <span>Order is up to date</span>
            )}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1598a1] to-[#0d6e75] px-6 py-2.5 text-sm font-black text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving Order...' : 'Save Display Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
