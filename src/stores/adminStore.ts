'use client';

import { create } from 'zustand';
import { apiClient } from '@/lib/api';

/**
 * Bust Next.js ISR cache for the given paths.
 * Fires silently — does not block or throw if it fails.
 */
async function revalidateStorefront(paths: string[], tags?: string[]) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paths,
        tags,
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
  recent_bookings?: any[];
  analysis?: any;
}

interface SystemSettings {
  company_name: string;
  support_email: string;
  whatsapp_number: string;
  address: string;
  gst_number: string;
  global_tax_percentage: number;
  cashfree_app_id: string;
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
  packagesTotal: number;
  packagesPage: number;
  packagesLimit: number;

  rooms: any[];
  roomsTotal: number;
  roomsPage: number;
  roomsLimit: number;

  currentPackage: any | null;
  currentRoom: any | null;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<SystemSettings>) => Promise<void>;

  fetchPackages: (search?: string, status?: string, page?: number, limit?: number, silent?: boolean) => Promise<void>;
  fetchPackageById: (id: number | string) => Promise<void>;
  createPackage: (data: any) => Promise<any>;
  updatePackage: (id: number | string, data: any) => Promise<any>;
  publishPackage: (id: number | string) => Promise<any>;
  deletePackage: (id: number | string) => Promise<void>;

  fetchRooms: (search?: string, status?: string, page?: number, limit?: number, silent?: boolean) => Promise<void>;
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
  agentsTotal: number;
  agentsPage: number;
  agentsLimit: number;
  currentAgent: any | null;
  fetchAgents: (search?: string, statusFilter?: string, page?: number, limit?: number) => Promise<void>;
  fetchAgentById: (id: number | string) => Promise<void>;
  createAgent: (data: any) => Promise<any>;
  updateAgent: (id: number | string, data: any) => Promise<any>;
  deleteAgent: (id: number | string) => Promise<void>;
  toggleAgentStatus: (id: number | string) => Promise<any>;
  resetAgentPassword: (id: number | string, newPassword: string) => Promise<void>;

  users: any[];
  usersTotal: number;
  usersPage: number;
  usersLimit: number;
  currentUser: any | null;
  fetchUsers: (search?: string, statusFilter?: string, page?: number, limit?: number) => Promise<void>;
  fetchUserById: (id: number | string) => Promise<void>;
  deleteUser: (id: number | string) => Promise<void>;
  toggleUserStatus: (id: number | string) => Promise<any>;
  resetUserPassword: (id: number | string, newPassword: string) => Promise<void>;
  updateUser: (id: number | string, data: { full_name?: string; email?: string; phone_number?: string }) => Promise<any>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  settings: null,
  packages: [],
  packagesTotal: 0,
  packagesPage: 1,
  packagesLimit: 20,
  rooms: [],
  roomsTotal: 0,
  roomsPage: 1,
  roomsLimit: 20,
  coupons: [],
  agents: [],
  agentsTotal: 0,
  agentsPage: 1,
  agentsLimit: 20,
  currentPackage: null,
  currentRoom: null,
  currentCoupon: null,
  currentAgent: null,
  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersLimit: 20,
  currentUser: null,
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
      revalidateStorefront(['/', '/about', '/contact', '/boat-rides', '/sightseeing', '/stays', '/packages'], ['settings']);
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to update settings', isLoading: false });
      throw err;
    }
  },

  fetchPackages: async (search, status, page = 1, limit = 10, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status_filter = status;
      params.limit = safeLimit;
      params.offset = (safePage - 1) * safeLimit;
      const response = await apiClient.get('/api/v1/admin/packages', { params });
      const items = response.data && Array.isArray(response.data.items) ? response.data.items : [];
      const total = response.data && typeof response.data.total === 'number' ? response.data.total : items.length;
      set({ 
        packages: items, 
        packagesTotal: total,
        packagesPage: safePage,
        packagesLimit: safeLimit,
        isLoading: false 
      });
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
      revalidateStorefront(['/', '/boat-rides', '/sightseeing', '/packages'], ['packages']);
      return response.data;
    } catch (err: any) {
      let errMsg = 'Failed to create package';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((e: any) => `${e.loc?.slice(-1)?.[0] || 'Field'}: ${e.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      } else if (err.response?.data?.error?.message) {
        errMsg = err.response.data.error.message;
      }
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  updatePackage: async (id, data) => {
    // Optimistic update: patch the local list immediately so UI feels instant
    set((state) => ({
      packages: state.packages.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
      error: null,
    }));
    try {
      const response = await apiClient.put(`/api/v1/admin/packages/${id}`, data);
      // Reconcile with server truth
      set((state) => ({
        currentPackage: response.data,
        packages: state.packages.map((p) =>
          p.id === id ? { ...p, ...response.data } : p
        ),
      }));
      const slug = response.data?.slug;
      // Bust storefront cache for the specific package page + listing pages
      revalidateStorefront([
        '/',
        '/boat-rides',
        '/sightseeing',
        '/packages',
        ...(slug ? [`/packages/${slug}`] : []),
      ], [
        'packages',
        ...(slug ? [`package:${slug}`] : []),
      ]);
      return response.data;
    } catch (err: any) {
      let errMsg = 'Failed to update package';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((e: any) => `${e.loc?.slice(-1)?.[0] || 'Field'}: ${e.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      } else if (err.response?.data?.error?.message) {
        errMsg = err.response.data.error.message;
      }
      set({ error: errMsg });
      throw err;
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
      ], [
        'packages',
        ...(slug ? [`package:${slug}`] : []),
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
      revalidateStorefront(['/', '/boat-rides', '/sightseeing', '/packages'], ['packages']);
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete package', isLoading: false });
    }
  },

  fetchRooms: async (search, status, page = 1, limit = 10, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status_filter = status;
      params.limit = safeLimit;
      params.offset = (safePage - 1) * safeLimit;
      const response = await apiClient.get('/api/v1/admin/rooms', { params });
      const items = response.data && Array.isArray(response.data.items) ? response.data.items : [];
      const total = response.data && typeof response.data.total === 'number' ? response.data.total : items.length;
      set({ 
        rooms: items, 
        roomsTotal: total,
        roomsPage: safePage,
        roomsLimit: safeLimit,
        isLoading: false 
      });
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
      revalidateStorefront(['/', '/stays'], ['stays']);
      return response.data;
    } catch (err: any) {
      let errMsg = 'Failed to create room';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((e: any) => `${e.loc?.slice(-1)?.[0] || 'Field'}: ${e.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      } else if (err.response?.data?.error?.message) {
        errMsg = err.response.data.error.message;
      }
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  updateRoom: async (id, data) => {
    // Optimistic update: patch the local list immediately so UI feels instant
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
      error: null,
    }));
    try {
      const response = await apiClient.put(`/api/v1/admin/rooms/${id}`, data);
      // Reconcile with server truth
      set((state) => ({
        currentRoom: response.data,
        rooms: state.rooms.map((r) =>
          r.id === id ? { ...r, ...response.data } : r
        ),
      }));
      const slug = response.data?.slug;
      // Bust storefront cache for the specific stay page + listing pages
      revalidateStorefront([
        '/',
        '/stays',
        ...(slug ? [`/stays/${slug}`] : []),
      ], [
        'stays',
        ...(slug ? [`stay:${slug}`] : []),
      ]);
      return response.data;
    } catch (err: any) {
      let errMsg = 'Failed to update room';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((e: any) => `${e.loc?.slice(-1)?.[0] || 'Field'}: ${e.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      } else if (err.response?.data?.error?.message) {
        errMsg = err.response.data.error.message;
      }
      set({ error: errMsg });
      throw err;
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
      revalidateStorefront(['/', '/stays'], ['stays']);
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

  fetchAgents: async (search, statusFilter, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;
      params.limit = safeLimit;
      params.offset = (safePage - 1) * safeLimit;
      const response = await apiClient.get('/api/v1/admin/agents', { params });
      const items = response.data && Array.isArray(response.data.items) ? response.data.items : [];
      const total = response.data && typeof response.data.total === 'number' ? response.data.total : items.length;
      set({ 
        agents: items, 
        agentsTotal: total,
        agentsPage: safePage,
        agentsLimit: safeLimit,
        isLoading: false 
      });
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

  fetchUsers: async (search, statusFilter, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;
      params.limit = safeLimit;
      params.offset = (safePage - 1) * safeLimit;
      const response = await apiClient.get('/api/v1/admin/users', { params });
      const items = response.data && Array.isArray(response.data.items) ? response.data.items : [];
      const total = response.data && typeof response.data.total === 'number' ? response.data.total : items.length;
      set({ 
        users: items, 
        usersTotal: total,
        usersPage: safePage,
        usersLimit: safeLimit,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch users', isLoading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null, currentUser: null });
    try {
      const response = await apiClient.get(`/api/v1/admin/users/${id}`);
      set({ currentUser: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch user details', isLoading: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/admin/users/${id}`);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete user', isLoading: false });
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await apiClient.post(`/api/v1/admin/users/${id}/toggle-status`);
      set((state) => ({
        users: state.users.map((u) => u.id === id ? response.data : u),
      }));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to toggle user status');
    }
  },

  resetUserPassword: async (id, newPassword) => {
    try {
      await apiClient.patch(`/api/v1/admin/users/${id}/password`, { new_password: newPassword });
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to reset password');
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/v1/admin/users/${id}`, data);
      set((state) => ({
        users: state.users.map((u) => u.id === id ? response.data : u),
        currentUser: state.currentUser && state.currentUser.id === id ? { ...state.currentUser, ...response.data } : state.currentUser
      }));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update user profile');
    }
  },
}));
