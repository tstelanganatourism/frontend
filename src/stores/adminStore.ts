import { create } from 'zustand';
import { apiClient } from '@/lib/api';

/**
 * Bust Next.js ISR cache for the given paths.
 * Fires silently — does not block or throw if it fails.
 */
async function revalidateStorefront(paths: string[]) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paths,
        secret: 'ts-tourism-revalidate-2024',
      }),
    });
  } catch {
    // Non-critical — storefront ISR will still revalidate within 60s
  }
}

interface AdminStats {
  packages: number;
  rooms: number;
  bookings: number;
  users: number;
  total_revenue: number;
}

interface SystemSettings {
  company_name: string;
  support_email: string;
  whatsapp_number: string;
  address: string;
  gst_number: string;
  global_tax_percentage: number;
  razorpay_key_id: string;
  booking_rules: string;
  cancellation_policies: string;
  social_links: Record<string, any>;
  default_meta_title: string;
  default_meta_description: string;
  extra_config: Record<string, any>;
}

interface AdminState {
  stats: AdminStats | null;
  settings: SystemSettings | null;
  packages: any[];
  rooms: any[];
  currentPackage: any | null;
  currentRoom: any | null;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<SystemSettings>) => Promise<void>;

  fetchPackages: (search?: string, status?: string) => Promise<void>;
  fetchPackageById: (id: number | string) => Promise<void>;
  createPackage: (data: any) => Promise<any>;
  updatePackage: (id: number | string, data: any) => Promise<any>;
  publishPackage: (id: number | string) => Promise<any>;
  deletePackage: (id: number | string) => Promise<void>;

  fetchRooms: (search?: string, status?: string) => Promise<void>;
  fetchRoomById: (id: number | string) => Promise<void>;
  createRoom: (data: any) => Promise<any>;
  updateRoom: (id: number | string, data: any) => Promise<any>;
  deleteRoom: (id: number | string) => Promise<void>;

  coupons: any[];
  currentCoupon: any | null;
  fetchCoupons: (search?: string) => Promise<void>;
  fetchCouponById: (id: number | string) => Promise<void>;
  createCoupon: (data: any) => Promise<any>;
  updateCoupon: (id: number | string, data: any) => Promise<any>;
  deleteCoupon: (id: number | string) => Promise<void>;

  agents: any[];
  currentAgent: any | null;
  fetchAgents: (search?: string, statusFilter?: string) => Promise<void>;
  fetchAgentById: (id: number | string) => Promise<void>;
  createAgent: (data: any) => Promise<any>;
  updateAgent: (id: number | string, data: any) => Promise<any>;
  deleteAgent: (id: number | string) => Promise<void>;
  toggleAgentStatus: (id: number | string) => Promise<any>;
  resetAgentPassword: (id: number | string, newPassword: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  settings: null,
  packages: [],
  rooms: [],
  coupons: [],
  agents: [],
  currentPackage: null,
  currentRoom: null,
  currentCoupon: null,
  currentAgent: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/admin/dashboard/stats');
      set({ stats: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch stats', isLoading: false });
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/admin/settings');
      set({ settings: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch settings', isLoading: false });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put('/api/v1/admin/settings', data);
      set({ settings: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to update settings', isLoading: false });
      throw err;
    }
  },

  fetchPackages: async (search, status) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status_filter = status;
      const response = await apiClient.get('/api/v1/admin/packages', { params });
      const items = Array.isArray(response.data)
        ? response.data
        : (response.data && Array.isArray(response.data.items) ? response.data.items : []);
      set({ packages: items, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch packages', isLoading: false });
    }
  },

  fetchPackageById: async (id) => {
    set({ isLoading: true, error: null, currentPackage: null });
    try {
      const response = await apiClient.get(`/api/v1/admin/packages/${id}`);
      set({ currentPackage: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch package', isLoading: false });
    }
  },

  createPackage: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/v1/admin/packages', data);
      set({ isLoading: false });
      // Bust storefront cache so listing pages reflect new package immediately
      revalidateStorefront(['/', '/boat-rides', '/sightseeing', '/packages']);
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to create package';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updatePackage: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/api/v1/admin/packages/${id}`, data);
      set({ currentPackage: response.data, isLoading: false });
      const slug = response.data?.slug;
      // Bust storefront cache for the specific package page + listing pages
      revalidateStorefront([
        '/',
        '/boat-rides',
        '/sightseeing',
        '/packages',
        ...(slug ? [`/packages/${slug}`] : []),
      ]);
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update package';
      set({ error: errMsg, isLoading: false });
      throw err; // throw raw error so we can handle validation failures in form
    }
  },

  publishPackage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/api/v1/admin/packages/${id}/publish`);
      set({ currentPackage: response.data, isLoading: false });
      const slug = response.data?.slug;
      // Publishing immediately surfaces the package on the storefront
      revalidateStorefront([
        '/',
        '/boat-rides',
        '/sightseeing',
        '/packages',
        ...(slug ? [`/packages/${slug}`] : []),
      ]);
      return response.data;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  deletePackage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/admin/packages/${id}`);
      set((state) => ({
        packages: state.packages.filter((p) => p.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete package', isLoading: false });
    }
  },

  fetchRooms: async (search, status) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status_filter = status;
      const response = await apiClient.get('/api/v1/admin/rooms', { params });
      const items = Array.isArray(response.data)
        ? response.data
        : (response.data && Array.isArray(response.data.items) ? response.data.items : []);
      set({ rooms: items, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch rooms', isLoading: false });
    }
  },

  fetchRoomById: async (id) => {
    set({ isLoading: true, error: null, currentRoom: null });
    try {
      const response = await apiClient.get(`/api/v1/admin/rooms/${id}`);
      set({ currentRoom: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch room', isLoading: false });
    }
  },

  createRoom: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/v1/admin/rooms', data);
      set({ isLoading: false });
      // Bust storefront cache for stays listing + homepage
      revalidateStorefront(['/', '/stays']);
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to create room';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updateRoom: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/api/v1/admin/rooms/${id}`, data);
      set({ currentRoom: response.data, isLoading: false });
      const slug = response.data?.slug;
      // Bust storefront cache for the specific stay page + listing pages
      revalidateStorefront([
        '/',
        '/stays',
        ...(slug ? [`/stays/${slug}`] : []),
      ]);
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update room';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/admin/rooms/${id}`);
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete room', isLoading: false });
    }
  },

  fetchCoupons: async (search) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await apiClient.get('/api/v1/admin/coupons', { params });
      set({ coupons: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch coupons', isLoading: false });
    }
  },

  fetchCouponById: async (id) => {
    set({ isLoading: true, error: null, currentCoupon: null });
    try {
      const response = await apiClient.get(`/api/v1/admin/coupons/${id}`);
      set({ currentCoupon: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch coupon', isLoading: false });
    }
  },

  createCoupon: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/v1/admin/coupons', data);
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to create coupon';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updateCoupon: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/api/v1/admin/coupons/${id}`, data);
      set({ currentCoupon: response.data, isLoading: false });
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update coupon';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deleteCoupon: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/admin/coupons/${id}`);
      set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete coupon', isLoading: false });
    }
  },

  // ─── Agents ───────────────────────────────────────────────────────────────

  fetchAgents: async (search, statusFilter) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;
      const response = await apiClient.get('/api/v1/admin/agents', { params });
      set({ agents: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch agents', isLoading: false });
    }
  },

  fetchAgentById: async (id) => {
    set({ isLoading: true, error: null, currentAgent: null });
    try {
      const response = await apiClient.get(`/api/v1/admin/agents/${id}`);
      set({ currentAgent: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch agent', isLoading: false });
    }
  },

  createAgent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/v1/admin/agents', data);
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to create agent';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  updateAgent: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/api/v1/admin/agents/${id}`, data);
      set({ currentAgent: response.data, isLoading: false });
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to update agent';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deleteAgent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/admin/agents/${id}`);
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete agent', isLoading: false });
    }
  },

  toggleAgentStatus: async (id) => {
    try {
      const response = await apiClient.post(`/api/v1/admin/agents/${id}/toggle-status`);
      set((state) => ({
        agents: state.agents.map((a) => a.id === id ? response.data : a),
      }));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to toggle agent status');
    }
  },

  resetAgentPassword: async (id, newPassword) => {
    try {
      await apiClient.post(`/api/v1/admin/agents/${id}/reset-password`, { new_password: newPassword });
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to reset password');
    }
  },
}));
