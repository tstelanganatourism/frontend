'use client';

import { create } from 'zustand';

export type SortOption = 'priority' | 'price_low' | 'price_high';

interface FilterState {
  searchQuery: string;
  region: string | null;
  packageType: string | null;
  isFeatured: boolean | null;
  tags: string[];
  sort: SortOption;
  
  // For Rooms
  roomType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  
  setSearchQuery: (query: string) => void;
  setRegion: (region: string | null) => void;
  setPackageType: (type: string | null) => void;
  setIsFeatured: (isFeatured: boolean | null) => void;
  setTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setSort: (sort: SortOption) => void;
  setRoomType: (roomType: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  region: null,
  packageType: null,
  isFeatured: null,
  tags: [],
  sort: 'priority',
  roomType: null,
  minPrice: null,
  maxPrice: null,
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRegion: (region) => set({ region }),
  setPackageType: (type) => set({ packageType: type }),
  setIsFeatured: (isFeatured) => set({ isFeatured }),
  setTags: (tags) => set({ tags }),
  toggleTag: (tag) => set((state) => ({
    tags: state.tags.includes(tag) 
      ? state.tags.filter(t => t !== tag) 
      : [...state.tags, tag]
  })),
  setSort: (sort) => set({ sort }),
  setRoomType: (roomType) => set({ roomType }),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
  clearFilters: () => set({ 
    searchQuery: '', 
    region: null, 
    packageType: null, 
    isFeatured: null, 
    tags: [], 
    sort: 'priority',
    roomType: null,
    minPrice: null,
    maxPrice: null
  }),
}));
