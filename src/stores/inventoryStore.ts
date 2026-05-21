'use client';
/**
 * inventoryStore.ts — Phase 3.3 + Room Inventory
 *
 * Manages:
 *  - Admin inventory: per-date capacity, open/close, price override (Packages)
 *  - Admin inventory: per-date capacity, open/close (Rooms)
 *  - Public availability: date → status map for package detail page
 */
import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export type InventoryStatus = 'OPEN' | 'CLOSED' | 'SOLD_OUT' | 'NO_INVENTORY';

// ─── Package inventory types ──────────────────────────────────────────────────

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

// ─── Room inventory types ─────────────────────────────────────────────────────

export interface RoomInventoryRow {
  id: number;
  room_variant_id: number;
  date: string; // ISO: "YYYY-MM-DD"
  slot_start: string;
  slot_end: string;
  total_rooms: number;
  booked_rooms: number;
  available_rooms: number;
  is_closed: boolean;
}

export interface RoomGenerateRequest {
  room_variant_id: number;
  from_date: string;
  to_date: string;
  override_total_rooms?: number;
}

export interface RoomUpdateRequest {
  total_rooms?: number;
  is_closed?: boolean;
}

// ─── Public availability types ────────────────────────────────────────────────

export interface PublicDateAvailability {
  date: string;
  variant_id: number;
  variant_title: string;
  adult_price: number;
  child_price: number;
  effective_adult_price: number;
  effective_child_price: number;
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
  // Package admin state
  adminRows: InventoryRow[];
  isLoading: boolean;
  error: string | null;

  // Room admin state
  roomAdminRows: RoomInventoryRow[];
  roomIsLoading: boolean;
  roomError: string | null;

  // Public state
  publicAvailability: PublicAvailabilityResponse | null;
  publicLoading: boolean;
  publicFetchKey: string | null;

  // Package admin actions
  fetchAdminInventory: (variantId: number, month: string) => Promise<void>;
  generateInventory: (body: GenerateRequest) => Promise<{ created: number; skipped: number; message: string }>;
  patchInventoryRow: (variantId: number, date: string, body: UpdateRequest) => Promise<void>;
  deleteInventoryRow: (variantId: number, date: string) => Promise<void>;

  // Room admin actions
  fetchRoomAdminInventory: (roomVariantId: number, month: string) => Promise<void>;
  generateRoomInventory: (body: RoomGenerateRequest) => Promise<{ created: number; skipped: number; message: string }>;
  patchRoomInventoryRow: (roomVariantId: number, date: string, body: RoomUpdateRequest) => Promise<void>;
  deleteRoomInventoryRow: (roomVariantId: number, date: string) => Promise<void>;

  // Public actions
  fetchPublicAvailability: (slug: string, month: string, force?: boolean) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  adminRows: [],
  isLoading: false,
  error: null,

  roomAdminRows: [],
  roomIsLoading: false,
  roomError: null,

  publicAvailability: null,
  publicLoading: false,
  publicFetchKey: null,

  // ── Package actions ─────────────────────────────────────────────────────────

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

  // ── Room actions ────────────────────────────────────────────────────────────

  fetchRoomAdminInventory: async (roomVariantId, month) => {
    set({ roomIsLoading: true, roomError: null });
    try {
      const res = await apiClient.get<RoomInventoryRow[]>(
        `/api/v1/admin/inventory/rooms/${roomVariantId}/calendar`,
        { params: { month } }
      );
      set({ roomAdminRows: res.data, roomIsLoading: false });
    } catch (err: any) {
      set({ roomError: err.response?.data?.detail || 'Failed to load room inventory', roomIsLoading: false });
    }
  },

  generateRoomInventory: async (body) => {
    set({ roomIsLoading: true, roomError: null });
    try {
      const res = await apiClient.post<{ created: number; skipped: number; message: string }>(
        '/api/v1/admin/inventory/rooms/generate',
        body
      );
      set({ roomIsLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate room inventory';
      set({ roomError: msg, roomIsLoading: false });
      throw new Error(msg);
    }
  },

  patchRoomInventoryRow: async (roomVariantId, date, body) => {
    set({ roomIsLoading: true, roomError: null });
    try {
      const res = await apiClient.patch<RoomInventoryRow>(
        `/api/v1/admin/inventory/rooms/${roomVariantId}/${date}`,
        body
      );
      set((state) => ({
        roomAdminRows: state.roomAdminRows.map((r) =>
          r.room_variant_id === roomVariantId && r.date === date ? res.data : r
        ),
        roomIsLoading: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update room inventory row';
      set({ roomError: msg, roomIsLoading: false });
      throw new Error(msg);
    }
  },

  deleteRoomInventoryRow: async (roomVariantId, date) => {
    set({ roomIsLoading: true, roomError: null });
    try {
      await apiClient.delete(`/api/v1/admin/inventory/rooms/${roomVariantId}/${date}`);
      set((state) => ({
        roomAdminRows: state.roomAdminRows.filter(
          (r) => !(r.room_variant_id === roomVariantId && r.date === date)
        ),
        roomIsLoading: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete room inventory row';
      set({ roomError: msg, roomIsLoading: false });
      throw new Error(msg);
    }
  },

  // ── Public actions ──────────────────────────────────────────────────────────

  fetchPublicAvailability: async (slug, month, force = true) => {
    const key = `${slug}:${month}`;
    if (get().publicLoading) return;

    if (force || get().publicFetchKey !== key || get().publicAvailability === null) {
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
