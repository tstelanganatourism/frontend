'use client';
/**
 * inventoryStore.ts — Phase 3.3
 *
 * Manages:
 *  - Admin inventory: per-date capacity, open/close, price override
 *  - Public availability: date → status map for package detail page
 */
import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export type InventoryStatus = 'OPEN' | 'CLOSED' | 'SOLD_OUT' | 'NO_INVENTORY';

export interface InventoryRow {
  id: number;
  variant_id: number;
  date: string; // ISO: "YYYY-MM-DD"
  total_capacity: number;
  booked_count: number;
  available_seats: number;
  is_closed: boolean;
  price_override: number | null;
}

export interface PublicDateAvailability {
  date: string;
  variant_id: number;
  variant_title: string;
  adult_price: number;
  child_price: number;
  effective_adult_price: number;
  available_seats: number;
  is_closed: boolean;
  price_override?: number | null;
  status: InventoryStatus;
}

export interface PublicAvailabilityResponse {
  package_id: number;
  slug: string;
  month: string;
  dates: PublicDateAvailability[];
}

export interface GenerateRequest {
  variant_id: number;
  from_date: string;
  to_date: string;
  total_capacity?: number;
}

export interface UpdateRequest {
  total_capacity?: number;
  is_closed?: boolean;
  price_override?: number | null;
}

interface InventoryState {
  // Admin state
  adminRows: InventoryRow[];
  isLoading: boolean;
  error: string | null;

  // Public state
  publicAvailability: PublicAvailabilityResponse | null;
  publicLoading: boolean;
  publicFetchKey: string | null; // dedup guard: "slug:month"

  // Admin actions
  fetchAdminInventory: (variantId: number, month: string) => Promise<void>;
  generateInventory: (body: GenerateRequest) => Promise<{ created: number; skipped: number; message: string }>;
  patchInventoryRow: (variantId: number, date: string, body: UpdateRequest) => Promise<void>;
  deleteInventoryRow: (variantId: number, date: string) => Promise<void>;

  // Public actions
  fetchPublicAvailability: (slug: string, month: string, force?: boolean) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  adminRows: [],
  isLoading: false,
  error: null,
  publicAvailability: null,
  publicLoading: false,
  publicFetchKey: null,

  fetchAdminInventory: async (variantId, month) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<InventoryRow[]>(
        `/api/v1/admin/inventory/packages/${variantId}/calendar`,
        { params: { month } }
      );
      set({ adminRows: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to load inventory', isLoading: false });
    }
  },

  generateInventory: async (body) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{ created: number; skipped: number; message: string }>(
        '/api/v1/admin/inventory/packages/generate',
        body
      );
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate inventory';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  patchInventoryRow: async (variantId, date, body) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.patch<InventoryRow>(
        `/api/v1/admin/inventory/packages/${variantId}/${date}`,
        body
      );
      // Update row in local state
      set((state) => ({
        adminRows: state.adminRows.map((r) =>
          r.variant_id === variantId && r.date === date ? res.data : r
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update inventory row';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  deleteInventoryRow: async (variantId, date) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/admin/inventory/packages/${variantId}/${date}`);
      set((state) => ({
        adminRows: state.adminRows.filter(
          (r) => !(r.variant_id === variantId && r.date === date)
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete inventory row';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  fetchPublicAvailability: async (slug, month, force = true) => {
    const key = `${slug}:${month}`;
    // Skip if a fetch is already in-flight
    if (get().publicLoading) return;

    if (force || get().publicFetchKey !== key || get().publicAvailability === null) {
      // Set loading state only if we have no cached data for this key to prevent screen flicker
      if (get().publicFetchKey !== key || !get().publicAvailability) {
        set({ publicLoading: true });
      }
      try {
        const res = await apiClient.get<PublicAvailabilityResponse>(
          `/api/v1/packages/${slug}/availability`,
          { params: { month, t: Date.now() } }
        );
        set({ publicAvailability: res.data, publicFetchKey: key, publicLoading: false });
      } catch {
        set({ publicAvailability: null, publicLoading: false });
      }
    }
  },
}));
