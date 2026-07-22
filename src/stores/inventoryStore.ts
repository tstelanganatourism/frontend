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
  hotel_name?: string | null;
  hotel_address?: string | null;
  hotel_map_url?: string | null;
}

export interface RoomGenerateRequest {
  room_variant_id: number;
  from_date: string;
  to_date: string;
  override_total_rooms?: number;
  slot_capacities?: Array<{
    slot_start: string;
    slot_end: string;
    total_rooms: number;
    hotel_name?: string | null;
    hotel_address?: string | null;
    hotel_map_url?: string | null;
  }>;
  hotel_name?: string | null;
  hotel_address?: string | null;
  hotel_map_url?: string | null;
}

export interface RoomUpdateRequest {
  total_rooms?: number;
  is_closed?: boolean;
  hotel_name?: string | null;
  hotel_address?: string | null;
  hotel_map_url?: string | null;
}

// ─── Transport inventory types ────────────────────────────────────────────────

export interface TransportInventoryRow {
  id: number;
  transport_option_id: number;
  transport_option_title: string;
  transport_option_type: 'SHARED' | 'SEPARATE_VEHICLE';
  transport_option_capacity: number;
  date: string; // ISO: "YYYY-MM-DD"
  available_count: number;
  booked_count: number;
  remaining: number;
  is_closed: boolean;
  price_override: number | null;
}

export interface TransportInventoryGenerateRequest {
  package_id: number;
  from_date: string;
  to_date: string;
  option_counts?: Record<string, number>;
}

export interface TransportInventoryUpdateRequest {
  available_count?: number;
  capacity?: number;
  is_closed?: boolean;
  price_override?: number | null;
}

export interface TransportOptionInfo {
  id: number;
  title: string;
  type: string;
  capacity: number;
}

export interface TransportInventoryCalendarResponse {
  options: TransportOptionInfo[];
  dates: Record<string, TransportInventoryRow[]>;
}

// ─── Public availability types ────────────────────────────────────────────────

export interface PublicTransportDateAvailability {
  option_id: number;
  remaining: number;
  is_closed: boolean;
  price_override?: number | null;
}

export interface PublicDateAvailability {
  date: string;
  variant_id: number;
  variant_title: string;
  adult_price: number;
  child_price: number;
  effective_adult_price: number;
  effective_child_price: number;
  student_price?: number;
  effective_student_price?: number;
  available_seats: number;
  is_closed: boolean;
  price_override?: number | null;
  status: InventoryStatus;
  transport_availability?: PublicTransportDateAvailability[] | null;
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

  // Transport admin state
  transportOptions: TransportOptionInfo[];
  transportAdminRows: Record<string, TransportInventoryRow[]>;
  transportIsLoading: boolean;
  transportError: string | null;

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
  patchRoomInventoryRow: (rowId: number, body: RoomUpdateRequest) => Promise<void>;
  deleteRoomInventoryRow: (rowId: number) => Promise<void>;

  // Transport admin actions
  fetchTransportAdminInventory: (packageId: number, month: string) => Promise<void>;
  generateTransportInventory: (req: TransportInventoryGenerateRequest) => Promise<any>;
  patchTransportInventoryRow: (id: number, updates: Partial<TransportInventoryUpdateRequest>) => Promise<any>;
  deleteTransportInventoryRow: (id: number) => Promise<any>;
  createTransportInventoryRow: (transportOptionId: number, slotDate: string, availableCount: number) => Promise<void>;

  // Bulk Actions
  bulkActionInventory: (req: any) => Promise<any>;
  bulkActionRoomInventory: (req: any) => Promise<any>;
  bulkActionTransportInventory: (req: any) => Promise<any>;

  // Public actions
  fetchPublicAvailability: (slug: string, month: string, force?: boolean) => Promise<void>;
  applySSEPayload: (payload: any) => void;
  applyTransportSSEPayload: (payload: any) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  adminRows: [],
  isLoading: false,
  error: null,

  roomAdminRows: [],
  roomIsLoading: false,
  roomError: null,

  transportOptions: [],
  transportAdminRows: {},
  transportIsLoading: false,
  transportError: null,

  publicAvailability: null,
  publicLoading: false,
  publicFetchKey: null,

  // ── Package actions ─────────────────────────────────────────────────────────

  fetchAdminInventory: async (variantId, month) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<InventoryRow[]>(
        `/api/v1/admin/inventory/packages/${variantId}/calendar`,
        { params: { month, t: Date.now() } }
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
    const previousRows = get().adminRows;
    set((state) => ({
      adminRows: state.adminRows.map((r) =>
        r.variant_id === variantId && r.date === date ? { ...r, ...body } : r
      ),
      error: null
    }));
    try {
      const res = await apiClient.patch<InventoryRow>(
        `/api/v1/admin/inventory/packages/${variantId}/${date}`,
        body
      );
      set((state) => ({
        adminRows: state.adminRows.map((r) =>
          r.variant_id === variantId && r.date === date ? res.data : r
        )
      }));
    } catch (err: any) {
      set({ adminRows: previousRows });
      const msg = err.response?.data?.detail || 'Failed to update inventory row';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  deleteInventoryRow: async (variantId, date) => {
    const previousRows = get().adminRows;
    set((state) => ({
      adminRows: state.adminRows.filter(
        (r) => !(r.variant_id === variantId && r.date === date)
      ),
      error: null
    }));
    try {
      await apiClient.delete(`/api/v1/admin/inventory/packages/${variantId}/${date}`);
    } catch (err: any) {
      set({ adminRows: previousRows });
      const msg = err.response?.data?.detail || 'Failed to delete inventory row';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  // ── Room actions ────────────────────────────────────────────────────────────

  fetchRoomAdminInventory: async (roomVariantId, month) => {
    set({ roomIsLoading: true, roomError: null });
    try {
      const res = await apiClient.get<RoomInventoryRow[]>(
        `/api/v1/admin/inventory/rooms/${roomVariantId}/calendar`,
        { params: { month, t: Date.now() } }
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

  patchRoomInventoryRow: async (rowId, body) => {
    const previousRows = get().roomAdminRows;
    set((state) => ({
      roomAdminRows: state.roomAdminRows.map((r) =>
        r.id === rowId ? { ...r, ...body } : r
      ),
      roomError: null
    }));
    try {
      const res = await apiClient.patch<RoomInventoryRow>(
        `/api/v1/admin/inventory/rooms/slots/${rowId}`,
        body
      );
      set((state) => ({
        roomAdminRows: state.roomAdminRows.map((r) =>
          r.id === rowId ? res.data : r
        )
      }));
    } catch (err: any) {
      set({ roomAdminRows: previousRows });
      const msg = err.response?.data?.detail || 'Failed to update room inventory row';
      set({ roomError: msg });
      throw new Error(msg);
    }
  },

  deleteRoomInventoryRow: async (rowId) => {
    const previousRows = get().roomAdminRows;
    set((state) => ({
      roomAdminRows: state.roomAdminRows.filter(
        (r) => r.id !== rowId
      ),
      roomError: null
    }));
    try {
      await apiClient.delete(`/api/v1/admin/inventory/rooms/slots/${rowId}`);
    } catch (err: any) {
      set({ roomAdminRows: previousRows });
      const msg = err.response?.data?.detail || 'Failed to delete room inventory row';
      set({ roomError: msg });
      throw new Error(msg);
    }
  },

  // ── Transport actions ───────────────────────────────────────────────────────

  fetchTransportAdminInventory: async (packageId, month) => {
    set({ transportIsLoading: true, transportError: null });
    try {
      const res = await apiClient.get<TransportInventoryCalendarResponse>(
        `/api/v1/admin/inventory/transport/${packageId}/calendar`,
        { params: { month, t: Date.now() } }
      );
      set({
        transportOptions: res.data.options || [],
        transportAdminRows: res.data.dates || {},
        transportIsLoading: false
      });
    } catch (err: any) {
      set({
        transportError: err.response?.data?.detail || 'Failed to load transport inventory',
        transportIsLoading: false
      });
    }
  },

  generateTransportInventory: async (body) => {
    set({ transportIsLoading: true, transportError: null });
    try {
      const res = await apiClient.post<{ created: number; skipped: number; message: string }>(
        '/api/v1/admin/inventory/transport/generate',
        body
      );
      set({ transportIsLoading: false });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate transport inventory';
      set({ transportError: msg, transportIsLoading: false });
      throw new Error(msg);
    }
  },

  patchTransportInventoryRow: async (rowId, body) => {
    const previousRows = { ...get().transportAdminRows };
    
    // Optimistic update
    const updated = { ...get().transportAdminRows };
    Object.keys(updated).forEach(date => {
      updated[date] = updated[date].map(r => r.id === rowId ? { ...r, ...body } as TransportInventoryRow : r);
    });
    set({ transportAdminRows: updated, transportError: null });

    try {
      const res = await apiClient.patch<TransportInventoryRow>(
        `/api/v1/admin/inventory/transport/slots/${rowId}`,
        body
      );
      // Replace with actual database result
      const fresh = { ...get().transportAdminRows };
      Object.keys(fresh).forEach(date => {
        fresh[date] = fresh[date].map(r => r.id === rowId ? res.data : r);
      });
      set({ transportAdminRows: fresh });
    } catch (err: any) {
      set({ transportAdminRows: previousRows });
      const msg = err.response?.data?.detail || 'Failed to update transport inventory row';
      set({ transportError: msg });
      throw new Error(msg);
    }
  },

  deleteTransportInventoryRow: async (rowId) => {
    const previousRows = { ...get().transportAdminRows };

    // Optimistic delete
    const updated = { ...get().transportAdminRows };
    Object.keys(updated).forEach(date => {
      updated[date] = updated[date].filter(r => r.id !== rowId);
    });
    set({ transportAdminRows: updated, transportError: null });

    try {
      await apiClient.delete(`/api/v1/admin/inventory/slots/${rowId}`);
    } catch (err: any) {
      set({ transportAdminRows: previousRows });
      const msg = err.response?.data?.detail || 'Failed to delete transport inventory row';
      set({ transportError: msg });
      throw new Error(msg);
    }
  },

  createTransportInventoryRow: async (transportOptionId, slotDate, availableCount) => {
    set({ transportIsLoading: true, transportError: null });
    try {
      const res = await apiClient.post<TransportInventoryRow>(
        '/api/v1/admin/inventory/transport/slots',
        null,
        {
          params: {
            transport_option_id: transportOptionId,
            slot_date: slotDate,
            available_count: availableCount
          }
        }
      );
      
      const updated = { ...get().transportAdminRows };
      const dStr = slotDate;
      if (!updated[dStr]) {
        updated[dStr] = [];
      }
      updated[dStr] = [...updated[dStr], res.data].sort((a, b) => a.transport_option_id - b.transport_option_id);
      
      set({ transportAdminRows: updated, transportIsLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create transport inventory slot';
      set({ transportError: msg, transportIsLoading: false });
      throw new Error(msg);
    }
  },

  // ─── Bulk Actions ────────────────────────────────────────────────────────────

  bulkActionInventory: async (req: any) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/api/v1/admin/inventory/packages/bulk', req);
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to apply bulk action' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  bulkActionRoomInventory: async (req: any) => {
    set({ roomIsLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/api/v1/admin/inventory/rooms/bulk', req);
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to apply bulk action' });
      throw error;
    } finally {
      set({ roomIsLoading: false });
    }
  },

  bulkActionTransportInventory: async (req: any) => {
    set({ transportIsLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/api/v1/admin/inventory/transport/bulk', req);
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to apply bulk action' });
      throw error;
    } finally {
      set({ transportIsLoading: false });
    }
  },

  // ─── Public SSE Actions ──────────────────────────────────────────────────────

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

  applySSEPayload: (payload: any) => {
    // Only apply if we have loaded publicAvailability and it matches the package
    const current = get().publicAvailability;
    if (!current || current.package_id !== payload.package_id) return;
    
    // Update the specific date
    const updatedDates = current.dates.map(d => {
      if (d.date === payload.travel_date && d.variant_id === payload.variant_id) {
        return {
          ...d,
          available_seats: payload.available,
          is_closed: payload.is_closed,
          effective_adult_price: payload.effective_adult_price,
          effective_child_price: payload.effective_child_price,
          effective_student_price: payload.effective_student_price,
          status: payload.is_closed ? 'CLOSED' : (payload.available <= 0 ? 'SOLD_OUT' : 'OPEN')
        } as PublicDateAvailability;
      }
      return d;
    });

    set({ publicAvailability: { ...current, dates: updatedDates } });
  },

  applyTransportSSEPayload: (payload: any) => {
    const current = get().publicAvailability;
    if (!current || current.package_id !== payload.package_id) return;

    const updatedDates = current.dates.map(d => {
      if (d.date === payload.travel_date) {
        const transAvailability = d.transport_availability || [];
        const optExists = transAvailability.some(t => t.option_id === payload.option_id);
        
        let newTransAvailability;
        if (optExists) {
          newTransAvailability = transAvailability.map(t => {
            if (t.option_id === payload.option_id) {
              return {
                ...t,
                remaining: payload.remaining,
                is_closed: payload.is_closed,
                price_override: payload.price_override
              };
            }
            return t;
          });
        } else {
          newTransAvailability = [
            ...transAvailability,
            {
              option_id: payload.option_id,
              remaining: payload.remaining,
              is_closed: payload.is_closed,
              price_override: payload.price_override
            }
          ];
        }
        
        return {
          ...d,
          transport_availability: newTransAvailability
        };
      }
      return d;
    });

    set({ publicAvailability: { ...current, dates: updatedDates } });
  },
}));
