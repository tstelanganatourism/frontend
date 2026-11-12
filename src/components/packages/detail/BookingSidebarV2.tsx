'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { CalendarDays, AlertTriangle, XCircle, CheckCircle2, Loader2, Info, ChevronDown, Check, ChevronLeft, ChevronRight, Package as PackageIcon, ReceiptText, Users, Ship } from 'lucide-react';
import dynamic from 'next/dynamic';
import { API_BASE } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, PublicDateAvailability } from '@/stores/inventoryStore';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { reportBookNowConversion } from '@/components/providers/AnalyticsProvider';

const ConfirmModal = dynamic(() => import('@/components/ui/ConfirmModal'), {
  ssr: false,
});

const BusWarningModal = dynamic(() => import('@/components/ui/BusWarningModal'), {
  ssr: false,
});

const CheckoutPassengerModal = dynamic(() => import('@/components/checkout/CheckoutPassengerModal'), {
  ssr: false,
});

// SimilarPackagesBookingWidget omitted

import { toast } from 'sonner';
import { ReconnectingEventSource } from '@/lib/ReconnectingEventSource';
import { downloadFileViaFetch } from '@/lib/downloadUtils';
import { formatIndianDate } from '@/lib/bookingDisplay';

export interface CombinationPricingItem {
  adults: number;
  children: number;
  price?: number | string | null;
  weekend_price?: number | string | null;
}

export interface RoomGuestConfig {
  adults: number;
  children: number;
}

interface PackageVariant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  weekend_adult_price?: number | string | null;
  weekend_child_price?: number | string | null;
  student_price?: number | string | null;
  weekend_student_price?: number | string | null;
  occupancy?: number | null;
  combination_pricing?: CombinationPricingItem[] | null;
  category_title?: string | null;
  transport_info?: string | null;
}

export interface PackageTransportOption {
  id: number;
  type: 'SHARED' | 'SEPARATE_VEHICLE';
  title: string;
  capacity?: number;
  adult_price?: number | string | null;
  child_price?: number | string | null;
  weekend_adult_price?: number | string | null;
  weekend_child_price?: number | string | null;
  student_price?: number | string | null;
  weekend_student_price?: number | string | null;
  fixed_price?: number | string | null;
  weekend_fixed_price?: number | string | null;
}

interface BookingSidebarV2Props {
  startingPrice?: number | string | null;
  variants: PackageVariant[];
  packageId: number;
  packageSlug: string;
  brochurePdfUrl?: string | null;
  hasTransport?: boolean;
  transportOptions?: PackageTransportOption[];
  hasRefreshments?: boolean;
  refreshmentAdultPrice?: number | string | null;
  refreshmentChildPrice?: number | string | null;
  refreshmentStudentPrice?: number | string | null;
  minPassengers?: number;
  isStudentPackage?: boolean;
  isActive?: boolean;
  hasAccommodation?: boolean;
  agentCommissionType?: string | null;
  agentCommissionPercentage?: number | string | null;
  agentCommissionFixedAmount?: number | string | null;
}

function todayIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function toYYYYMM(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatINR(value: number | string) {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function positiveNumber(value: number | string | null | undefined) {
  const numeric = Number(value || 0);
  return numeric > 0 ? numeric : 0;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const BookingSidebarV2 = ({
  startingPrice,
  variants,
  packageId,
  packageSlug,
  brochurePdfUrl,
  hasTransport,
  transportOptions = [],
  hasRefreshments,
  refreshmentAdultPrice,
  refreshmentChildPrice,
  refreshmentStudentPrice,
  minPassengers = 1,
  isStudentPackage = false,
  isActive = true,
  hasAccommodation = false,
  agentCommissionType,
  agentCommissionPercentage,
  agentCommissionFixedAmount,
}: BookingSidebarV2Props) => {
  const { isAuthenticated, user } = useAuthStore();
  const isSpecialUser = useMemo(() => {
    if (!user) return false;
    const email = user.email || '';
    const phone = user.phone_number || '';
    return email === '2024eb01987@online.bits-pilani.ac.in' || phone === '8886154275';
  }, [user]);
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { publicAvailability, publicLoading, fetchPublicAvailability } = useInventoryStore();
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showBusWarningModal, setShowBusWarningModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [commType, setCommType] = useState<string | null>(agentCommissionType || null);
  const [commPercentage, setCommPercentage] = useState<number | string | null>(agentCommissionPercentage || null);
  const [commFixedAmount, setCommFixedAmount] = useState<number | string | null>(agentCommissionFixedAmount || null);

  useEffect(() => {
    setCommType(agentCommissionType || null);
    setCommPercentage(agentCommissionPercentage || null);
    setCommFixedAmount(agentCommissionFixedAmount || null);

    if (isAgent) {
      apiClient.get(`/api/v1/packages/${packageSlug}`)
        .then((res) => {
          const pkg = res.data;
          if (pkg) {
            setCommType(pkg.agent_commission_type || null);
            setCommPercentage(pkg.agent_commission_percentage !== undefined && pkg.agent_commission_percentage !== null ? pkg.agent_commission_percentage : null);
            setCommFixedAmount(pkg.agent_commission_fixed_amount !== undefined && pkg.agent_commission_fixed_amount !== null ? pkg.agent_commission_fixed_amount : null);
          }
        })
        .catch((err) => {
          console.error('[Sidebar] Failed to load agent commission override:', err);
        });
    }
  }, [agentCommissionType, agentCommissionPercentage, agentCommissionFixedAmount, isAgent, packageSlug]);

  const handleAgreeBusWarning = () => {
    setShowBusWarningModal(false);
    setShowPassengerModal(true);
  };

  const extractObjectKey = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(private\/[^?#]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  };

  const handleDownloadBrochure = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!brochurePdfUrl) return;

    const rawKey = extractObjectKey(brochurePdfUrl);
    const filename = `${packageSlug}-brochure.pdf`;

    if (rawKey) {
      e.preventDefault();
      try {
        const downloadUrl = `/api/v1/documents/download?key=${encodeURIComponent(rawKey)}&filename=${encodeURIComponent(filename)}`;
        await downloadFileViaFetch(downloadUrl, filename);
      } catch (err) {
        console.error("Failed to download brochure:", err);
      }
    }
    // If no rawKey (it's a public external URL like Google Drive), 
    // we do NOT call e.preventDefault(). The native <a> tag will handle opening/downloading it,
    // bypassing the CORS fetch error.
  };


  const today = todayIST();
  const todayDateStr = toYYYYMMDD(today);
  const isAfterCutoff = today.getHours() >= 6;
  const minDateStr = isAfterCutoff ? toYYYYMMDD(new Date(today.getTime() + 86400000)) : todayDateStr;

  const validVariants = useMemo(() => {
    return variants
      .filter(
        (v) => (v as any).is_active !== false && !(v as any).deleted_at && v.title && v.title.trim() !== '' && (isStudentPackage ? Number(v.student_price) > 0 : Number(v.adult_price) > 0)
      )
      .sort((a, b) => {
        const occA = Number(a.occupancy || 1);
        const occB = Number(b.occupancy || 1);
        if (occA !== occB) return occA - occB;
        return Number(a.adult_price || 0) - Number(b.adult_price || 0);
      });
  }, [variants, isStudentPackage]);

  // Accommodation variants = all valid variants that have occupancy > 1 (room-based)
  const isAccommodationMode = hasAccommodation && validVariants.some(v => (v.occupancy || 1) > 1);

  const getValidCombinations = (occupancy: number): Array<{ adults: number; children: number }> => {
    const combos: Array<{ adults: number; children: number }> = [];
    const occ = Math.max(1, occupancy || 1);
    for (let a = occ; a >= 1; a--) {
      combos.push({ adults: a, children: occ - a });
    }
    return combos;
  };

  const getCombinationPrice = (
    v: PackageVariant,
    comb: { adults: number; children: number },
    isWeekend: boolean,
    isSpecial: boolean
  ): { purePrice: number; effPrice: number } => {
    const occ = Math.max(1, Number(v.occupancy || 1));
    if (isSpecial) {
      return { purePrice: occ, effPrice: occ };
    }
    const custom = v.combination_pricing?.find(
      c => Number(c.adults) === comb.adults && Number(c.children) === comb.children
    );
    if (custom) {
      const customWeekday = (custom.price !== null && custom.price !== undefined && (custom.price as any) !== '') ? Number(custom.price) : null;
      const customWeekend = (custom.weekend_price !== null && custom.weekend_price !== undefined && (custom.weekend_price as any) !== '') ? Number(custom.weekend_price) : customWeekday;
      
      if (customWeekday !== null || customWeekend !== null) {
        const pure = customWeekday !== null ? customWeekday : Number(v.adult_price || 0) * occ;
        const eff = isWeekend ? (customWeekend !== null ? customWeekend : pure) : pure;
        return { purePrice: pure, effPrice: eff };
      }
    }

    const pureAdult = Number(v.adult_price || 0);
    const pureChild = Number(v.child_price || 0);
    const effAdult = isWeekend && v.weekend_adult_price ? Number(v.weekend_adult_price) : pureAdult;
    const effChild = isWeekend && v.weekend_child_price ? Number(v.weekend_child_price) : pureChild;

    const purePrice = (comb.adults * pureAdult) + (comb.children * pureChild);
    const effPrice = (comb.adults * effAdult) + (comb.children * effChild);
    return { purePrice, effPrice };
  };

  // Room cart: variantId -> quantity (number of rooms of that type)
  const [roomCart, setRoomCart] = useState<Record<number, number>>({});
  // In-room guest breakdown: variantId -> array of { adults, children } per room
  const [roomConfigs, setRoomConfigs] = useState<Record<number, RoomGuestConfig[]>>({});

  const updateRoomConfig = (variantId: number, roomIdx: number, newAdults: number, newChildren: number) => {
    setRoomConfigs(prev => {
      const list = prev[variantId] ? [...prev[variantId]] : [];
      if (list[roomIdx]) {
        list[roomIdx] = { adults: newAdults, children: newChildren };
      }
      return { ...prev, [variantId]: list };
    });
  };

  const updateRoomCart = (variantId: number, delta: number) => {
    if (delta > 0 && !selectedDate) {
      setDateMenuOpen(true);
      toast.info('Please select a travel date first to view and book available packages.');
      return;
    }
    const targetVariant = validVariants.find(x => x.id === variantId);
    const occ = Math.max(1, Number(targetVariant?.occupancy || 1));
    const currentVarSlot = selectedDate && publicAvailability
      ? publicAvailability.dates.find(d => d.date === selectedDate && d.variant_id === variantId)
      : null;
    const varAvailableSeats = (currentVarSlot && currentVarSlot.status === 'OPEN')
      ? Number(currentVarSlot.available_seats || 0)
      : 0;

    if (delta > 0 && selectedDate) {
      if (varAvailableSeats <= 0) {
        toast.warning('This package option is unavailable or sold out for this date.');
        return;
      }
      const currentQty = roomCart[variantId] || 0;
      if ((currentQty + delta) * occ > varAvailableSeats || (roomCartTotalGuests + occ) > varAvailableSeats) {
        toast.warning(`Cannot add more packages. Only ${varAvailableSeats} seats are available for this date.`);
        return;
      }
    }

    setSelectedVariantId(variantId);
    setRoomCart(prev => {
      const current = prev[variantId] || 0;
      const next = Math.max(0, current + delta);
      const v = validVariants.find(x => x.id === variantId);
      const vOcc = Math.max(1, Number(v?.occupancy || 1));
      setRoomConfigs(cPrev => {
        const currentList = cPrev[variantId] ? [...cPrev[variantId]] : [];
        if (delta > 0) {
          for (let i = 0; i < delta; i++) currentList.push({ adults: vOcc, children: 0 });
        } else if (delta < 0) {
          for (let i = 0; i < Math.abs(delta); i++) currentList.pop();
        }
        return { ...cPrev, [variantId]: currentList };
      });
      return { ...prev, [variantId]: next };
    });
  };

  useEffect(() => {
    setRoomConfigs(prev => {
      let changed = false;
      const updated = { ...prev };
      for (const [varIdStr, qty] of Object.entries(roomCart)) {
        const varId = Number(varIdStr);
        const v = validVariants.find(x => x.id === varId);
        const occ = Math.max(1, Number(v?.occupancy || 1));
        const currentList = updated[varId] ? [...updated[varId]] : [];
        if (currentList.length < qty) {
          changed = true;
          while (currentList.length < qty) {
            currentList.push({ adults: occ, children: 0 });
          }
          updated[varId] = currentList;
        } else if (currentList.length > qty) {
          changed = true;
          updated[varId] = currentList.slice(0, qty);
        }
      }
      for (const varIdStr of Object.keys(updated)) {
        const varId = Number(varIdStr);
        if (!roomCart[varId] || roomCart[varId] <= 0) {
          if (updated[varId] && updated[varId].length > 0) {
            changed = true;
            updated[varId] = [];
          }
        }
      }
      return changed ? updated : prev;
    });
  }, [roomCart, validVariants]);

  // Total guests from room cart = Σ(qty × occupancy)
  const roomCartTotalGuests = useMemo(() => {
    if (!isAccommodationMode) return 0;
    return validVariants.reduce((sum, v) => {
      const qty = roomCart[v.id] || 0;
      const occ = Math.max(1, Number(v.occupancy || 1));
      return sum + qty * occ;
    }, 0);
  }, [isAccommodationMode, validVariants, roomCart]);

  // Total rooms selected in room cart = Σ(qty)
  const roomCartTotalRooms = useMemo(() => {
    if (!isAccommodationMode) return 0;
    return Object.values(roomCart).reduce((sum, qty) => sum + qty, 0);
  }, [isAccommodationMode, roomCart]);

  const formatPackageDisplayName = (value: string): string => value;

  const cleanCategoryTitle = (title: string, categoryTitle?: string | null): string => {
    if (categoryTitle && categoryTitle.trim()) return categoryTitle.trim();
    const clean = title.replace(/\s*[-–(:/]?\s*\d+\s*(?:members?|beds?|pax|guests?|bed|persons?).*$/i, '').trim();
    return clean || title.trim();
  };

  const getBedLabel = (title: string, occupancy: number = 1): string => {
    const match = title.match(/(\d+)\s*(?:beds?|members?|pax|guests?|persons?)/i);
    if (match) {
      return `${occupancy}-Guest Package`;
    }
    if (occupancy > 1) {
      return `${occupancy}-Guest Package`;
    }
    return title;
  };

  const getRoomNumber = (variantId: number, roomIdx: number): number => {
    const variantIndex = validVariants.findIndex((variant) => variant.id === variantId);
    const roomsBefore = validVariants
      .slice(0, Math.max(0, variantIndex))
      .reduce((sum, variant) => sum + (roomCart[variant.id] || 0), 0);
    return roomsBefore + roomIdx + 1;
  };

  // Selected category filter for accommodation packages
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [openRoomDropdown, setOpenRoomDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!openRoomDropdown) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-room-dropdown]')) {
        setOpenRoomDropdown(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [openRoomDropdown]);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Extract distinct category names from variant titles (e.g. "AC Boat + AC Room", "Non-AC Boat + AC Room")
  const uniqueCategories = useMemo(() => {
    if (!isAccommodationMode) return [];
    const set = new Set<string>();
    validVariants.forEach((v) => {
      const clean = cleanCategoryTitle(v.title, (v as any).category_title);
      set.add(clean);
    });
    return Array.from(set);
  }, [isAccommodationMode, validVariants]);

  // Auto-select category if there's only 1 category, or preselect if items already exist in roomCart
  useEffect(() => {
    if (!isAccommodationMode) return;
    if (uniqueCategories.length === 1 && !selectedCategoryFilter) {
      setSelectedCategoryFilter(uniqueCategories[0]);
    } else if (uniqueCategories.length > 1 && !selectedCategoryFilter) {
      const activeVariantId = Object.entries(roomCart).find(([_, qty]) => qty > 0)?.[0];
      if (activeVariantId) {
        const v = validVariants.find(x => x.id === Number(activeVariantId));
        if (v) {
          setSelectedCategoryFilter(cleanCategoryTitle(v.title, (v as any).category_title));
        }
      }
    }
  }, [isAccommodationMode, uniqueCategories, roomCart, selectedCategoryFilter, validVariants]);

  // Filter variants displayed in the room cart based on selected category (hidden if none selected & multiple categories exist)
  const displayedAccommodationVariants = useMemo(() => {
    if (!isAccommodationMode) return validVariants;
    if (uniqueCategories.length <= 1) {
      return validVariants;
    }
    if (!selectedCategoryFilter) {
      return []; // Hidden until a category is chosen
    }
    return validVariants.filter((v) => {
      const clean = cleanCategoryTitle(v.title, (v as any).category_title);
      return clean === selectedCategoryFilter;
    });
  }, [isAccommodationMode, validVariants, selectedCategoryFilter, uniqueCategories.length]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const openAccommodationVariants = useMemo(() => {
    if (!isAccommodationMode || !selectedDate) return [];
    if (isAdmin) return validVariants;
    if (publicLoading || !publicAvailability || publicAvailability.month !== selectedDate.slice(0, 7)) return [];

    const matched = validVariants.filter((variant) => {
      const slot = publicAvailability.dates.find(
        (item) => item.date === selectedDate && item.variant_id === variant.id
      );
      const occupancy = Math.max(1, Number(variant.occupancy || 1));
      return slot?.status === 'OPEN' && Number(slot.available_seats || 0) >= occupancy;
    });

    if (matched.length > 0) return matched;

    // Fallback: extract open variants directly from public availability
    const openSlots = publicAvailability.dates.filter(
      (d) => d.date === selectedDate && d.status === 'OPEN' && Number(d.available_seats || 0) > 0
    );
    const dynamicVariants: PackageVariant[] = [];
    openSlots.forEach((slot) => {
      if (!dynamicVariants.some((v) => v.id === slot.variant_id)) {
        const existing = variants.find((v) => v.id === slot.variant_id);
        if (existing) {
          dynamicVariants.push(existing);
        } else {
          dynamicVariants.push({
            id: slot.variant_id,
            title: slot.variant_title,
            adult_price: Number(slot.adult_price || slot.effective_adult_price || 0),
            child_price: Number(slot.child_price || slot.effective_child_price || 0),
            weekend_adult_price: null,
            weekend_child_price: null,
            student_price: slot.student_price ? Number(slot.student_price) : null,
            weekend_student_price: null,
            occupancy: 2,
            transport_info: null,
            is_active: true,
          } as any);
        }
      }
    });
    return dynamicVariants;
  }, [isAccommodationMode, selectedDate, isAdmin, validVariants, variants, publicLoading, publicAvailability]);

  const openAccommodationCategories = useMemo(() => {
    const categories = new Set<string>();
    openAccommodationVariants.forEach((variant) => {
      categories.add(cleanCategoryTitle(variant.title, (variant as any).category_title));
    });
    return Array.from(categories);
  }, [openAccommodationVariants]);

  const dateFilteredRoomVariants = useMemo(() => {
    if (!selectedDate) return [];
    const list = (uniqueCategories.length <= 1 || !selectedCategoryFilter)
      ? openAccommodationVariants
      : openAccommodationVariants.filter(
          (variant) => cleanCategoryTitle(variant.title, (variant as any).category_title) === selectedCategoryFilter
        );
    return [...list].sort((a, b) => {
      const occA = Number(a.occupancy || 1);
      const occB = Number(b.occupancy || 1);
      if (occA !== occB) return occA - occB;
      return Number(a.adult_price || 0) - Number(b.adult_price || 0);
    });
  }, [selectedDate, uniqueCategories.length, selectedCategoryFilter, openAccommodationVariants]);

  useEffect(() => {
    if (
      !isAccommodationMode || !selectedDate || publicLoading || !publicAvailability ||
      publicAvailability.month !== selectedDate.slice(0, 7)
    ) return;

    // Find the max available seats on this date
    const dateSlots = publicAvailability.dates.filter(
      (item) => item.date === selectedDate && item.status === 'OPEN'
    );
    const dateAvailableSeats = dateSlots.length > 0
      ? Math.max(...dateSlots.map(s => Number(s.available_seats || 0)))
      : 0;

    if (dateAvailableSeats <= 0) {
      if (Object.values(roomCart).some(q => q > 0)) {
        setRoomCart({});
        setRoomConfigs({});
        toast.warning('Selected packages were cleared because no seats are available on this date.');
      }
      return;
    }

    const roomLimits = new Map<number, number>();
    let adjusted = false;

    for (const variant of validVariants) {
      const selectedRooms = roomCart[variant.id] || 0;
      if (selectedRooms <= 0) continue;

      const slot = publicAvailability.dates.find(
        (item) => item.date === selectedDate && item.variant_id === variant.id
      );
      const occupancy = Math.max(1, Number(variant.occupancy || 1));
      const availableSeats = slot?.status === 'OPEN' ? Number(slot.available_seats || 0) : 0;
      const allowedRooms = Math.floor(availableSeats / occupancy);
      roomLimits.set(variant.id, allowedRooms);
      if (selectedRooms > allowedRooms) adjusted = true;
    }

    // Also check if cumulative guests across all rooms exceed dateAvailableSeats
    let totalGuests = validVariants.reduce((sum, v) => sum + ((roomCart[v.id] || 0) * Math.max(1, Number(v.occupancy || 1))), 0);
    if (totalGuests > dateAvailableSeats) adjusted = true;

    if (!adjusted) return;

    const nextCart: Record<number, number> = { ...roomCart };
    const nextConfigs: Record<number, any[]> = { ...roomConfigs };

    // Apply individual variant limits first
    roomLimits.forEach((allowedRooms, variantId) => {
      nextCart[variantId] = Math.min(nextCart[variantId] || 0, allowedRooms);
      nextConfigs[variantId] = (nextConfigs[variantId] || []).slice(0, allowedRooms);
    });

    // Recompute total guests and trim any surplus from the end
    let runningTotal = validVariants.reduce((sum, v) => sum + ((nextCart[v.id] || 0) * Math.max(1, Number(v.occupancy || 1))), 0);
    if (runningTotal > dateAvailableSeats) {
      for (const variant of [...validVariants].reverse()) {
        const occ = Math.max(1, Number(variant.occupancy || 1));
        while ((nextCart[variant.id] || 0) > 0 && runningTotal > dateAvailableSeats) {
          nextCart[variant.id] = (nextCart[variant.id] || 0) - 1;
          runningTotal -= occ;
          if (nextConfigs[variant.id]) {
            nextConfigs[variant.id] = nextConfigs[variant.id].slice(0, nextCart[variant.id]);
          }
        }
      }
    }

    setRoomCart(nextCart);
    setRoomConfigs(nextConfigs);
    toast.info(`Package selection updated to match available seats (${dateAvailableSeats}) on this date.`);
  }, [isAccommodationMode, selectedDate, publicLoading, publicAvailability, validVariants, roomCart, roomConfigs]);

  // Primary variant for checkout = the variant with the highest qty, fallback to first selected
  const primaryRoomVariant = useMemo(() => {
    if (!isAccommodationMode) return undefined;
    let best: PackageVariant | undefined;
    let bestQty = 0;
    for (const v of validVariants) {
      const qty = roomCart[v.id] || 0;
      if (qty > bestQty) { bestQty = qty; best = v; }
    }
    if (!best && selectedVariantId) {
      best = validVariants.find(v => v.id === selectedVariantId);
    }
    return best || validVariants[0];
  }, [isAccommodationMode, validVariants, roomCart, selectedVariantId]);

  const selectedVariant = useMemo(() => {
    if (isAccommodationMode) return primaryRoomVariant;
    if (selectedVariantId === null) return validVariants[0];
    return validVariants.find((v) => v.id === selectedVariantId) || validVariants[0];
  }, [isAccommodationMode, primaryRoomVariant, validVariants, selectedVariantId]);

  // Active referenced variant ID for availability slots, transport options, and inventory checks
  const activeVariantId = useMemo(() => {
    if (isAccommodationMode) {
      if (primaryRoomVariant?.id) return primaryRoomVariant.id;
      if (displayedAccommodationVariants.length > 0) return displayedAccommodationVariants[0].id;
      return selectedVariantId || validVariants[0]?.id || null;
    }
    return selectedVariantId || validVariants[0]?.id || null;
  }, [isAccommodationMode, primaryRoomVariant, displayedAccommodationVariants, selectedVariantId, validVariants]);

  // Auto-initialize selectedVariantId if not set
  useEffect(() => {
    if (selectedVariantId === null && validVariants.length > 0) {
      setSelectedVariantId(validVariants[0].id);
    }
  }, [validVariants, selectedVariantId]);

  // In accommodation mode, sync selectedVariantId when category filter changes
  useEffect(() => {
    if (isAccommodationMode && displayedAccommodationVariants.length > 0) {
      if (!displayedAccommodationVariants.some(v => v.id === selectedVariantId)) {
        setSelectedVariantId(displayedAccommodationVariants[0].id);
      }
    }
  }, [isAccommodationMode, displayedAccommodationVariants, selectedVariantId]);

  const variantOccupancy = useMemo(() => {
    if (isAccommodationMode) return 1; // handled via roomCart
    return selectedVariant?.occupancy ? Math.max(1, Number(selectedVariant.occupancy)) : 1;
  }, [isAccommodationMode, selectedVariant]);

  // Transport state: 'NONE' | 'SHARED' | 'SEPARATE'
  const [selectedTransportMode, setSelectedTransportMode] = useState<'NONE' | 'SHARED' | 'SEPARATE'>('NONE');

  useEffect(() => {
    if (!hasTransport && selectedTransportMode !== 'NONE') {
      setSelectedTransportMode('NONE');
      setSelectedSharedOptionId(null);
      setSeparateVehicleQtys({});
    }
  }, [hasTransport, selectedTransportMode]);
  // For SHARED: which option id is selected
  const [selectedSharedOptionId, setSelectedSharedOptionId] = useState<number | null>(null);
  // For SEPARATE: map of optionId -> quantity
  const [separateVehicleQtys, setSeparateVehicleQtys] = useState<Record<number, number>>({});
  const [includeRefreshments, setIncludeRefreshments] = useState<boolean>(false);
  const [currentMonthStr, setCurrentMonthStr] = useState(toYYYYMM(today));
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);

  // Keep adults aligned with room occupancy when variant changes (non-accommodation mode)
  useEffect(() => {
    if (!isAccommodationMode && variantOccupancy > 1) {
      setChildren(0);
      if (adults > 0 && adults % variantOccupancy !== 0) {
        setAdults(Math.max(variantOccupancy, Math.ceil(adults / variantOccupancy) * variantOccupancy));
      }
    }
  }, [isAccommodationMode, variantOccupancy, adults]);

  const passengerAdults = useMemo(() => {
    if (isAccommodationMode) {
      let total = 0;
      for (const [varIdStr, configs] of Object.entries(roomConfigs)) {
        const qty = roomCart[Number(varIdStr)] || 0;
        if (qty <= 0) continue;
        const effectiveConfigs = configs.slice(0, qty);
        total += effectiveConfigs.reduce((s, c) => s + (c.adults || 0), 0);
      }
      return total;
    }
    return adults ?? 0;
  }, [isAccommodationMode, roomConfigs, roomCart, adults]);

  const passengerChildren = useMemo(() => {
    if (isAccommodationMode) {
      let total = 0;
      for (const [varIdStr, configs] of Object.entries(roomConfigs)) {
        const qty = roomCart[Number(varIdStr)] || 0;
        if (qty <= 0) continue;
        const effectiveConfigs = configs.slice(0, qty);
        total += effectiveConfigs.reduce((s, c) => s + (c.children || 0), 0);
      }
      return total;
    }
    return children ?? 0;
  }, [isAccommodationMode, roomConfigs, roomCart, children]);

  const totalPassengers = passengerAdults + passengerChildren;

  const hasPassengerSelection = useMemo(() => {
    if (isAccommodationMode) {
      return roomCartTotalGuests > 0 && Object.values(roomCart).some(q => q > 0);
    }
    const minPax = minPassengers || 1;
    if (isStudentPackage) {
      return adults >= minPax;
    }
    if (variantOccupancy > 1) {
      return adults >= variantOccupancy && adults % variantOccupancy === 0;
    }
    if (adults < 1) return false;
    return totalPassengers >= minPax;
  }, [isAccommodationMode, roomCartTotalGuests, roomCart, adults, totalPassengers, isStudentPackage, minPassengers, variantOccupancy]);
  const [paymentPercentage, setPaymentPercentage] = useState(100);
  // Custom pay-now amount in rupees (null = full payment)
  const [customPayAmount, setCustomPayAmount] = useState<string>('');
  const [isAdvanceSelected, setIsAdvanceSelected] = useState<boolean>(false);


  useEffect(() => {
    const handlePageShow = () => {
      setIsProcessingCheckout(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('restore_checkout=true')) {
      const savedCustomPay = sessionStorage.getItem('last_checkout_custom_pay');
      const savedGateway = sessionStorage.getItem('last_checkout_gateway');
      const savedDate = sessionStorage.getItem('last_checkout_selected_date');
      const savedVariantId = sessionStorage.getItem('last_checkout_selected_variant_id');
      const savedTransportMode = sessionStorage.getItem('last_checkout_selected_transport_mode');
      const savedSharedOptionId = sessionStorage.getItem('last_checkout_selected_shared_option_id');
      const savedSeparateVehicleQtys = sessionStorage.getItem('last_checkout_separate_vehicle_qtys');
      const savedIncludeRefreshments = sessionStorage.getItem('last_checkout_include_refreshments');
      const savedAdults = sessionStorage.getItem('last_checkout_adults');
      const savedChildren = sessionStorage.getItem('last_checkout_children');
      
      if (savedCustomPay !== null) {
        setCustomPayAmount(savedCustomPay);
        if (savedCustomPay !== '') setIsAdvanceSelected(true);
      }
      if (savedGateway === 'PHONEPE' || savedGateway === 'CASHFREE') {
        setSelectedGateway(savedGateway as 'PHONEPE' | 'CASHFREE');
      }
      if (savedDate) setSelectedDate(savedDate);
      if (savedVariantId) setSelectedVariantId(Number(savedVariantId));
      if (savedTransportMode) setSelectedTransportMode(savedTransportMode as 'NONE' | 'SHARED' | 'SEPARATE');
      if (savedSharedOptionId) setSelectedSharedOptionId(Number(savedSharedOptionId));
      if (savedSeparateVehicleQtys) {
        try {
          setSeparateVehicleQtys(JSON.parse(savedSeparateVehicleQtys));
        } catch (e) {}
      }
      if (savedIncludeRefreshments) setIncludeRefreshments(savedIncludeRefreshments === 'true');
      if (savedAdults) setAdults(Number(savedAdults));
      if (savedChildren) setChildren(Number(savedChildren));
      const savedRoomCart = sessionStorage.getItem('last_checkout_room_cart');
      if (savedRoomCart) {
        try {
          const parsed = JSON.parse(savedRoomCart);
          const guestCount = validVariants.reduce((sum, v) => sum + ((parsed[v.id] || 0) * Math.max(1, Number(v.occupancy || 1))), 0);
          if (guestCount > 0 && guestCount <= 50) {
            setRoomCart(parsed);
            const savedRoomConfigs = sessionStorage.getItem('last_checkout_room_configs');
            if (savedRoomConfigs) setRoomConfigs(JSON.parse(savedRoomConfigs));
          } else {
            sessionStorage.removeItem('last_checkout_room_cart');
            sessionStorage.removeItem('last_checkout_room_configs');
            sessionStorage.removeItem('last_checkout_passengers');
          }
        } catch (e) {}
      }
      
      // Auto-open passenger details modal
      setShowPassengerModal(true);
      
      // Clean up search parameters so refresh doesn't pop it open again
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('restore_checkout');
        window.history.replaceState({}, '', url.pathname + url.search);
      } catch (e) {
        console.error("Failed to clean restore_checkout search parameter", e);
      }
    }
  }, []);


  const [couponCode, setCouponCode] = useState('');
  const [pendingCouponCode, setPendingCouponCode] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    discounted_subtotal: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'PHONEPE' | 'CASHFREE'>('PHONEPE');
  const [variantMenuOpen, setVariantMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);

  // Calendar/dropdown references
  const variantMenuRef = useRef<HTMLDivElement>(null);
  const dateMenuRef = useRef<HTMLDivElement>(null);

  // Calendar state
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-11

  // Derived: split transport options by type
  const sharedOptions = useMemo(() => transportOptions.filter(o => o.type === 'SHARED'), [transportOptions]);
  const separateOptions = useMemo(() => transportOptions.filter(o => o.type === 'SEPARATE_VEHICLE'), [transportOptions]);

  const selectedSharedOption = useMemo(() => {
    return transportOptions.find(o => o.id === selectedSharedOptionId);
  }, [transportOptions, selectedSharedOptionId]);

  const is25SeaterSelected = useMemo(() => {
    return selectedTransportMode === 'SHARED' && 
      selectedSharedOption && 
      (selectedSharedOption.capacity === 25 ||
       selectedSharedOption.title.toLowerCase().includes('25') ||
       selectedSharedOption.title.toLowerCase().includes('25-seater') ||
       selectedSharedOption.title.toLowerCase().includes('25 seater'));
  }, [selectedTransportMode, selectedSharedOption]);

  // Reset custom payment when core booking parameters change so the user doesn't get stuck with an old advance amount
  useEffect(() => {
    setCustomPayAmount('');
    setPaymentPercentage(100);
    setIsAdvanceSelected(false);
  }, [selectedVariantId, selectedDate, adults, children, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, includeRefreshments, roomCart]);

  useEffect(() => {
    if (!hasTransport) {
      setSelectedTransportMode('NONE');
      setSelectedSharedOptionId(null);
      setSeparateVehicleQtys({});
    }
  }, [hasTransport]);



  useEffect(() => {
    if (packageSlug && currentMonthStr) {
      fetchPublicAvailability(packageSlug, currentMonthStr);
    }
  }, [packageSlug, currentMonthStr]);

  // Version tracking map for A-C-B out of order protection
  const versionMapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!packageId) return;

    // Connect to scoped SSE endpoint
    const sse = new ReconnectingEventSource(`/api/v1/stream/packages/${packageId}`);

    const handleUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const key = `${payload.variant_id}-${payload.travel_date}`;

        // Event ordering protection: ignore stale versions
        const currentVersion = versionMapRef.current[key] || 0;
        if (payload.version < currentVersion) {
          console.warn(`[SSE] Ignored stale event for ${key} (version ${payload.version} < ${currentVersion})`);
          return;
        }

        // Update version and apply payload
        versionMapRef.current[key] = payload.version;
        useInventoryStore.getState().applySSEPayload(payload);
      } catch (err) {
        console.error('[SSE] Failed to parse event payload', err);
      }
    };

    const handleEntityUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.status === 'DELETED') {
          // Force-close checkout modal before redirecting
          setShowPassengerModal(false);
          setSelectedDate('');
          toast.error('This package has been removed by the administrator.', { duration: 10000 });
          router.push('/');
        } else if (payload.status === 'INACTIVE') {
          // Force-close modal, clear all booking state, show suspended banner
          setShowPassengerModal(false);
          setSelectedDate('');
          toast.error('This package is now inactive. Bookings have been suspended.', { duration: 10000 });
          fetchPublicAvailability(packageSlug, currentMonthStr, true);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse entity event payload', err);
      }
    };

    const handleQuotaUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const currentUser = useAuthStore.getState().user;
        if (currentUser && currentUser.role === 'AGENT' && payload.agent_id === currentUser.id) {
          toast.info('Your daily booking quota & commission rates for this package have been updated by an administrator in real-time!', { duration: 5000 });
          if (payload.commission_type) {
            setCommType(payload.commission_type);
          }
          if (payload.commission_percentage !== undefined) {
            setCommPercentage(payload.commission_percentage);
          }
          if (payload.commission_fixed_amount !== undefined) {
            setCommFixedAmount(payload.commission_fixed_amount);
          }
          fetchPublicAvailability(packageSlug, currentMonthStr, true);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse quota event payload', err);
      }
    };

    const handleTransportUpdate = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        useInventoryStore.getState().applyTransportSSEPayload(payload);
      } catch (err) {
        console.error('[SSE] Failed to parse transport event payload', err);
      }
    };

    const handleBulkRefresh = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.package_id === packageId) {
          const { fetchPublicAvailability } = useInventoryStore.getState();
          fetchPublicAvailability(packageSlug, currentMonthStr, true);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse bulk refresh payload', err);
      }
    };

    sse.addEventListener('INVENTORY_UPDATE', handleUpdate);
    sse.addEventListener('ENTITY_STATUS_UPDATE', handleEntityUpdate);
    sse.addEventListener('QUOTA_UPDATE', handleQuotaUpdate);
    sse.addEventListener('TRANSPORT_UPDATE', handleTransportUpdate);
    sse.addEventListener('BULK_REFRESH', handleBulkRefresh);

    return () => {
      sse.removeEventListener('INVENTORY_UPDATE', handleUpdate);
      sse.removeEventListener('ENTITY_STATUS_UPDATE', handleEntityUpdate);
      sse.removeEventListener('QUOTA_UPDATE', handleQuotaUpdate);
      sse.removeEventListener('TRANSPORT_UPDATE', handleTransportUpdate);
      sse.removeEventListener('BULK_REFRESH', handleBulkRefresh);
      sse.close();
    };
  }, [packageId, packageSlug, currentMonthStr]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setDateMenuOpen(false);
      }
      if (variantMenuRef.current && !variantMenuRef.current.contains(event.target as Node)) {
        setVariantMenuOpen(false);
      }
      if (!(event.target as HTMLElement)?.closest?.('[data-room-dropdown]')) {
        setOpenRoomDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Proactively fetch latest agent profile/commission to prevent stale session calculations
  useEffect(() => {
    if (isAuthenticated && isAgent) {
      apiClient.get('/api/v1/auth/me')
        .then((res) => {
          useAuthStore.getState().updateUser(res.data);
        })
        .catch(() => { });
    }
  }, [isAuthenticated, isAgent]);

  // Listen for variant selection from the left-side fare cards
  useEffect(() => {
    const handleSelectVariant = (e: Event) => {
      const variantId = (e as CustomEvent).detail?.variantId;
      if (variantId && validVariants.some(v => v.id === variantId)) {
        setSelectedVariantId(variantId);
        if (isAccommodationMode) {
          const targetVariant = validVariants.find(v => v.id === variantId);
          if (targetVariant?.category_title) {
            setSelectedCategoryFilter(targetVariant.category_title);
          }
          setRoomCart(prev => {
            const currentQty = prev[variantId] || 0;
            return {
              ...prev,
              [variantId]: currentQty > 0 ? currentQty : 1
            };
          });
        }
      }
    };
    window.addEventListener('select-variant', handleSelectVariant);
    return () => window.removeEventListener('select-variant', handleSelectVariant);
  }, [validVariants, isAccommodationMode]);

  // Clamp passengers when date/slot changes (non-accommodation only)
  useEffect(() => {
    if (!isAccommodationMode && selectedDate && publicAvailability && activeVariantId !== null) {
      const slot = publicAvailability.dates.find(
        (d) => d.date === selectedDate && d.variant_id === activeVariantId
      );
      if (slot && slot.status === 'OPEN') {
        const available = Number(slot.available_seats || 0);
        if (!isAdmin && totalPassengers > available && available > 0 && adults !== null) {
          setChildren(0);
          setAdults(Math.max(1, available));
        }
      }
    }
  }, [isAccommodationMode, selectedDate, publicAvailability, activeVariantId, adults, children, totalPassengers, isAdmin]);

  const handleDaySelect = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const dateStr = toYYYYMMDD(d);
    if (dateStr >= minDateStr) {
      setSelectedDate(dateStr);
      setDateMenuOpen(false);
      const newMonth = dateStr.slice(0, 7);
      if (newMonth !== currentMonthStr) setCurrentMonthStr(newMonth);
    }
  };

  const nextMonth = () => {
    let m = calMonth + 1;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    setCalMonth(m);
    setCalYear(y);
    setCurrentMonthStr(`${y}-${String(m + 1).padStart(2, '0')}`);
  };

  const prevMonth = () => {
    let m = calMonth - 1;
    let y = calYear;
    if (m < 0) { m = 11; y--; }

    // Don't go before current month
    const today = todayIST();
    if (y < today.getFullYear() || (y === today.getFullYear() && m < today.getMonth())) {
      return;
    }

    setCalMonth(m);
    setCalYear(y);
    setCurrentMonthStr(`${y}-${String(m + 1).padStart(2, '0')}`);
  };

  const tomorrowDateStr = useMemo(() => {
    const tomorrow = new Date(todayIST().getTime() + 86400000);
    return toYYYYMMDD(tomorrow);
  }, []);

  const tomorrowSlot = useMemo(() => {
    if (!publicAvailability || activeVariantId === null) return null;
    let slot = publicAvailability.dates.find(
      (d) => d.date === tomorrowDateStr && d.variant_id === activeVariantId
    ) ?? null;

    if (isAccommodationMode && (!slot || slot.status === 'CLOSED' || slot.status === 'NO_INVENTORY')) {
      const allowedVariantIds = displayedAccommodationVariants.length > 0
        ? displayedAccommodationVariants.map(v => v.id)
        : validVariants.map(v => v.id);

      const altSlot = publicAvailability.dates.find(
        (d) => d.date === tomorrowDateStr && allowedVariantIds.includes(d.variant_id) && (d.status === 'OPEN' || Number(d.available_seats) > 0)
      );
      if (altSlot) slot = altSlot;
    }

    return slot ?? null;
  }, [tomorrowDateStr, activeVariantId, publicAvailability, isAccommodationMode, displayedAccommodationVariants, validVariants]);

  const selectedSlot = useMemo(() => {
    if (!selectedDate || !publicAvailability) return null;
    const targetVarId = activeVariantId;

    // 1. Try to find the exact slot matching activeVariantId
    let slot = targetVarId !== null
      ? (publicAvailability.dates.find((d) => d.date === selectedDate && d.variant_id === targetVarId) ?? null)
      : null;

    // 2. In accommodation mode, if the target slot is closed or has no inventory,
    // look for ANY variant in the currently selected category (or package) that is OPEN
    if (isAccommodationMode && (!slot || slot.status === 'CLOSED' || slot.status === 'NO_INVENTORY')) {
      const allowedVariantIds = displayedAccommodationVariants.length > 0
        ? displayedAccommodationVariants.map(v => v.id)
        : validVariants.map(v => v.id);

      const altSlot = publicAvailability.dates.find(
        (d) => d.date === selectedDate && allowedVariantIds.includes(d.variant_id) && (d.status === 'OPEN' || Number(d.available_seats) > 0)
      );
      if (altSlot) {
        slot = altSlot;
      }
    }

    if (!slot) {
      const anyOpenSlot = publicAvailability.dates.find(
        (d) => d.date === selectedDate && d.status === 'OPEN' && Number(d.available_seats || 0) > 0
      );
      if (anyOpenSlot) {
        slot = anyOpenSlot;
      }
    }

    return slot ?? null;
  }, [selectedDate, activeVariantId, publicAvailability, isAccommodationMode, displayedAccommodationVariants, validVariants]);

  const displaySlot = useMemo(() => {
    if (selectedSlot) return selectedSlot;
    if (selectedDate && publicAvailability) {
      // Find ANY slot on selectedDate for this package that has transport_availability
      const anyDateSlot = publicAvailability.dates.find(d => d.date === selectedDate && d.transport_availability && d.transport_availability.length > 0);
      if (anyDateSlot) return anyDateSlot;
    }
    return tomorrowSlot;
  }, [selectedSlot, selectedDate, publicAvailability, tomorrowSlot]);

  // selectedVariant is memoized above

  const isPackageInactive = isActive === false;

  const availabilityState = useMemo(() => {
    if (publicLoading) return { kind: 'loading' as const, message: 'Checking seats...' };
    if (!isActive) return { kind: 'closed' as const, message: 'Bookings are closed / inactive' };
    if (isPackageInactive && !isAdmin) return { kind: 'closed' as const, message: 'Bookings are closed / inactive' };
    
    const slot = selectedSlot || tomorrowSlot;
    const isFallback = !selectedDate;
    const dateLabel = isFallback ? 'for tomorrow' : '';

    // If no date is selected, simply show as "Available" to encourage users to interact
    // instead of showing "Sold Out" based on tomorrow's status.
    if (isFallback) {
      if (isAdmin) {
        return { kind: 'open' as const, message: 'Unlimited Seats (Admin Bypass)' };
      }
      return { kind: 'open' as const, message: 'Available - Select a date' };
    }

    if (!slot) {
      return { kind: 'unpublished' as const, message: 'Schedule not opened yet. Call to confirm.' };
    }

    if (slot.status === 'CLOSED') return { kind: 'closed' as const, message: `Date closed for booking ${dateLabel}`.trim() };
    if (slot.status === 'SOLD_OUT') return { kind: 'sold_out' as const, message: `Sold out ${dateLabel}`.trim() };
    if (slot.status === 'NO_INVENTORY') return { kind: 'unpublished' as const, message: `Schedule not opened yet ${dateLabel}`.trim() };
    if (Number(slot.available_seats || 0) <= 0) {
      return { kind: 'unpublished' as const, message: `Seats not published yet ${dateLabel}`.trim() };
    }

    if (isAdmin) {
      return { kind: 'open' as const, message: `Public: ${slot.available_seats} seats ${dateLabel} (Admin: Unlimited)`.trim() };
    }
    return { kind: 'open' as const, message: `${slot.available_seats} seats available ${dateLabel}`.trim() };
  }, [publicLoading, isPackageInactive, isActive, selectedDate, selectedSlot, tomorrowSlot, isAdmin]);


  const isWeekendSelected = useMemo(() => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6;
  }, [selectedDate]);

  const prices = useMemo(() => {
    const isWeekend = isWeekendSelected;

    // ACCOMMODATION MODE: calculate totals by summing across all selected room types in roomCart
    if (isAccommodationMode) {
      let pureBaseSubtotal = 0;
      let baseSubtotal = 0;
      let weekendSurchargeSubtotal = 0;
      const roomCartBreakdown: Array<{
        variantId: number;
        title: string;
        occupancy: number;
        roomIndex?: number;
        adults?: number;
        children?: number;
        qty: number;
        pureUnitPrice: number;
        effUnitPrice: number;
        roomPurePrice: number;
        roomEffPrice: number;
        subtotal: number;
        pureSubtotal: number;
        guests: number;
      }> = [];

      for (const v of validVariants) {
        const qty = roomCart[v.id] || 0;
        if (qty <= 0) continue;
        const occ = Math.max(1, Number(v.occupancy || 1));
        const configs = (roomConfigs[v.id] || []).slice(0, qty);
        configs.forEach((comb, roomIdx) => {
          const { purePrice, effPrice } = getCombinationPrice(v, comb, isWeekend, isSpecialUser);
          pureBaseSubtotal += purePrice;
          baseSubtotal += effPrice;
          if (isWeekend) {
            weekendSurchargeSubtotal += (effPrice - purePrice);
          }

          roomCartBreakdown.push({
            variantId: v.id,
            roomIndex: roomIdx + 1,
            title: v.title,
            occupancy: occ,
            adults: comb.adults,
            children: comb.children,
            qty: 1,
            pureUnitPrice: purePrice / occ,
            effUnitPrice: effPrice / occ,
            roomPurePrice: purePrice,
            roomEffPrice: effPrice,
            subtotal: effPrice,
            pureSubtotal: purePrice,
            guests: occ,
          });
        });
      }

      // Transport Pricing (shared pax = total guests across all rooms)
      let transportSubtotal = 0;
      const transportBreakdown: Array<{title: string; type: string; quantity: number; unitPrice: number; subtotal: number}> = [];
      if (hasTransport) {
        if (selectedTransportMode === 'SHARED' && selectedSharedOptionId) {
          const tOpt = transportOptions.find(o => o.id === selectedSharedOptionId);
          if (tOpt) {
            const tAdult = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_adult_price ? tOpt.weekend_adult_price : tOpt.adult_price);
            const cost = roomCartTotalGuests * tAdult;
            transportSubtotal = cost;
            transportBreakdown.push({ title: tOpt.title, type: 'SHARED', quantity: 1, unitPrice: tAdult, subtotal: cost });
          }
        } else if (selectedTransportMode === 'SEPARATE') {
          for (const [optIdStr, qty] of Object.entries(separateVehicleQtys)) {
            if (!qty || qty <= 0) continue;
            const optId = Number(optIdStr);
            const tOpt = transportOptions.find(o => o.id === optId);
            if (tOpt) {
              const tFixed = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_fixed_price ? tOpt.weekend_fixed_price : tOpt.fixed_price);
              const cost = qty * tFixed;
              transportSubtotal += cost;
              transportBreakdown.push({ title: tOpt.title, type: 'SEPARATE_VEHICLE', quantity: qty, unitPrice: tFixed, subtotal: cost });
            }
          }
        }
      }

      // Refreshment Pricing
      let refreshmentSubtotal = 0;
      if (hasRefreshments && includeRefreshments) {
        const refAdult = isSpecialUser ? 1 : positiveNumber(refreshmentAdultPrice);
        refreshmentSubtotal = roomCartTotalGuests * refAdult;
      }

      const rawSubtotal = baseSubtotal + transportSubtotal + refreshmentSubtotal;
      let subtotal = rawSubtotal;
      let discount = 0;

      if (appliedCoupon) {
        discount = appliedCoupon.discount_amount;
        subtotal = Math.max(0, rawSubtotal - discount);
      }

      const gst = roundCurrency(subtotal * 0.05);
      const feeBase = subtotal + gst;
      const gatewayFee = roundCurrency(feeBase * 0.01);
      const serviceCharge = roundCurrency(feeBase * 0.01);
      const grandTotal = roundCurrency(subtotal + gst + gatewayFee + serviceCharge);

      const commissionType = commType || user?.commission_type || 'PERCENTAGE';
      const commissionPercentage = commPercentage !== undefined && commPercentage !== null
        ? Number(commPercentage)
        : (user?.commission_percentage ? Number(user.commission_percentage) : 0);
      const commissionFixedAmount = commFixedAmount !== undefined && commFixedAmount !== null
        ? Number(commFixedAmount)
        : (user?.commission_fixed_amount ? Number(user.commission_fixed_amount) : 0);

      let agentDiscount = 0;
      if (isAgent) {
        const commissionableBase = baseSubtotal;
        if (commissionType === 'FIXED_AMOUNT') {
          agentDiscount = Math.min(commissionFixedAmount, commissionableBase, grandTotal);
        } else {
          agentDiscount = Math.min(grandTotal, Math.round((commissionableBase * commissionPercentage) / 100));
        }
      }
      const agentPayable = Math.max(0, grandTotal - agentDiscount);

      return {
        pureBaseAdult: primaryRoomVariant ? Number(primaryRoomVariant.adult_price) : 0,
        pureBaseChild: 0,
        pureBaseStudent: 0,
        baseAdult: primaryRoomVariant ? Number(primaryRoomVariant.adult_price) : 0,
        baseChild: 0,
        baseStudent: 0,
        baseSubtotal,
        pureBaseSubtotal,
        weekendSurchargeSubtotal,
        surgeSubtotal: 0,
        discountSubtotal: 0,
        transportSubtotal,
        transportBreakdown,
        refreshmentSubtotal,
        rawSubtotal,
        discount,
        subtotal,
        gst,
        gatewayFee,
        serviceCharge,
        grandTotal,
        agentDiscount,
        agentPayable,
        commissionType,
        commissionPercentage,
        commissionFixedAmount,
        roomCartBreakdown,
      };
    }

    const pricingAdults = adults ?? 0;
    const pricingChildren = children ?? 0;

    // BASE PRICING Breakdown
    let pureBaseAdult = isSpecialUser ? 1 : (positiveNumber(selectedVariant?.adult_price) || positiveNumber(startingPrice));
    let pureBaseChild = isSpecialUser ? 1 : positiveNumber(selectedVariant?.child_price);
    let pureBaseStudent = isSpecialUser ? 1 : (positiveNumber(selectedVariant?.student_price) || positiveNumber(startingPrice));

    let baseAdult = isSpecialUser ? 1 : 0;
    let baseChild = isSpecialUser ? 1 : 0;
    let baseStudent = isSpecialUser ? 1 : 0;

    if (isStudentPackage) {
      if (selectedSlot) {
        baseStudent = isSpecialUser ? 1 : ((selectedSlot.effective_student_price !== undefined && selectedSlot.effective_student_price !== null)
          ? Number(selectedSlot.effective_student_price)
          : (selectedSlot.student_price !== undefined && selectedSlot.student_price !== null ? Number(selectedSlot.student_price) : Number(selectedVariant?.student_price || startingPrice)));
      } else {
        baseStudent = isWeekend && selectedVariant?.weekend_student_price 
          ? (isSpecialUser ? 1 : positiveNumber(selectedVariant.weekend_student_price)) 
          : pureBaseStudent;
      }
    } else {
      if (selectedSlot) {
        baseAdult = isSpecialUser ? 1 : ((selectedSlot.effective_adult_price !== undefined && selectedSlot.effective_adult_price !== null)
          ? Number(selectedSlot.effective_adult_price)
          : Number(selectedSlot.adult_price));
          
        baseChild = isSpecialUser ? 1 : ((selectedSlot.effective_child_price !== undefined && selectedSlot.effective_child_price !== null)
          ? Number(selectedSlot.effective_child_price)
          : Number(selectedSlot.child_price));
      } else {
        baseAdult = isWeekend && selectedVariant?.weekend_adult_price 
          ? (isSpecialUser ? 1 : positiveNumber(selectedVariant.weekend_adult_price)) 
          : pureBaseAdult;
          
        baseChild = isWeekend && selectedVariant?.weekend_child_price 
          ? (isSpecialUser ? 1 : positiveNumber(selectedVariant.weekend_child_price)) 
          : pureBaseChild;
      }
    }

    const pureBaseSubtotal = isStudentPackage 
      ? (pricingAdults * pureBaseStudent)
      : (pricingAdults * pureBaseAdult) + (pricingChildren * pureBaseChild);
    
    let weekendSurchargeSubtotal = 0;
    let expectedEffAdult = pureBaseAdult;
    let expectedEffChild = pureBaseChild;
    let expectedEffStudent = pureBaseStudent;
    
    if (isWeekend) {
      if (isStudentPackage) {
        expectedEffStudent = positiveNumber(selectedVariant?.weekend_student_price) || pureBaseStudent;
        weekendSurchargeSubtotal = pricingAdults * (expectedEffStudent - pureBaseStudent);
      } else {
        expectedEffAdult = positiveNumber(selectedVariant?.weekend_adult_price) || pureBaseAdult;
        expectedEffChild = positiveNumber(selectedVariant?.weekend_child_price) || pureBaseChild;
        weekendSurchargeSubtotal = (pricingAdults * (expectedEffAdult - pureBaseAdult)) + (pricingChildren * (expectedEffChild - pureBaseChild));
      }
    }

    let surgeSubtotal = 0;
    let discountSubtotal = 0;

    if (isStudentPackage) {
      if (baseStudent > expectedEffStudent) {
        surgeSubtotal += (pricingAdults * (baseStudent - expectedEffStudent));
      } else if (baseStudent < expectedEffStudent) {
        discountSubtotal += (pricingAdults * (expectedEffStudent - baseStudent));
      }
    } else {
      if (baseAdult > expectedEffAdult) {
        surgeSubtotal += (pricingAdults * (baseAdult - expectedEffAdult));
      } else if (baseAdult < expectedEffAdult) {
        discountSubtotal += (pricingAdults * (expectedEffAdult - baseAdult));
      }

      if (baseChild > expectedEffChild) {
        surgeSubtotal += (pricingChildren * (baseChild - expectedEffChild));
      } else if (baseChild < expectedEffChild) {
        discountSubtotal += (pricingChildren * (expectedEffChild - baseChild));
      }
    }

    const baseSubtotal = isStudentPackage
      ? (pricingAdults * baseStudent)
      : (pricingAdults * baseAdult) + (pricingChildren * baseChild);
    
    // TRANSPORT PRICING
    let transportSubtotal = 0;
    const transportBreakdown: Array<{title: string; type: string; quantity: number; unitPrice: number; subtotal: number}> = [];
    
    if (hasTransport) {
      if (selectedTransportMode === 'SHARED' && selectedSharedOptionId) {
        const tOpt = transportOptions.find(o => o.id === selectedSharedOptionId);
        if (tOpt) {
          if (isStudentPackage) {
            const tStudent = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_student_price ? tOpt.weekend_student_price : tOpt.student_price);
            const cost = pricingAdults * tStudent;
            transportSubtotal = cost;
            transportBreakdown.push({ title: tOpt.title, type: 'SHARED', quantity: 1, unitPrice: tStudent, subtotal: cost });
          } else {
            const tAdult = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_adult_price ? tOpt.weekend_adult_price : tOpt.adult_price);
            const tChild = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_child_price ? tOpt.weekend_child_price : tOpt.child_price);
            const cost = (pricingAdults * tAdult) + (pricingChildren * tChild);
            transportSubtotal = cost;
            transportBreakdown.push({ title: tOpt.title, type: 'SHARED', quantity: 1, unitPrice: tAdult, subtotal: cost });
          }
        }
      } else if (selectedTransportMode === 'SEPARATE') {
        for (const [optIdStr, qty] of Object.entries(separateVehicleQtys)) {
          if (!qty || qty <= 0) continue;
          const optId = Number(optIdStr);
          const tOpt = transportOptions.find(o => o.id === optId);
          if (tOpt) {
            const tFixed = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_fixed_price ? tOpt.weekend_fixed_price : tOpt.fixed_price);
            const cost = qty * tFixed;
            transportSubtotal += cost;
            transportBreakdown.push({ title: tOpt.title, type: 'SEPARATE_VEHICLE', quantity: qty, unitPrice: tFixed, subtotal: cost });
          }
        }
      }
    }
    
    // REFRESHMENT PRICING
    let refreshmentSubtotal = 0;
    let refAdult = 0;
    let refChild = 0;
    let refStudent = 0;
    if (hasRefreshments && includeRefreshments) {
      if (isStudentPackage) {
        refStudent = isSpecialUser ? 1 : positiveNumber(refreshmentStudentPrice);
        refreshmentSubtotal = pricingAdults * refStudent;
      } else {
        refAdult = isSpecialUser ? 1 : positiveNumber(refreshmentAdultPrice);
        refChild = isSpecialUser ? 1 : positiveNumber(refreshmentChildPrice);
        refreshmentSubtotal = (pricingAdults * refAdult) + (pricingChildren * refChild);
      }
    }

    const rawSubtotal = baseSubtotal + transportSubtotal + refreshmentSubtotal;

    let subtotal = rawSubtotal;
    let discount = 0;

    if (appliedCoupon) {
      discount = appliedCoupon.discount_amount;
      subtotal = Math.max(0, rawSubtotal - discount);
    }

    const gst = roundCurrency(subtotal * 0.05);
    const feeBase = subtotal + gst;
    const gatewayFee = roundCurrency(feeBase * 0.01);
    const serviceCharge = roundCurrency(feeBase * 0.01);
    const grandTotal = roundCurrency(subtotal + gst + gatewayFee + serviceCharge);

    // Agent Commission Calculations (Package-specific override fallback to agent profile default)
    const commissionType = commType || user?.commission_type || 'PERCENTAGE';
    const commissionPercentage = commPercentage !== undefined && commPercentage !== null
      ? Number(commPercentage)
      : (user?.commission_percentage ? Number(user.commission_percentage) : 0);
    const commissionFixedAmount = commFixedAmount !== undefined && commFixedAmount !== null
      ? Number(commFixedAmount)
      : (user?.commission_fixed_amount ? Number(user.commission_fixed_amount) : 0);

    let agentDiscount = 0;
    if (isAgent) {
      const commissionableBase = baseSubtotal;
      if (commissionType === 'FIXED_AMOUNT') {
        agentDiscount = Math.min(commissionFixedAmount, commissionableBase, grandTotal);
      } else {
        agentDiscount = Math.min(grandTotal, Math.round((commissionableBase * commissionPercentage) / 100));
      }
    }
    const agentPayable = Math.max(0, grandTotal - agentDiscount);

    return { 
      pureBaseAdult, pureBaseChild, pureBaseStudent,
      baseAdult, baseChild, baseStudent, baseSubtotal,
      pureBaseSubtotal, weekendSurchargeSubtotal, surgeSubtotal, discountSubtotal,
      transportSubtotal, transportBreakdown,
      refreshmentSubtotal, 
      rawSubtotal, discount, subtotal, gst, gatewayFee, serviceCharge,
      grandTotal, agentDiscount, agentPayable,
      commissionType, commissionPercentage, commissionFixedAmount,
      roomCartBreakdown: [] as Array<{
        variantId: number;
        title: string;
        occupancy: number;
        roomIndex?: number;
        adults?: number;
        children?: number;
        qty: number;
        pureUnitPrice: number;
        effUnitPrice: number;
        roomPurePrice: number;
        roomEffPrice: number;
        subtotal: number;
        pureSubtotal: number;
        guests: number;
      }>
    };
  }, [isAccommodationMode, validVariants, roomCart, roomCartTotalGuests, primaryRoomVariant, selectedSlot, selectedVariant, startingPrice, adults, children, appliedCoupon, user, isAgent, selectedDate, hasTransport, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, transportOptions, hasRefreshments, includeRefreshments, refreshmentAdultPrice, refreshmentChildPrice, isStudentPackage, refreshmentStudentPrice, commType, commPercentage, commFixedAmount, isWeekendSelected, isSpecialUser]);

  const { effectivePayNow, isPartial } = useMemo(() => {
    const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
    const minPayable = Math.ceil(finalTotal * 0.35);
    const parsedCustom = parseInt(customPayAmount, 10);
    const payNow = !isAdvanceSelected
      ? finalTotal
      : (isNaN(parsedCustom) || customPayAmount === '' ? minPayable : Math.min(finalTotal, Math.max(minPayable, parsedCustom)));
    return {
      effectivePayNow: payNow,
      isPartial: isAdvanceSelected
    };
  }, [prices.agentPayable, prices.grandTotal, customPayAmount, isAgent, isAdvanceSelected]);

  // Adjust custom pay amount when total price changes (e.g., removing a passenger)
  useEffect(() => {
    if (!isAdvanceSelected) return;
    setCustomPayAmount(prev => {
      if (prev === '') return prev;
      const parsed = parseInt(prev, 10);
      const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
      const minPayable = Math.ceil(finalTotal * 0.35);
      if (!isNaN(parsed)) {
        if (parsed >= finalTotal) {
          setIsAdvanceSelected(false);
          return '';
        }
        if (parsed < minPayable) return String(minPayable);
      }
      return prev;
    });
  }, [prices.grandTotal, prices.agentPayable, isAgent, isAdvanceSelected]);

  // Live recalculation / revalidation when dependencies change
  useEffect(() => {
    if (!appliedCoupon) return;

    let isMounted = true;
    const revalidate = async () => {
      try {
        const response = await apiClient.post('/api/v1/coupons/validate', {
          code: appliedCoupon.code,
          target_type: 'PACKAGE',
          target_id: packageId,
          booking_amount: prices.rawSubtotal,
          ticket_count: totalPassengers,
          travel_date: selectedDate ? selectedDate : null
        });

        if (!isMounted) return;

        if (response.data.valid) {
          setAppliedCoupon({
            code: appliedCoupon.code,
            discount_amount: response.data.discount_amount,
            discounted_subtotal: response.data.discounted_subtotal
          });
        } else {
          setAppliedCoupon(null);
          setCouponCode('');
          setCouponError(response.data.reason || "Coupon no longer applies");
          setCouponSuccess(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError("Coupon no longer applies");
        setCouponSuccess(null);
      }
    };

    // Only revalidate if we have a valid selection context
    if (prices.rawSubtotal > 0) {
      revalidate();
    } else {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError("Coupon removed (invalid amount)");
      setCouponSuccess(null);
    }

    return () => { isMounted = false; };
  }, [prices.rawSubtotal, packageId, selectedDate, selectedVariantId, adults, children]); // Depend on primary changing factors

  const applyCouponByCode = async (codeToApply: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    const trimmedCode = codeToApply.trim().toUpperCase();
    setCouponCode(trimmedCode);

    if (!trimmedCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (prices.rawSubtotal <= 0) {
      setCouponError("Please select passengers and dates first to activate coupon");
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await apiClient.post('/api/v1/coupons/validate', {
        code: trimmedCode,
        target_type: 'PACKAGE',
        target_id: packageId,
        booking_amount: prices.rawSubtotal,
        ticket_count: totalPassengers,
        travel_date: selectedDate ? selectedDate : null
      });

      if (response.data.valid) {
        setAppliedCoupon({
          code: trimmedCode,
          discount_amount: response.data.discount_amount,
          discounted_subtotal: response.data.discounted_subtotal
        });
        setCouponSuccess("Coupon applied successfully");
      } else {
        setCouponError(response.data.reason || "Invalid coupon code");
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.detail || "Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = async () => {
    await applyCouponByCode(couponCode);
  };

  useEffect(() => {
    const handleAutoApplyEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const code = customEvent.detail?.code;
      if (code) {
        const trimmedCode = code.trim().toUpperCase();
        setCouponCode(trimmedCode);
        if (prices.rawSubtotal > 0) {
          applyCouponByCode(trimmedCode);
        } else {
          setPendingCouponCode(trimmedCode);
          setCouponSuccess("Coupon code filled! Select dates & passengers to apply.");
          setCouponError(null);
        }
      }
    };

    window.addEventListener('apply-coupon', handleAutoApplyEvent);
    
    // Check localStorage in case the user copied a coupon before this component mounted (e.g. Mobile Bottom Sheet)
    const storedCoupon = localStorage.getItem('pending_coupon');
    if (storedCoupon) {
      const trimmedCode = storedCoupon.trim().toUpperCase();
      setCouponCode(trimmedCode);
      setPendingCouponCode(trimmedCode);
      setCouponSuccess("Coupon code filled! Select dates & passengers to apply.");
      localStorage.removeItem('pending_coupon');
    }

    return () => {
      window.removeEventListener('apply-coupon', handleAutoApplyEvent);
    };
  }, [prices.rawSubtotal, packageId]);

  // Auto-apply the pending coupon code as soon as a valid price/subtotal is established
  useEffect(() => {
    if (pendingCouponCode && prices.rawSubtotal > 0) {
      applyCouponByCode(pendingCouponCode);
      setPendingCouponCode(null);
    }
  }, [prices.rawSubtotal, pendingCouponCode]);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setPendingCouponCode(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Build the transport_selections array for the checkout payload
  const buildTransportSelections = () => {
    if (!hasTransport) return [];
    if (selectedTransportMode === 'SHARED' && selectedSharedOptionId) {
      return [{ option_id: selectedSharedOptionId, quantity: 1 }];
    }
    if (selectedTransportMode === 'SEPARATE') {
      return Object.entries(separateVehicleQtys)
        .filter(([, qty]) => qty > 0)
        .map(([optIdStr, qty]) => ({ option_id: Number(optIdStr), quantity: qty }));
    }
    return [];
  };

  // Validate that selected separate vehicles have enough capacity
  const transportAvailMap = useMemo(() => {
    if (!displaySlot?.transport_availability) return {};
    return displaySlot.transport_availability.reduce((acc, curr) => {
      acc[curr.option_id] = curr;
      return acc;
    }, {} as Record<number, any>);
  }, [displaySlot]);

  const sharedCapacityOk = useMemo(() => {
    if (selectedTransportMode !== 'SHARED' || !selectedSharedOptionId) return true;
    const opt = sharedOptions.find(o => o.id === selectedSharedOptionId);
    const optAvail = transportAvailMap[selectedSharedOptionId];
    if (optAvail ? optAvail.is_closed : false) return false;
    const totalPax = totalPassengers;
    const remaining = optAvail ? optAvail.remaining : (opt?.capacity ?? 99);
    return remaining >= totalPax;
  }, [selectedTransportMode, selectedSharedOptionId, sharedOptions, totalPassengers, transportAvailMap]);

  const separateCapacityOk = useMemo(() => {
    if (selectedTransportMode !== 'SEPARATE') return true;
    const totalPax = totalPassengers;
    const totalCapacity = separateOptions.reduce((sum, opt) => {
      const qty = separateVehicleQtys[opt.id] || 0;
      return sum + qty * (positiveNumber(opt.capacity) || 1);
    }, 0);
    const hasAnyVehicle = Object.values(separateVehicleQtys).some(q => q > 0);
    if (!hasAnyVehicle) return true; // Handled as validation later

    for (const opt of separateOptions) {
      const qty = separateVehicleQtys[opt.id] || 0;
      if (qty > 0) {
        const avail = transportAvailMap[opt.id];
        const isClosed = avail ? avail.is_closed : false;
        const remaining = avail ? avail.remaining : 5;
        if (isClosed || remaining < qty) return false;
      }
    }

    return totalCapacity >= totalPax;
  }, [selectedTransportMode, separateVehicleQtys, separateOptions, totalPassengers, transportAvailMap]);

  const hasTransportSelection = useMemo(() => {
    if (!hasTransport || transportOptions.length === 0) return true;
    if (selectedTransportMode === 'SHARED') {
      return selectedSharedOptionId !== null;
    }
    if (selectedTransportMode === 'SEPARATE') {
      const totalVehicles = Object.values(separateVehicleQtys).reduce((a, b) => a + b, 0);
      return totalVehicles > 0;
    }
    return false;
  }, [hasTransport, transportOptions, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys]);

  const isSuspended = user?.account_status === 'BLOCKED' || user?.account_status === 'DISABLED';

  // Absolute validation rules that apply to EVERYONE (including Admins - because a vehicle cannot physically hold more than its capacity)
  const isCapacityInvalid = !separateCapacityOk || !sharedCapacityOk;
  const isSelectionIncomplete =
    validVariants.length === 0 ||
    !selectedDate ||
    !hasPassengerSelection ||
    !hasTransportSelection ||
    (isAccommodationMode && roomCartTotalGuests === 0) ||
    (!isAccommodationMode && !activeVariantId);

  const isBookingDisabled =
    isSuspended ||
    !isAuthenticated ||
    (!isAdmin && isPackageInactive) ||
    isSelectionIncomplete ||
    isCapacityInvalid ||
    (!isAdmin && availabilityState.kind !== 'open');

  // The button MUST be disabled if capacity is invalid, selection is incomplete, processing, suspended, or inactive
  const isButtonDisabled =
    !isActive ||
    isProcessingCheckout ||
    isCapacityInvalid ||
    isSelectionIncomplete ||
    isSuspended ||
    (!isAdmin && isPackageInactive) ||
    (!isAdmin && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out')) ||
    (isAuthenticated && isBookingDisabled);

  const ctaText = useMemo(() => {
    if (isProcessingCheckout) return 'Processing...';
    if (isSuspended) return 'Booking Suspended';
    if (!isActive) return 'Bookings Suspended';
    if (isPackageInactive && !isAdmin) return 'Bookings Closed / Inactive';
    if (validVariants.length === 0) return 'Fare updating';
    if (isAccommodationMode) {
      if (roomCartTotalGuests === 0) return 'Select packages & guests';
    } else {
      if (!selectedVariantId) return 'Select a package type';
    }
    if (!isAuthenticated) return 'Login to Book';
    if (!hasPassengerSelection) return isStudentPackage ? 'Select students' : 'Select passengers';
    if (!selectedDate) return 'Select a date';
    if (!separateCapacityOk) return '⚠ Not enough vehicles/capacity';
    if (!sharedCapacityOk) return '⚠ Not enough transport seats';
    if (hasTransport && transportOptions.length > 0 && !hasTransportSelection) {
      if (selectedTransportMode === 'SEPARATE') return '⚠ Select at least 1 vehicle';
      return '⚠ Select a transport option';
    }
    if (isAdmin) return 'Book Now (Admin)';
    if (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out') return 'Unavailable';
    if (availabilityState.kind === 'open') return 'Book Now';
    return 'Call to confirm availability';
  }, [isProcessingCheckout, isSuspended, isActive, isPackageInactive, isAdmin, validVariants.length, isAccommodationMode, roomCartTotalGuests, selectedVariantId, isAuthenticated, hasPassengerSelection, isStudentPackage, selectedDate, separateCapacityOk, sharedCapacityOk, hasTransport, transportOptions.length, hasTransportSelection, selectedTransportMode, availabilityState.kind]);

  // Strict Real-Time Locking: Force-close CheckoutPassengerModal
  useEffect(() => {
    if ((isButtonDisabled || isBookingDisabled || isCapacityInvalid) && showPassengerModal) {
      setShowPassengerModal(false);
      toast.error('Booking is not available: vehicle capacity is insufficient for the selected passengers.', { duration: 5000 });
    }
  }, [isButtonDisabled, isBookingDisabled, isCapacityInvalid, showPassengerModal]);

  // Strict Real-Time Locking: Clear invalid selections instantly
  useEffect(() => {
    if (isAdmin) return; // Admins bypass auto-clearing selected invalid dates!
    // Only auto-clear if we ACTUALLY had a selected date and it just became invalid
    if (selectedDate && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out')) {
      setSelectedDate('');
      toast.error(availabilityState.message || 'Selected date is no longer available.', { duration: 5000 });
    }
  }, [selectedDate, availabilityState.kind, availabilityState.message, isAdmin]);

  const handleBookingClick = (e: React.MouseEvent) => {
    if (isButtonDisabled) {
      e.preventDefault();
      if (!separateCapacityOk) {
        toast.error('The selected vehicles do not have enough capacity for all passengers. Please add more vehicles.');
      } else if (!sharedCapacityOk) {
        toast.error('Not enough transport seats available for all passengers.');
      } else if (!hasTransportSelection) {
        toast.error('Please select a valid transport option.');
      }
      return;
    }
    if ((isPackageInactive && !isAdmin) || !isActive) return;
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginPrompt(true);
      return;
    }
    if (isBookingDisabled) {
      e.preventDefault();
      return;
    }

    if (isAccommodationMode) {
      if (roomCartTotalGuests <= 0) {
        toast.error('Please add at least one package option first.');
        return;
      }
      const dateSlots = publicAvailability?.dates?.filter(d => d.date === selectedDate && d.status === 'OPEN') || [];
      const maxAvailable = dateSlots.length > 0 ? Math.max(...dateSlots.map(s => Number(s.available_seats || 0))) : 0;
      if (maxAvailable > 0 && totalPassengers > maxAvailable) {
        toast.error(`Requested ${totalPassengers} seats, but only ${maxAvailable} seats are available for this date.`);
        return;
      }
    } else {
      if (Boolean(selectedDate) && selectedSlot?.status === 'OPEN') {
        const maxAvailable = Number(selectedSlot.available_seats || 0);
        if (maxAvailable > 0 && totalPassengers > maxAvailable) {
          toast.error(`Requested ${totalPassengers} passengers, but only ${maxAvailable} seats are available.`);
          return;
        }
      }
    }
    
    // Trigger Google Ads conversion event
    reportBookNowConversion();

    if (is25SeaterSelected) {
      setShowBusWarningModal(true);
    } else {
      setShowPassengerModal(true);
    }
  };

  const buildRoomSelections = () => {
    if (!isAccommodationMode) return undefined;
    const selections: Array<{ variant_id: number; quantity: number; adults: number; children: number }> = [];
    Object.entries(roomConfigs).forEach(([varIdStr, configs]) => {
      const varId = Number(varIdStr);
      const qty = roomCart[varId] || 0;
      if (qty > 0) {
        configs.slice(0, qty).forEach(c => {
          selections.push({
            variant_id: varId,
            quantity: 1,
            adults: c.adults,
            children: c.children,
          });
        });
      }
    });
    return selections.length > 0 ? selections : undefined;
  };

  const handleCheckoutSubmit = async (passengers: any[], quickBooking: boolean = false, customerEmail?: string) => {
    if (isCapacityInvalid || isButtonDisabled) {
      if (!separateCapacityOk) {
        toast.error('The selected vehicles do not have enough capacity for all passengers. Please add more vehicles.');
      } else if (!sharedCapacityOk) {
        toast.error('Not enough transport seats available for all passengers.');
      } else {
        toast.error('Booking cannot proceed with the current selection.');
      }
      return;
    }
    setIsProcessingCheckout(true);
    try {
      if (selectedDate && publicAvailability) {
        const dateSlots = publicAvailability.dates?.filter(d => d.date === selectedDate && d.status === 'OPEN') || [];
        const maxAvailable = dateSlots.length > 0 ? Math.max(...dateSlots.map(s => Number(s.available_seats || 0))) : 0;
        if (maxAvailable > 0 && totalPassengers > maxAvailable) {
          toast.error(`Insufficient inventory. Requested ${totalPassengers} seats, but only ${maxAvailable} available.`);
          setIsProcessingCheckout(false);
          return;
        }
      }

      const effectiveVariantId = isAccommodationMode
        ? (primaryRoomVariant?.id || selectedVariantId || validVariants[0]?.id)
        : selectedVariantId;

      if (isAdmin) {
        const adminPayload: any = {
          target_type: 'package',
          travel_date: selectedDate,
          quantity: totalPassengers,
          adult_count: isStudentPackage ? 0 : passengerAdults,
          child_count: isStudentPackage ? 0 : passengerChildren,
          student_count: isStudentPackage ? passengerAdults : 0,
          variant_id: effectiveVariantId,
          room_selections: buildRoomSelections(),
          transport_selections: buildTransportSelections(),
          include_refreshments: hasRefreshments ? includeRefreshments : false,
          passengers: passengers.map(p => ({
            ...p,
            aadhaar: p.aadhaar || undefined,
            phone: p.phone || undefined,
          })),
          amount_paid: customPayAmount !== '' ? Number(customPayAmount) : undefined,
          quick_booking: quickBooking,
          customer_email: customerEmail,
        };
        const res = await apiClient.post('/api/v1/admin/bookings/create', adminPayload);
        toast.success(`Booking ${res.data.public_id} created successfully!`);
        router.push(`/admin/bookings?new_booking=${res.data.public_id}`);
        return;
      }

      const payload: any = {
        target_type: 'package',
        travel_date: selectedDate,
        quantity: totalPassengers,
        variant_id: effectiveVariantId,
        room_selections: buildRoomSelections(),
        transport_selections: buildTransportSelections(),
        include_refreshments: hasRefreshments ? includeRefreshments : false,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        adult_count: isStudentPackage ? 0 : passengerAdults,
        child_count: isStudentPackage ? 0 : passengerChildren,
        student_count: isStudentPackage ? passengerAdults : 0,
        passengers: passengers.map((p: any) => ({
          ...p,
          aadhaar: p.aadhaar || undefined,
          phone: p.phone || undefined,
        })),
        payment_percentage: (() => {
          if (!customPayAmount) return 100;
          const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
          const minPay = Math.ceil(finalTotal * 0.35);
          const parsed = parseInt(customPayAmount, 10);
          if (isNaN(parsed) || parsed >= finalTotal) return 100;
          const clamped = Math.max(minPay, parsed);
          return parseFloat(((clamped / finalTotal) * 100).toFixed(4));
        })(),
        expected_amount: isAgent ? prices.agentPayable : prices.grandTotal,
        quick_booking: quickBooking,
        customer_email: customerEmail,
        gateway: selectedGateway,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_checkout_source', window.location.pathname + window.location.search);
        sessionStorage.setItem('last_checkout_passengers', JSON.stringify(passengers));
        sessionStorage.setItem('last_checkout_email', customerEmail || '');
        sessionStorage.setItem('last_checkout_custom_pay', customPayAmount || '');
        sessionStorage.setItem('last_checkout_gateway', selectedGateway);
        sessionStorage.setItem('last_checkout_quick_booking', String(quickBooking));
        sessionStorage.setItem('last_checkout_selected_date', selectedDate || '');
        sessionStorage.setItem('last_checkout_selected_variant_id', String(effectiveVariantId || ''));
        sessionStorage.setItem('last_checkout_selected_transport_mode', selectedTransportMode);
        sessionStorage.setItem('last_checkout_selected_shared_option_id', String(selectedSharedOptionId || ''));
        sessionStorage.setItem('last_checkout_separate_vehicle_qtys', JSON.stringify(separateVehicleQtys));
        sessionStorage.setItem('last_checkout_include_refreshments', String(includeRefreshments));
        sessionStorage.setItem('last_checkout_adults', String(passengerAdults));
        sessionStorage.setItem('last_checkout_children', String(passengerChildren));
        if (isAccommodationMode) {
          sessionStorage.setItem('last_checkout_room_cart', JSON.stringify(roomCart));
          sessionStorage.setItem('last_checkout_room_configs', JSON.stringify(roomConfigs));
        }
      }

      const res = await apiClient.post('/api/v1/bookings/checkout', payload);
      const { checkout_data } = res.data;

      if (!checkout_data) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        setIsProcessingCheckout(false);
        return;
      }

      if (checkout_data.gateway === 'CASHFREE') {
        // Cashfree Popup Flow
        if (!checkout_data.payment_session_id) {
          toast.error("Cashfree session creation failed. Please try again.");
          setIsProcessingCheckout(false);
          return;
        }
        toast.success("Opening Cashfree secure checkout...");
        // Dynamically load Cashfree JS SDK
        const loadCashfreeSDK = () => new Promise<void>((resolve, reject) => {
          if ((window as any).Cashfree) { resolve(); return; }
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.head.appendChild(script);
        });
        await loadCashfreeSDK();
        const cfMode = (checkout_data.mode === 'production' || checkout_data.mode === 'sandbox')
          ? checkout_data.mode
          : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'sandbox' : 'production');
        console.log("[Cashfree Package Checkout] Initialized with cfMode:", cfMode, "checkout_data:", checkout_data);
        const cashfree = (window as any).Cashfree({ mode: cfMode });
        cashfree.checkout({
          paymentSessionId: checkout_data.payment_session_id,
          redirectTarget: "_self"
        }).then((result: any) => {
          if (result && result.error) {
            console.warn("Cashfree checkout closed/failed:", result.error);
            toast.error(result.error.message || "Payment closed or failed.");
            setIsProcessingCheckout(false);
          }
        }).catch((err: any) => {
          console.error("Cashfree checkout error:", err);
          setIsProcessingCheckout(false);
        });
      } else {
        // PhonePe Redirect Flow
        if (!checkout_data.redirect_url) {
          toast.error("Failed to initialize PhonePe gateway. Please try again.");
          setIsProcessingCheckout(false);
          return;
        }
        toast.success("Redirecting to secure PhonePe checkout...");
        setTimeout(() => {
          window.location.href = checkout_data.redirect_url;
        }, 1000);
      }
    } catch (err: any) {
      console.warn("Checkout failed:", err?.message || err);
      let errMsg = "Checkout failed. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((d: any) => `${d.loc?.join('.')} - ${d.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
      setIsProcessingCheckout(false);
    }
  };

  // Render calendar days
  const renderCalendar = () => {
    if (publicLoading && !isAdmin) {
      return (
        <div className="p-8 w-full flex flex-col items-center justify-center min-h-[280px]">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-md bg-[#1a6b7a]/20 animate-pulse"></div>
            <Loader2 className="h-8 w-8 animate-spin text-[#1a6b7a] relative z-10" />
          </div>
          <p className="mt-4 text-[10px] font-black text-[#1a6b7a] uppercase tracking-widest">Checking Seats...</p>
        </div>
      );
    }

    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Empty cells before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(calYear, calMonth, i);
      const dateStr = toYYYYMMDD(d);
      const isPastDate = dateStr < todayDateStr;
      const isTodayAfterCutoff = dateStr === todayDateStr && isAfterCutoff;
      const isPast = isPastDate || isTodayAfterCutoff;
      const isSelected = dateStr === selectedDate;

      // Check availability if we have it for this month
      let dayStatus = 'none'; // none, available, soldout
      let isDisabled = isPast || !isActive;

      if (publicAvailability && publicAvailability.month === currentMonthStr) {
        let slot = null;
        if (isAccommodationMode) {
          const allowedVariantIds = validVariants.map(v => v.id);

          slot = publicAvailability.dates.find(
            d => {
              if (d.date !== dateStr || !allowedVariantIds.includes(d.variant_id) || d.status !== 'OPEN') return false;
              const variant = validVariants.find(item => item.id === d.variant_id);
              const occupancy = Math.max(1, Number(variant?.occupancy || 1));
              return Number(d.available_seats || 0) >= occupancy;
            }
          );
        } else {
          slot = publicAvailability.dates.find(d => d.date === dateStr && d.variant_id === activeVariantId);
        }

        // Fallback: If not matched yet, check if there is ANY open slot on this date
        if (!slot) {
          const openSlot = publicAvailability.dates.find(
            d => d.date === dateStr && d.status === 'OPEN' && Number(d.available_seats || 0) > 0
          );
          if (openSlot) {
            slot = openSlot;
          }
        }

        if (slot) {
          if (slot.status === 'CLOSED' || slot.status === 'SOLD_OUT' || slot.status === 'NO_INVENTORY' || Number(slot.available_seats || 0) <= 0) {
            dayStatus = 'soldout';
            isDisabled = true;
          } else {
            dayStatus = 'available';
            if (isTodayAfterCutoff) {
              isDisabled = false; // Admin manually opened / kept open today's package
            }
          }
        } else {
          // If a date has no slot record generated/published, it cannot be booked
          dayStatus = 'soldout';
          isDisabled = true;
        }
      } else {
        // If availability is still loading or could not be loaded (e.g. package is inactive), disable all dates
        isDisabled = true;
      }

      days.push(
        <button
          key={i}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDaySelect(i)}
          className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
            ${isDisabled
              ? 'text-slate-300 cursor-not-allowed line-through bg-slate-50/30'
              : 'hover:bg-slate-100 text-slate-700 cursor-pointer hover:scale-105'
            }
            ${isSelected
              ? 'bg-[#1a6b7a] text-white hover:bg-[#155662] font-black shadow-md shadow-[#1a6b7a]/25 scale-105'
              : ''
            }
            ${!isSelected && dayStatus === 'available'
              ? 'font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 hover:scale-105 border border-emerald-100'
              : ''
            }
          `}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="p-4 w-full">
        <div className="flex justify-between items-center mb-4 px-1">
          <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><ChevronLeft className="h-4.5 w-4.5" /></button>
          <div className="font-extrabold text-xs text-[#0f3d56] uppercase tracking-wider">{monthNames[calMonth]} {calYear}</div>
          <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><ChevronRight className="h-4.5 w-4.5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center mb-2 justify-items-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-bold text-slate-400 w-9 py-1 flex items-center justify-center uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 justify-items-center">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div id="booking" className="w-full my-2 lg:sticky lg:top-[140px] pb-24 lg:pb-0">
      <div className="lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200 bg-transparent lg:bg-white lg:shadow-[0_45px_120px_rgba(15,61,86,0.13)] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

        {/* Header */}
        <div className="hidden lg:block bg-[#0f3d56] px-5 py-4 text-white lg:rounded-t-2xl relative overflow-hidden">
          <h2 className="text-base font-black tracking-wide">Book this package</h2>
          <div className="mt-1 text-sm font-bold tracking-tight text-white/75">
            {hasPassengerSelection && selectedDate
              ? 'Price shown for your selected passengers'
              : 'Choose package type, date and passengers'}

            {/* Price Override Badge */}
            {(() => {
              if (!hasPassengerSelection || !selectedDate) return null;
              if (isStudentPackage) {
                if (!selectedDate || !selectedSlot || !selectedVariant || Number(selectedVariant.student_price) === 0) return null;
                
                const pureStudent = Number(selectedVariant.student_price);
                const wStudent = Number(selectedVariant.weekend_student_price) || pureStudent;
                const effStudent = prices.baseStudent;
                const isWeekend = isWeekendSelected;
                const expectedStudent = isWeekend ? wStudent : pureStudent;
                
                if (effStudent === pureStudent && !isWeekend) return null;
                if (effStudent === pureStudent && isWeekend && wStudent === pureStudent) return null;
                
                const badges = [];
                
                if (isWeekend && wStudent > pureStudent) {
                  badges.push(
                    <span key="weekend" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      Weekend Surge +₹{formatINR(wStudent - pureStudent)}
                    </span>
                  );
                }
                
                if (effStudent > expectedStudent) {
                  badges.push(
                    <span key="demand" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 bg-rose-500/20 text-rose-200 border border-rose-500/30">
                      High Demand +₹{formatINR(effStudent - expectedStudent)}
                    </span>
                  );
                }
                
                if (effStudent < expectedStudent) {
                  badges.push(
                    <span key="discount" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                      Discount -₹{formatINR(expectedStudent - effStudent)}
                    </span>
                  );
                }
                
                return <>{badges}</>;
              } else {
                if (!selectedDate || !selectedSlot || !selectedVariant || Number(selectedVariant.adult_price) === 0) return null;
                
                const pureAdult = Number(selectedVariant.adult_price);
                const wAdult = Number(selectedVariant.weekend_adult_price) || pureAdult;
                const effAdult = prices.baseAdult;
                const isWeekend = isWeekendSelected;
                const expectedAdult = isWeekend ? wAdult : pureAdult;
                
                if (effAdult === pureAdult && !isWeekend) return null;
                if (effAdult === pureAdult && isWeekend && wAdult === pureAdult) return null;
                
                const badges = [];
                
                if (isWeekend && wAdult > pureAdult) {
                  badges.push(
                    <span key="weekend" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      Weekend Surge +₹{formatINR(wAdult - pureAdult)}
                    </span>
                  );
                }
                
                if (effAdult > expectedAdult) {
                  badges.push(
                    <span key="demand" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 bg-rose-500/20 text-rose-200 border border-rose-500/30">
                      High Demand +₹{formatINR(effAdult - expectedAdult)}
                    </span>
                  );
                }
                
                if (effAdult < expectedAdult) {
                  badges.push(
                    <span key="discount" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                      Discount -₹{formatINR(expectedAdult - effAdult)}
                    </span>
                  );
                }
                
                return <>{badges}</>;
              }
            })()}
          </div>
        </div>

        <div className="relative space-y-3 p-0 lg:p-5 lg:pr-6 lg:pb-5">

          {/* Active Booking Inactive Warning Banner */}
          {(isPackageInactive || !isActive) && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs text-rose-600 font-bold flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-black">{!isActive ? 'Bookings Suspended' : 'Online Bookings Suspended'}</p>
                <p className="text-slate-500 font-bold text-[11px] mt-0.5 leading-relaxed">
                  This tour experience is currently closed or inactive. You cannot configure tickets or submit new online bookings.
                </p>
              </div>
            </div>
          )}
          {/* Inputs Section */}
          {isAccommodationMode ? (
            /* Accommodation package mode: travel date and package selection */
            <div className="space-y-3">
              {/* Custom Date Picker */}
              <div className="relative" ref={dateMenuRef}>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">Travel date</label>
                <button
                  type="button"
                  disabled={(!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0}
                  onClick={() => { setDateMenuOpen(!dateMenuOpen); }}
                  className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
                    (!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0
                      ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : dateMenuOpen
                      ? 'border-[#1a6b7a] bg-white ring-2 ring-[#1a6b7a]/15 shadow-md shadow-[#1a6b7a]/5 text-slate-900 font-extrabold'
                      : 'border-slate-200 bg-white hover:border-[#1a6b7a]/50 text-slate-800'
                  }`}
                >
                  <span className="truncate">{selectedDate ? formatIndianDate(selectedDate, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select travel date'}</span>
                  <CalendarDays className="h-4 w-4 text-slate-500 shrink-0 transition-colors" />
                </button>

                {dateMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-100 bg-white shadow-xl w-[calc(100vw-32px)] sm:w-[330px] origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                    {renderCalendar()}
                  </div>
                )}
              </div>

              {/* Live Availability Status */}
              {(selectedDate || (!selectedDate && tomorrowSlot)) && (
                <div className="text-xs">
                  {availabilityState.kind === 'loading' ? (
                    <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> {availabilityState.message}</div>
                  ) : availabilityState.kind === 'closed' ? (
                    <div className="flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /> {availabilityState.message}</div>
                  ) : availabilityState.kind === 'sold_out' ? (
                    <div className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> {availabilityState.message}</div>
                  ) : availabilityState.kind === 'open' ? (
                    <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {availabilityState.message}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500"><Info className="h-4 w-4" /> {availabilityState.message}</div>
                  )}
                </div>
              )}

              {/* Accommodation package mode: category and package options */}
              <div className="space-y-3 pt-1">
                {/* 1. Category Section (Dropdown if >1 category, prominent category banner if 1 category) */}
                {uniqueCategories.length > 1 ? (
                  <div className="relative" ref={categoryMenuRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Ship className="h-3.5 w-3.5 text-[#1a6b7a]" />
                        1. Select Category
                      </label>
                      {selectedCategoryFilter && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedDate) {
                              setCategoryDropdownOpen(false);
                              setDateMenuOpen(true);
                              toast.info('Please choose a travel date first.');
                              return;
                            }
                            setSelectedCategoryFilter('');
                            setCategoryDropdownOpen(true);
                          }}
                          className="text-[10px] font-bold text-[#1a6b7a] hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={(!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0}
                      onClick={() => {
                        if (!selectedDate) {
                          setDateMenuOpen(true);
                          toast.info('Please choose a travel date first.');
                          return;
                        }
                        setCategoryDropdownOpen(!categoryDropdownOpen);
                      }}
                      className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
                        (!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0
                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                          : categoryDropdownOpen
                          ? 'border-[#1a6b7a] bg-white ring-2 ring-[#1a6b7a]/15 shadow-md shadow-[#1a6b7a]/5 text-slate-900 font-extrabold'
                          : selectedCategoryFilter
                          ? 'border-[#1a6b7a]/40 bg-[#f7fbfb] text-[#0f3d56] font-extrabold'
                          : 'border-slate-200 bg-white hover:border-[#1a6b7a]/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">
                          {selectedCategoryFilter || 'Choose a package category...'}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-[#1a6b7a]' : ''}`} />
                    </button>

                    {categoryDropdownOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-1.5 space-y-1">
                          {openAccommodationCategories.map(cat => {
                            const isSelected = selectedCategoryFilter === cat;
                            const optionsCount = openAccommodationVariants.filter(v => cleanCategoryTitle(v.title, (v as any).category_title) === cat).length;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  if (selectedCategoryFilter !== cat) {
                                    setSelectedCategoryFilter(cat);
                                    const hasOtherRooms = validVariants.some(
                                      v => (roomCart[v.id] || 0) > 0 && cleanCategoryTitle(v.title, (v as any).category_title) !== cat
                                    );
                                    if (hasOtherRooms) {
                                      setRoomCart({});
                                      setRoomConfigs({});
                                    }
                                  }
                                  setCategoryDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1a6b7a] text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <PackageIcon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-[#1a6b7a]'}`} />
                                  <span className="font-extrabold">{cat}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {optionsCount} {optionsCount === 1 ? 'Package' : 'Packages'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : uniqueCategories.length === 1 ? (
                  <div className="rounded-2xl border border-[#1a6b7a]/30 bg-gradient-to-r from-sky-50/90 via-[#f0f9fa] to-emerald-50/70 p-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a6b7a] text-white shrink-0 shadow-xs">
                          <Ship className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-[#1a6b7a]">Package Category</span>
                          <span className="block text-xs sm:text-sm font-black text-slate-900 truncate">
                            {uniqueCategories[0]}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        <Check className="h-3 w-3 text-emerald-600" />
                        Accommodation Stay
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* 2. Package Options Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#1a6b7a] flex items-center gap-1.5 truncate">
                      <PackageIcon className="h-4 w-4 text-[#1a6b7a] shrink-0" />
                      <span className="truncate">
                        {uniqueCategories.length > 1
                          ? (selectedCategoryFilter ? `Available Options for ${selectedCategoryFilter}` : 'Available Package Options')
                          : `Available Options for ${uniqueCategories[0] || 'This Package'}`}
                      </span>
                    </label>
                    {roomCartTotalGuests > 0 && (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="h-3 w-3 text-emerald-600" />
                        {roomCartTotalGuests} Guests ({roomCartTotalRooms} {roomCartTotalRooms === 1 ? 'Package' : 'Packages'})
                      </span>
                    )}
                  </div>

                  {!selectedDate ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
                      <PackageIcon className="mx-auto mb-2 h-8 w-8 text-[#1a6b7a]" />
                      <p className="text-xs font-extrabold text-slate-800">Choose a travel date first</p>
                      <button
                        type="button"
                        onClick={() => setDateMenuOpen(true)}
                        className="mt-2 text-[11px] font-black text-[#1a6b7a] underline underline-offset-2"
                      >
                        Select travel date
                      </button>
                    </div>
                  ) : !isAdmin && (publicLoading || !publicAvailability || publicAvailability.month !== selectedDate.slice(0, 7)) ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Checking packages for this date…
                    </div>
                  ) : openAccommodationVariants.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs font-bold text-amber-800">
                      No packages are available for this date. Choose another date.
                    </div>
                  ) : uniqueCategories.length > 1 && !selectedCategoryFilter ? (
                    <div
                      className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center cursor-pointer hover:border-[#1a6b7a]/40 hover:bg-slate-50 transition-all"
                    >
                      <div className="h-10 w-10 rounded-full bg-[#1a6b7a]/10 text-[#1a6b7a] flex items-center justify-center mx-auto mb-2">
                        <PackageIcon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-extrabold text-slate-800">Please select a category above</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] mx-auto">
                        Choose a package category to view the available package options.
                      </p>
                    </div>
                  ) : dateFilteredRoomVariants.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs font-bold text-amber-800">
                      No packages in this category are available for this date. Change category or choose another date.
                    </div>
                  ) : (
                    /* Display package cards for chosen category */
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                      {dateFilteredRoomVariants.map((variant) => {
                        const qty = roomCart[variant.id] || 0;
                        const occ = Math.max(1, Number(variant.occupancy || 1));
                        const currentVarSlot = selectedDate && publicAvailability
                          ? publicAvailability.dates.find(d => d.date === selectedDate && d.variant_id === variant.id)
                          : null;
                        const varAvailableSeats = Number(currentVarSlot?.available_seats || 0);
                        const isVarUnavailable = Boolean(selectedDate) && (
                          !currentVarSlot ||
                          currentVarSlot.status === 'CLOSED' ||
                          currentVarSlot.status === 'SOLD_OUT' ||
                          currentVarSlot.status === 'NO_INVENTORY' ||
                          varAvailableSeats <= 0
                        );
                        const remainingSeatsForDate = Boolean(selectedDate) && currentVarSlot?.status === 'OPEN'
                          ? Math.max(0, varAvailableSeats - roomCartTotalGuests)
                          : 0;
                        const isVarCapacityExceeded = !selectedDate || isVarUnavailable || (remainingSeatsForDate < occ);
                        const roomAvailabilityMessage = !selectedDate
                          ? 'Select travel date first'
                          : !currentVarSlot || currentVarSlot.status === 'NO_INVENTORY'
                          ? 'Unavailable for this date'
                            : currentVarSlot.status === 'CLOSED'
                              ? 'This package option is closed for this date'
                              : currentVarSlot.status === 'SOLD_OUT' || varAvailableSeats <= 0
                                ? 'Sold out for this date'
                                : remainingSeatsForDate < occ
                                    ? (remainingSeatsForDate <= 0
                                        ? 'No seats remaining on this date'
                                        : `Only ${remainingSeatsForDate} seat${remainingSeatsForDate === 1 ? '' : 's'} left; ${occ} needed`)
                                  : null;
                        const effPrice = isSpecialUser 
                          ? 1 
                          : (isWeekendSelected && variant.weekend_adult_price ? Number(variant.weekend_adult_price) : Number(variant.adult_price || 0));
                        const roomTotal = effPrice * occ;
                        const isSelected = qty > 0;
                        const bedTitle = getBedLabel(variant.title, occ);

                        return (
                          <div
                            key={variant.id}
                            className={`rounded-2xl border p-3 transition-all duration-200 ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20'
                                : 'border-slate-200 bg-white hover:border-[#1a6b7a]/40 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs text-slate-900 leading-tight">
                                    {bedTitle}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9.5px] font-black uppercase border border-sky-200">
                                    <Users className="h-3 w-3" />
                                    {occ} Members
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9.5px] font-black border border-emerald-200">
                                    {cleanCategoryTitle(variant.title, (variant as any).category_title)}
                                  </span>
                                  {selectedDate && isVarUnavailable && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[9.5px] font-black uppercase border border-rose-200">
                                      {!currentVarSlot || currentVarSlot.status === 'NO_INVENTORY' ? 'Unavailable' : currentVarSlot.status === 'CLOSED' ? 'Closed' : 'Sold Out'}
                                    </span>
                                  )}
                                  {selectedDate && !isVarUnavailable && roomAvailabilityMessage && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9.5px] font-black border border-amber-200">
                                      {roomAvailabilityMessage}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
                                  <span className="font-black text-[#1a6b7a]">
                                    ₹{effPrice.toLocaleString('en-IN')} <span className="text-[10px] font-medium text-slate-400">/ person</span>
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-bold text-slate-600 text-[11px]">
                                    ₹{roomTotal.toLocaleString('en-IN')} / package
                                  </span>
                                  {isWeekendSelected && variant.weekend_adult_price && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded border border-amber-200">
                                      Weekend
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Stepper +/- */}
                              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                                <button
                                  type="button"
                                  disabled={!isActive || (isPackageInactive && !isAdmin) || qty <= 0}
                                  onClick={() => updateRoomCart(variant.id, -1)}
                                  className={`h-8 w-8 rounded-lg font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                                    qty <= 0
                                      ? 'text-slate-300 cursor-not-allowed bg-transparent'
                                      : 'text-[#0f3d56] bg-white shadow-xs hover:bg-slate-50'
                                  }`}
                                >
                                  -
                                </button>
                                <div className="min-w-[44px] text-center">
                                  <span className="block text-xs font-black text-slate-900 leading-tight">
                                    {qty}
                                  </span>
                                  <span className="block text-[8.5px] font-bold text-slate-400 uppercase">
                                    {qty === 1 ? 'package' : 'packages'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  disabled={!isActive || (isPackageInactive && !isAdmin) || isVarCapacityExceeded}
                                  title={roomAvailabilityMessage || 'Add one package'}
                                  onClick={() => updateRoomCart(variant.id, 1)}
                                  className={`h-8 w-8 rounded-lg font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                                    isVarCapacityExceeded
                                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                      : 'text-white bg-[#0f3d56] hover:bg-[#1a4f6d] shadow-xs'
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="mt-2.5 pt-2.5 border-t border-emerald-200/60 space-y-2">
                                {(roomConfigs[variant.id] || []).slice(0, qty).map((comb, roomIdx) => {
                                  const validCombos = getValidCombinations(occ);
                                  const { effPrice: roomCombPrice } = getCombinationPrice(variant, comb, isWeekendSelected, isSpecialUser);
                                  return (
                                    <div key={roomIdx} className="bg-white/95 rounded-xl p-2.5 border border-emerald-200/80 shadow-2xs space-y-1.5">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                          <PackageIcon className="h-3.5 w-3.5 text-[#078a81]" />
                                          Package {getRoomNumber(variant.id, roomIdx)} · {bedTitle}
                                        </span>
                                        <span className="font-black text-[#0f3d56] text-xs">
                                          ₹{roomCombPrice.toLocaleString('en-IN')}
                                        </span>
                                      </div>

                                      <div className="relative select-none" data-room-dropdown>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            const key = `${variant.id}-${roomIdx}`;
                                            setOpenRoomDropdown(openRoomDropdown === key ? null : key);
                                          }}
                                          className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all outline-none cursor-pointer select-none touch-manipulation ${
                                            openRoomDropdown === `${variant.id}-${roomIdx}`
                                              ? 'border-[#1a6b7a] bg-white ring-2 ring-[#1a6b7a]/15 shadow-sm text-slate-900 font-extrabold'
                                              : 'border-slate-300 bg-white hover:border-[#1a6b7a]/60 shadow-2xs text-slate-800'
                                          }`}
                                        >
                                          <span className="flex items-center gap-2 truncate pointer-events-none">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-black uppercase tracking-wide border border-sky-200">
                                              {comb.adults}A {comb.children > 0 ? `+ ${comb.children}C` : ''}
                                            </span>
                                            <span className="truncate">
                                              {comb.children > 0
                                                ? `${comb.adults} ${comb.adults === 1 ? 'Adult' : 'Adults'} + ${comb.children} ${comb.children === 1 ? 'Child' : 'Children'}`
                                                : `${comb.adults} Adults`}
                                            </span>
                                          </span>
                                          <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                                            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${openRoomDropdown === `${variant.id}-${roomIdx}` ? 'rotate-180 text-[#1a6b7a]' : ''}`} />
                                          </div>
                                        </button>

                                        {openRoomDropdown === `${variant.id}-${roomIdx}` && (
                                          <div
                                            className="mt-1.5 overflow-hidden rounded-xl border-2 border-[#1a6b7a]/30 bg-white p-1.5 shadow-lg space-y-1 select-none z-30 animate-in fade-in slide-in-from-top-1 duration-150"
                                          >
                                            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between pointer-events-none">
                                              <span>Select Guest Combination</span>
                                              <span className="text-[9px] text-[#1a6b7a] font-bold">{occ} Members Total</span>
                                            </div>
                                            {validCombos.map((opt) => {
                                              const isOptSelected = opt.adults === comb.adults && opt.children === comb.children;
                                              const optPrice = getCombinationPrice(variant, opt, isWeekendSelected, isSpecialUser).effPrice;
                                              const optLabel = opt.children > 0
                                                ? `${opt.adults} ${opt.adults === 1 ? 'Adult' : 'Adults'} + ${opt.children} ${opt.children === 1 ? 'Child' : 'Children'}`
                                                : `${opt.adults} Adults`;
                                              return (
                                                <button
                                                  key={`${opt.adults}-${opt.children}`}
                                                  type="button"
                                                  onPointerDown={(e) => {
                                                    e.stopPropagation();
                                                  }}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    updateRoomConfig(variant.id, roomIdx, opt.adults, opt.children);
                                                    setOpenRoomDropdown(null);
                                                  }}
                                                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-all cursor-pointer select-none active:scale-[0.99] touch-manipulation ${
                                                    isOptSelected
                                                      ? 'bg-[#1a6b7a] text-white font-extrabold shadow-xs'
                                                      : 'text-slate-700 hover:bg-[#1a6b7a]/10 hover:text-[#0f3d56] active:bg-[#1a6b7a]/15 font-semibold bg-slate-50/70 border border-slate-200/50'
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-2 min-w-0 pointer-events-none">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black ${
                                                      isOptSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                                    }`}>
                                                      {opt.adults}A {opt.children > 0 ? `+ ${opt.children}C` : ''}
                                                    </span>
                                                    <span className="truncate">{optLabel}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0 pointer-events-none">
                                                    <span className={`font-black text-xs ${isOptSelected ? 'text-white' : 'text-[#0f3d56]'}`}>
                                                      ₹{optPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    {isOptSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                                                  </div>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                <div className="flex items-center justify-between text-[11px] pt-1">
                                  <span className="font-bold text-emerald-800">
                                    {qty} × {bedTitle} ({qty * occ} Guests)
                                  </span>
                                  <span className="font-black text-emerald-900 text-xs">
                                    ₹{((roomConfigs[variant.id] || []).slice(0, qty).reduce((sum, c) => sum + getCombinationPrice(variant, c, isWeekendSelected, isSpecialUser).effPrice, 0)).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            )}

                            {!isSelected && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2 flex-wrap">
                                <span className="flex items-center gap-1 font-semibold text-slate-500 text-[10.5px]">
                                  <Users className="h-3.5 w-3.5 text-[#1a6b7a] shrink-0" />
                                  <span>Allowed: {getValidCombinations(occ).map(opt =>
                                    opt.children > 0 ? `${opt.adults} Adult${opt.adults > 1 ? 's' : ''} + ${opt.children} Child${opt.children > 1 ? 'ren' : ''}` : `${opt.adults} Adults`
                                  ).join(' OR ')}</span>
                                </span>
                                <button
                                  type="button"
                                  disabled={!isActive || (isPackageInactive && !isAdmin) || isVarCapacityExceeded}
                                  title={roomAvailabilityMessage || 'Add one package and choose its guests'}
                                  onClick={() => updateRoomCart(variant.id, 1)}
                                  className={`text-[10px] font-black px-2.5 py-1 rounded-md border transition-colors ml-auto ${
                                    isVarCapacityExceeded
                                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                      : 'border-sky-200 bg-sky-50 text-[#0f3d56] hover:bg-sky-100 cursor-pointer'
                                  }`}
                                >
                                  {isVarCapacityExceeded ? roomAvailabilityMessage || 'Unavailable' : '+ Add & Choose Guests'}
                                </button>
                              </div>
                            )}



                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Active Selection Summary Bar */}
                  {roomCartTotalGuests > 0 && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-bold text-slate-700">Selected:</span>
                        {validVariants
                          .filter(v => (roomCart[v.id] || 0) > 0)
                          .map(v => {
                            const configs = (roomConfigs[v.id] || []).slice(0, roomCart[v.id] || 0);
                            return (
                              <span key={v.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                                {roomCart[v.id]} × {getBedLabel(v.title, v.occupancy || 1)}
                                {configs.length > 0 && (
                                  <span className="font-medium text-emerald-800">
                                    ({configs.map((config, index) => `Package ${index + 1}: ${config.adults}A${config.children > 0 ? `+${config.children}C` : ''}`).join(' · ')})
                                  </span>
                                )}


                              </span>
                            );
                          })}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setRoomCart({}); setRoomConfigs({}); }}
                        className="text-[10px] font-bold text-red-600 hover:text-red-700 shrink-0 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  )}

                  {/* Helpful guidance banner */}
                  <div className="rounded-xl bg-slate-100/80 p-2.5 text-center">
                    {roomCartTotalGuests > 0 ? (
                      <p className="text-xs font-bold text-slate-700">
                        Total: <span className="font-black text-[#0f3d56]">{roomCartTotalGuests} Guests</span> ({passengerAdults} {passengerAdults === 1 ? 'Adult' : 'Adults'}{passengerChildren > 0 ? `, ${passengerChildren} ${passengerChildren === 1 ? 'Child' : 'Children'}` : ''}) across {roomCartTotalRooms} package{roomCartTotalRooms === 1 ? '' : 's'}
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-slate-500">
                        Add packages and choose adult + child combinations to match your group.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD NON-ACCOMMODATION MODE: 2-Column Grid + Steppers */
            <>
              {/* Side-by-Side Inputs (Highly spacious under 420px Column Grid) */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                {/* Variant Select */}
                <div className="relative" ref={variantMenuRef}>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">Package Type</label>
                  <button
                    type="button"
                    disabled={(!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0}
                    onClick={() => { setVariantMenuOpen(!variantMenuOpen); setDateMenuOpen(false); }}
                    className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
                      (!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        : variantMenuOpen
                        ? 'border-[#1a6b7a] bg-white ring-2 ring-[#1a6b7a]/15 shadow-md shadow-[#1a6b7a]/5 text-slate-900 font-extrabold'
                        : 'border-slate-200 bg-white hover:border-[#1a6b7a]/50 text-slate-800'
                    }`}
                  >
                    <span className="min-w-0 truncate">{selectedVariant?.title || 'Select package type'}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${variantMenuOpen ? 'rotate-180 text-[#1a6b7a]' : ''}`} />
                  </button>

                  {variantMenuOpen && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl w-full min-w-[280px] origin-top-left animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col">
                      <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {validVariants.length ? validVariants.map((variant) => {
                          const selected = variant.id === selectedVariantId;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => {
                                setSelectedVariantId(variant.id);
                                setVariantMenuOpen(false);
                                const occ = variant.occupancy ? Math.max(1, Number(variant.occupancy)) : 1;
                                if (occ > 1) {
                                  setChildren(0);
                                  if (adults === 0 || adults % occ !== 0) {
                                    setAdults(Math.max(occ, Math.ceil((adults || 1) / occ) * occ));
                                  }
                                }
                              }}
                              className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 cursor-pointer ${
                                selected 
                                  ? 'bg-[#1a6b7a]/10 text-[#0f3d56]' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block text-xs font-bold flex items-center gap-1.5 flex-wrap">
                                  {variant.title}
                                  {(variant.occupancy || 1) > 1 && (
                                    <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-black uppercase tracking-wide border border-sky-200">
                                      {variant.occupancy}-Guest Package
                                    </span>
                                  )}


                                </span>
                                <span className="mt-0.5 block text-[10px] font-semibold text-[#1a6b7a]">
                                  {isStudentPackage
                                    ? `🎓 Student ₹${(isSpecialUser ? 1 : Number(variant.student_price || 0)).toLocaleString('en-IN')}`
                                    : (variant.occupancy || 1) > 1
                                    ? `₹${(isSpecialUser ? 1 : Number(variant.adult_price || 0)).toLocaleString('en-IN')} / person (Package: ₹${(isSpecialUser ? Number(variant.occupancy || 1) : Number(variant.adult_price || 0) * (variant.occupancy || 1)).toLocaleString('en-IN')})`
                                    : `Adult ₹${(isSpecialUser ? 1 : Number(variant.adult_price || 0)).toLocaleString('en-IN')} / Child ₹${(isSpecialUser ? 1 : Number(variant.child_price || 0)).toLocaleString('en-IN')}`
                                  }
                                </span>
                              </span>
                              {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f3d56]" /> : null}
                            </button>
                          );
                        }) : (
                          <div className="px-3 py-4 text-xs font-semibold text-amber-700">
                            Package options are being updated. Please call to confirm.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Date Picker */}
                <div className="relative" ref={dateMenuRef}>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">Travel date</label>
                  <button
                    type="button"
                    disabled={(!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0}
                    onClick={() => { setDateMenuOpen(!dateMenuOpen); setVariantMenuOpen(false); }}
                    className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
                      (!isActive || (isPackageInactive && !isAdmin)) || validVariants.length === 0
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        : dateMenuOpen
                        ? 'border-[#1a6b7a] bg-white ring-2 ring-[#1a6b7a]/15 shadow-md shadow-[#1a6b7a]/5 text-slate-900 font-extrabold'
                        : 'border-slate-200 bg-white hover:border-[#1a6b7a]/50 text-slate-800'
                    }`}
                  >
                    <span className="truncate">{selectedDate ? formatIndianDate(selectedDate, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}</span>
                    <CalendarDays className="h-4 w-4 text-slate-500 shrink-0 transition-colors" />
                  </button>

                  {dateMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-100 bg-white shadow-xl w-[calc(100vw-32px)] sm:w-[330px] origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                      {renderCalendar()}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Availability Status */}
              {(selectedDate || (!selectedDate && tomorrowSlot)) && (
                <div className="text-xs">
                  {availabilityState.kind === 'loading' ? (
                    <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> {availabilityState.message}</div>
                  ) : availabilityState.kind === 'closed' ? (
                    <div className="flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /> {availabilityState.message}</div>
                  ) : availabilityState.kind === 'sold_out' ? (
                    <div className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" /> {availabilityState.message}</div>
                  ) : availabilityState.kind === 'open' ? (
                    <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {availabilityState.message}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500"><Info className="h-4 w-4" /> {availabilityState.message}</div>
                  )}
                </div>
              )}

              {/* Passengers */}
              {isStudentPackage ? (
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-amber-600">🎓 Students</label>
                  <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/30 px-3 py-1">
                    <button
                      type="button"
                      disabled={!isActive || (isPackageInactive && !isAdmin) || adults <= 0}
                      onClick={() => setAdults(p => Math.max(0, p - 1))}
                      className={`h-9 w-9 rounded-lg font-black text-lg transition flex items-center justify-center cursor-pointer ${
                        !isActive || (isPackageInactive && !isAdmin) || adults <= 0 ? 'text-slate-300 cursor-not-allowed' : 'text-[#b45309] hover:bg-amber-100'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      disabled={!isActive || (isPackageInactive && !isAdmin)}
                      value={adults === 0 ? '' : adults}
                      placeholder="0"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setAdults(0);
                          return;
                        }
                        const val = parseInt(raw, 10);
                        if (!isNaN(val)) {
                          const maxVal = (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open')
                            ? Number(selectedSlot?.available_seats || 9999)
                            : 9999;
                          setAdults(Math.min(maxVal, Math.max(0, val)));
                        }
                      }}
                      className="w-20 text-center bg-transparent border-none outline-none font-black text-slate-800 text-base focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults >= Number(selectedSlot?.available_seats))}
                      onClick={() => setAdults(p => p + 1)}
                      className={`h-9 w-9 rounded-lg font-black text-lg transition flex items-center justify-center cursor-pointer ${
                        !isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults >= Number(selectedSlot?.available_seats))
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-[#b45309] hover:bg-amber-100'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : variantOccupancy > 1 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#1a6b7a] flex items-center gap-1.5">
                      <PackageIcon className="h-3.5 w-3.5 text-[#1a6b7a]" />
                      Packages &amp; Guests ({variantOccupancy} Guests per Package)
                    </label>
                    <span className="text-[10px] font-bold text-slate-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                      +{variantOccupancy} guests / package
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border-2 border-[#1a6b7a]/30 bg-[#1a6b7a]/5 px-3 py-1.5 shadow-sm">
                    <button
                      type="button"
                      disabled={!isActive || (isPackageInactive && !isAdmin) || adults <= 0}
                      onClick={() => setAdults(p => Math.max(0, p - variantOccupancy))}
                      className={`h-9 w-9 rounded-lg font-black text-lg transition flex items-center justify-center cursor-pointer ${
                        !isActive || (isPackageInactive && !isAdmin) || adults <= 0
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-[#1a6b7a] hover:bg-[#1a6b7a]/15 bg-white shadow-xs'
                      }`}
                    >
                      -
                    </button>
                    <div className="text-center">
                      <div className="text-base font-black text-slate-900 leading-tight">
                        {adults > 0 ? `${adults} Guests` : '0 Guests'}
                      </div>
                      <div className="text-[11px] font-bold text-[#1a6b7a]">
                        {adults > 0 ? `${adults / variantOccupancy} Package${adults / variantOccupancy === 1 ? '' : 's'}` : `Choose in multiples of ${variantOccupancy}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={
                        !isActive ||
                        (isPackageInactive && !isAdmin) ||
                        (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && (totalPassengers + variantOccupancy) > Number(selectedSlot?.available_seats))
                      }
                      onClick={() => setAdults(p => (p === 0 ? variantOccupancy : p + variantOccupancy))}
                      className={`h-9 w-9 rounded-lg font-black text-lg transition flex items-center justify-center cursor-pointer ${
                        !isActive ||
                        (isPackageInactive && !isAdmin) ||
                        (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && (totalPassengers + variantOccupancy) > Number(selectedSlot?.available_seats))
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-[#1a6b7a] hover:bg-[#1a6b7a]/15 bg-white shadow-xs'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold px-0.5">
                    💡 This package option is configured for {variantOccupancy} guests. Book in groups of {variantOccupancy} ({variantOccupancy}, {variantOccupancy * 2}, {variantOccupancy * 3} guests).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Adults (11+)</label>
                    <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                      <button
                        type="button"
                        disabled={!isActive || (isPackageInactive && !isAdmin) || adults <= 0}
                        onClick={() => setAdults(p => Math.max(0, p - 1))}
                        className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) || adults <= 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-slate-800">{adults}</span>
                      <button
                        type="button"
                        disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && totalPassengers >= Number(selectedSlot?.available_seats))}
                        onClick={() => setAdults(p => p + 1)}
                        className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && totalPassengers >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Children (4-10)</label>
                    <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                      <button
                        type="button"
                        disabled={!isActive || (isPackageInactive && !isAdmin) || children <= 0}
                        onClick={() => setChildren(p => Math.max(0, p - 1))}
                        className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) || children <= 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-slate-800">{children}</span>
                      <button
                        type="button"
                        disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && totalPassengers >= Number(selectedSlot?.available_seats))}
                        onClick={() => setChildren(p => p + 1)}
                        className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && totalPassengers >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}


          {/* Transport Selection — Premium Grouped UI */}
          {hasTransport && transportOptions.length > 0 && (
            <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Transport</label>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex gap-2">
                {sharedOptions.length > 0 && (
                  <button
                    type="button"
                    disabled={!isActive || (isPackageInactive && !isAdmin)}
                    onClick={() => { setSelectedTransportMode('SHARED'); setSeparateVehicleQtys({}); setSelectedSharedOptionId(null); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedTransportMode === 'SHARED' 
                        ? 'bg-[#1a6b7a] border-[#1a6b7a] text-white shadow-sm shadow-[#1a6b7a]/20' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-[#1a6b7a]/60'
                    }`}
                  >
                    🚌 Shared
                  </button>
                )}
                {separateOptions.length > 0 && (
                  <button
                    type="button"
                    disabled={!isActive || (isPackageInactive && !isAdmin)}
                    onClick={() => { setSelectedTransportMode('SEPARATE'); setSelectedSharedOptionId(null); }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedTransportMode === 'SEPARATE' 
                        ? 'bg-[#1a6b7a] border-[#1a6b7a] text-white shadow-sm shadow-[#1a6b7a]/20' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-[#1a6b7a]/60'
                    }`}
                  >
                    🚗 Separate Vehicle
                  </button>
                )}
              </div>

              {/* Shared Options */}
              {selectedTransportMode === 'SHARED' && (
                <div className="grid gap-2">
                  {sharedOptions.map(opt => {
                    const optAvail = transportAvailMap[opt.id];
                    const pOverride = Number(optAvail?.price_override ?? 0);
                    
                    const tAdultUi = positiveNumber(isWeekendSelected && opt.weekend_adult_price ? opt.weekend_adult_price : opt.adult_price) + pOverride;
                    const tChildUi = positiveNumber(isWeekendSelected && opt.weekend_child_price ? opt.weekend_child_price : opt.child_price) + pOverride;
                    const tStudentUi = positiveNumber(isWeekendSelected && opt.weekend_student_price ? opt.weekend_student_price : opt.student_price) + pOverride;
                    const extraCost = isStudentPackage ? (passengerAdults * tStudentUi) : ((passengerAdults * tAdultUi) + (passengerChildren * tChildUi));
                    const isSelected = selectedSharedOptionId === opt.id;
                    
                    const hasInventory = optAvail ? !optAvail.is_closed : (availabilityState.kind === 'open' || !selectedDate);
                    const isClosed = optAvail ? optAvail.is_closed : false;
                    const seatsLeft = optAvail ? optAvail.remaining : (opt.capacity ?? 99);
                    const totalPax = totalPassengers;
                    const isDisabledForThis = (!hasInventory || isClosed || seatsLeft <= 0 || (totalPax > 0 && seatsLeft < totalPax));

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isDisabledForThis ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'} ${isSelected ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-[#1a6b7a]/40'}`}
                      >
                        <input
                          type="radio"
                          name="sharedTransport"
                          checked={isSelected}
                          onChange={() => { if (!isDisabledForThis) setSelectedSharedOptionId(opt.id); }}
                          disabled={!isActive || (isPackageInactive && !isAdmin) || isDisabledForThis}
                          className="mt-1 text-[#1a6b7a] focus:ring-[#1a6b7a] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                            {opt.title}{opt.capacity ? ` · ${opt.capacity} Seats` : ''}
                          </div>
                          {hasInventory && !isClosed && seatsLeft > 0 && seatsLeft >= totalPax && (
                            <div className="text-[10px] font-bold text-[#b45309] mt-0.5">Only {seatsLeft} seats left</div>
                          )}
                          {(!hasInventory || isClosed || seatsLeft <= 0) && (
                            <div className="text-[10px] font-bold text-red-500 mt-0.5">Unavailable</div>
                          )}
                          {hasInventory && !isClosed && seatsLeft > 0 && seatsLeft < totalPax && (
                            <div className="text-[10px] font-bold text-rose-500 mt-0.5">Not enough capacity for {totalPax} pax</div>
                          )}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {isStudentPackage
                                ? `₹${formatINR(tStudentUi)}/student`
                                : `₹${formatINR(tAdultUi)}/adult · ₹${formatINR(tChildUi)}/child`
                              }
                            </span>
                            {isSelected && extraCost > 0 && (
                              <span className="text-[10px] font-black text-[#1a6b7a] shrink-0 whitespace-nowrap">+₹{formatINR(extraCost)}</span>
                            )}


                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Separate Vehicle Options with Quantity Selectors */}
              {selectedTransportMode === 'SEPARATE' && (
                <div className="space-y-2">
                  {separateOptions.map(opt => {
                    const optAvail = transportAvailMap[opt.id];
                    const pOverride = Number(optAvail?.price_override ?? 0);
                    const qty = separateVehicleQtys[opt.id] || 0;
                    const fixedPrice = positiveNumber(isWeekendSelected && opt.weekend_fixed_price ? opt.weekend_fixed_price : opt.fixed_price) + pOverride;
                    const lineTotal = qty * fixedPrice;

                    const hasInventory = optAvail ? !optAvail.is_closed : (availabilityState.kind === 'open' || !selectedDate);
                    const isClosed = optAvail ? optAvail.is_closed : false;
                    const vehiclesLeft = optAvail ? optAvail.remaining : 5;
                    const isDisabledForThis = (!hasInventory || isClosed || vehiclesLeft <= 0);
                    const maxQty = vehiclesLeft;

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border transition-all ${isDisabledForThis ? 'opacity-50 bg-slate-50' : ''} ${qty > 0 && !isDisabledForThis ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 shadow-sm' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{opt.title}</div>
                            <div className="text-[10px] font-semibold mt-0.5 text-slate-500">
                              Max {opt.capacity} pax · <span className="text-[#1a6b7a]">₹{formatINR(fixedPrice)}/vehicle</span>
                            </div>
                            {hasInventory && !isClosed && vehiclesLeft > 0 && (
                              <div className="text-[10px] font-bold text-[#b45309] mt-0.5">Only {vehiclesLeft} left</div>
                            )}


                            {(!hasInventory || isClosed || vehiclesLeft <= 0) && (
                              <div className="text-[10px] font-bold text-red-500 mt-0.5">Unavailable</div>
                            )}


                          </div>
                          {/* Qty Selector */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={!isActive || isPackageInactive || qty <= 0}
                              onClick={() => setSeparateVehicleQtys(prev => ({ ...prev, [opt.id]: Math.max(0, (prev[opt.id] || 0) - 1) }))}
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center font-black text-base transition-all ${qty <= 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-[#1a6b7a] text-[#1a6b7a] hover:bg-[#1a6b7a] hover:text-white'}`}
                            >−</button>
                            <span className={`w-6 text-center text-sm font-black ${qty > 0 ? 'text-[#1a6b7a]' : 'text-slate-400'}`}>{qty}</span>
                            <button
                              type="button"
                              disabled={!isActive || isPackageInactive || qty >= maxQty || isDisabledForThis}
                              onClick={() => setSeparateVehicleQtys(prev => ({ ...prev, [opt.id]: Math.min(maxQty, (prev[opt.id] || 0) + 1) }))}
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center font-black text-base transition-all ${qty >= maxQty || isDisabledForThis ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-[#1a6b7a] text-[#1a6b7a] hover:bg-[#1a6b7a] hover:text-white'}`}
                            >+</button>
                          </div>
                        </div>
                        {qty > 0 && !isDisabledForThis && (
                          <div className="mt-2 pt-2 border-t border-[#1a6b7a]/10 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-[#1a6b7a]/70 tracking-wider">Subtotal</span>
                            <span className="text-xs font-black text-[#1a6b7a]">+₹{formatINR(lineTotal)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Capacity Warning */}
                  {!separateCapacityOk && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[10px] font-bold text-rose-600">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        Not enough capacity! {totalPassengers} passenger{totalPassengers > 1 ? 's' : ''} need{totalPassengers === 1 ? 's' : ''} more vehicles. Add vehicles until the total seat capacity covers all passengers.
                      </span>
                    </div>
                  )}

                  {/* Capacity OK confirmation */}
                  {separateCapacityOk && Object.values(separateVehicleQtys).some(q => q > 0) && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Vehicles confirmed for {totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {/* Refreshments Toggle */}
          {hasRefreshments && (
            <div className="pt-2.5 border-t border-slate-100">
              <label 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  includeRefreshments 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 bg-white hover:border-emerald-500/50'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={includeRefreshments}
                  onChange={(e) => setIncludeRefreshments(e.target.checked)}
                  disabled={!isActive || (isPackageInactive && !isAdmin)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">Add Refreshments</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {isStudentPackage
                      ? `₹${formatINR(refreshmentStudentPrice || 0)}/Student`
                      : `₹${formatINR(refreshmentAdultPrice || 0)}/Adult, ₹${formatINR(refreshmentChildPrice || 0)}/Child`
                    }
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Coupon */}
          <div className="pt-2.5 border-t border-slate-100">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Promo code</label>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!isActive || isPackageInactive || validatingCoupon || appliedCoupon !== null}
                placeholder="Enter promo code"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-bold uppercase transition focus:border-[#1a6b7a] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 h-10"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={!isActive || isPackageInactive || validatingCoupon}
                  className="shrink-0 rounded-lg bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 h-10 uppercase tracking-wider"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!isActive || isPackageInactive || validatingCoupon || !couponCode.trim()}
                  className="shrink-0 rounded-lg bg-slate-900 px-5 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center min-w-[80px] h-10 uppercase tracking-wider"
                >
                  {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </button>
              )}
            </div>

            {couponError && (
              <p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {couponError}
              </p>
            )}
            {couponSuccess && (
              <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {couponSuccess}
              </p>
            )}
          </div>

          {/* Pricing Details & Advance Payment Card */}
          {!hasPassengerSelection ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
              <p className="text-xs font-bold text-slate-400">
                {isStudentPackage ? 'Select number of students to view pricing' : 'Select adults and children to view pricing'}
              </p>
            </div>
          ) : (
          <div className="rounded-2xl border border-[#dfe8e2]/85 bg-slate-50/70 p-4 space-y-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <span>Base Fare <span className="text-[10px] text-slate-400">
                  {isAccommodationMode 
                    ? `(${roomCartTotalGuests} Guests)` 
                    : isStudentPackage 
                    ? `(${passengerAdults} Student${passengerAdults > 1 ? 's' : ''})` 
                    : `(${passengerAdults}A, ${passengerChildren}C)`}
                </span></span>
                <span className="font-bold text-slate-800">₹{formatINR(prices.pureBaseSubtotal)}</span>
              </div>

              {/* Per-Person Fare Details Toggle & Breakdown Card */}
              <div className="pt-0.5">
                <button
                  type="button"
                  id="toggle-fare-breakdown-btn"
                  onClick={() => setShowFareBreakdown(prev => !prev)}
                  className="w-full group flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/90 hover:from-emerald-100 hover:to-teal-100/90 border border-emerald-200/90 hover:border-emerald-300 text-slate-700 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
                  aria-expanded={showFareBreakdown}
                >
                  <span className="flex items-center gap-1.5 font-bold text-[11px] text-[#078a81] group-hover:text-[#0f3d56] transition-colors">
                    <ReceiptText className="h-3.5 w-3.5 text-[#078a81] shrink-0" />
                    <span>{showFareBreakdown ? 'Hide Fare Details' : 'View Fare Details (Per Person)'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                    <span>{showFareBreakdown ? 'Close' : 'Details'}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showFareBreakdown ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {showFareBreakdown && (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-white p-3 shadow-xs space-y-2.5 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Header: Option / Variant & Day Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="min-w-0">
                        <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-400 block">Package Option</span>
                        <span className="font-black text-slate-800 truncate block text-[11.5px]">
                          {isAccommodationMode 
                            ? (primaryRoomVariant?.title || 'Accommodation Package')
                            : (selectedVariant?.title || 'Standard Package')}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        isWeekendSelected 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isWeekendSelected ? 'Weekend Pricing' : 'Weekday Pricing'}
                      </span>
                    </div>

                    {/* Accommodation package selection breakdown */}
                    {isAccommodationMode ? (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <span>Package Option / Capacity</span>
                          <span>Total</span>
                        </div>
                        {prices.roomCartBreakdown && prices.roomCartBreakdown.length > 0 ? (
                          prices.roomCartBreakdown.map((item, idx) => (
                            <div key={`${item.variantId}-${item.roomIndex || idx}`} className="rounded-lg bg-slate-50/90 p-2.5 border border-slate-100 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                                  <PackageIcon className="h-3.5 w-3.5 text-[#078a81]" />
                                  {formatPackageDisplayName(item.title)} {item.roomIndex ? `(Package ${item.roomIndex})` : `(${item.occupancy} Guests)`}
                                </span>
                                <span className="font-black text-slate-800 text-xs">
                                  ₹{formatINR(item.subtotal)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                                <span>
                                  {item.adults !== undefined
                                    ? `${item.adults} Adult${item.adults > 1 ? 's' : ''}${item.children ? ` + ${item.children} Child${item.children > 1 ? 'ren' : ''}` : ''}`
                                    : `${item.qty} Package × ₹{formatINR(item.roomEffPrice)}`}
                                </span>
                                <span>₹{formatINR(item.roomEffPrice)} / package</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No packages selected yet.</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Accommodation notice if variantOccupancy > 1 */}
                        {variantOccupancy > 1 && (
                          <div className="rounded-lg bg-sky-50/80 border border-sky-100 p-2 text-[11px] text-sky-900 flex items-start gap-2">
                            <PackageIcon className="h-4 w-4 text-[#1a6b7a] shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <span className="font-black block text-sky-950">
                                Package Group ({variantOccupancy} Guests per Package)
                              </span>
                              <span className="text-[10px] text-sky-700 font-medium">
                                {passengerAdults} Guests configured across {Math.ceil(passengerAdults / variantOccupancy)} Package{Math.ceil(passengerAdults / variantOccupancy) > 1 ? 's' : ''} (Groups of {variantOccupancy})
                              </span>
                            </div>
                          </div>
                        )}

                    {/* Per Person Calculation Cards */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span>Passenger Type</span>
                        <span>Price Set</span>
                      </div>

                      {/* Adult / Student Calculation Card */}
                      <div className="rounded-lg bg-slate-50/90 p-2 border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                            <Users className="h-3.5 w-3.5 text-[#078a81]" />
                            {isStudentPackage ? 'Student' : (variantOccupancy > 1 ? 'Guest (11+ yrs)' : 'Adult (11+ yrs)')}
                          </span>
                          <span className="font-extrabold text-[#078a81] text-[11.5px]">
                            ₹{formatINR(prices.pureBaseAdult)} <span className="font-normal text-slate-400 text-[9.5px]">/ person</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                          <span className="font-medium">
                            {passengerAdults} {isStudentPackage ? 'Students' : (passengerAdults > 1 ? 'Guests' : 'Guest')} × ₹{formatINR(prices.pureBaseAdult)}
                          </span>
                          <span className="font-black text-slate-800">
                            ₹{formatINR(passengerAdults * prices.pureBaseAdult)}
                          </span>
                        </div>
                        {selectedVariant?.weekend_adult_price && (
                          <div className="text-[9.5px] text-slate-400 flex justify-between pt-0.5 border-t border-dashed border-slate-200/50">
                            <span>Weekday: ₹{formatINR(selectedVariant.adult_price)}</span>
                            <span>Weekend: ₹{formatINR(selectedVariant.weekend_adult_price)}</span>
                          </div>
                        )}
                      </div>

                      {/* Child Calculation Card (Non-student packages) */}
                      {!isStudentPackage && passengerChildren > 0 && (
                        <div className="rounded-lg bg-slate-50/90 p-2 border border-slate-100 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-[11px]">
                              Child (4–10 yrs)
                            </span>
                            <span className="font-extrabold text-[#078a81] text-[11.5px]">
                              ₹{formatINR(prices.pureBaseChild)} <span className="font-normal text-slate-400 text-[9.5px]">/ child</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                            <span className="font-medium">
                              {passengerChildren} {passengerChildren === 1 ? 'Child' : 'Children'} × ₹{formatINR(prices.pureBaseChild)}
                            </span>
                            <span className="font-black text-slate-800">
                              ₹{formatINR(passengerChildren * prices.pureBaseChild)}
                            </span>
                          </div>
                          {selectedVariant?.weekend_child_price && (
                            <div className="text-[9.5px] text-slate-400 flex justify-between pt-0.5 border-t border-dashed border-slate-200/50">
                              <span>Weekday: ₹{formatINR(selectedVariant.child_price)}</span>
                              <span>Weekend: ₹{formatINR(selectedVariant.weekend_child_price)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                    {/* Total Base Fare Footer */}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-600">Base Fare Total:</span>
                      <span className="font-black text-[#0f3d56] text-sm">₹{formatINR(prices.pureBaseSubtotal)}</span>
                    </div>
                  </div>
                )}
              </div>
              {prices.weekendSurchargeSubtotal > 0 && (
                <div className="flex justify-between items-center text-amber-600">
                  <span>Weekend Surcharge</span>
                  <span className="font-bold text-amber-600">+₹{formatINR(prices.weekendSurchargeSubtotal)}</span>
                </div>
              )}
              {prices.surgeSubtotal > 0 && (
                <div className="flex justify-between items-center text-rose-600">
                  <span>Surge Fee <span className="text-[10px] text-slate-400">(High Demand)</span></span>
                  <span className="font-bold text-rose-600">+₹{formatINR(prices.surgeSubtotal)}</span>
                </div>
              )}
              {prices.discountSubtotal > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>Special Discount</span>
                  <span className="font-bold text-emerald-600">-₹{formatINR(prices.discountSubtotal)}</span>
                </div>
              )}
              {/* Transport breakdown */}
              {prices.transportBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center gap-2 text-[#1a6b7a]">
                  <span className="font-semibold text-[11px] truncate">
                    {item.type === 'SEPARATE_VEHICLE' ? `${item.quantity}× ${item.title}` : item.title}
                    <span className="text-[10px] ml-1 text-slate-400 font-normal">(Transport)</span>
                  </span>
                  <span className="font-bold shrink-0 whitespace-nowrap text-[11px]">+₹{formatINR(item.subtotal)}</span>
                </div>
              ))}
              {/* Refreshments */}
              {prices.refreshmentSubtotal > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="font-semibold">Refreshments</span>
                  <span className="font-bold">+₹{formatINR(prices.refreshmentSubtotal)}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Discount <span className="text-[10px]">({appliedCoupon.code})</span></span>
                  <span>-₹{formatINR(prices.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>GST <span className="text-[10px] text-slate-400">(5%)</span></span>
                <span className="font-bold text-slate-800">₹{formatINR(prices.gst)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gateway Fee <span className="text-[10px] text-slate-400">(1%)</span></span>
                <span className="font-bold text-slate-800">₹{formatINR(prices.gatewayFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Service Charge <span className="text-[10px] text-slate-400">(1%)</span></span>
                <span className="font-bold text-slate-800">₹{formatINR(prices.serviceCharge)}</span>
              </div>
              {isAgent ? (
                <>
                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 mt-1.5 text-xs font-bold text-slate-600">
                    <span>Tourist Total Bill</span>
                    <span>₹{formatINR(prices.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 font-bold">
                    <span>Agent Commission ({prices.commissionType === 'FIXED_AMOUNT' ? `Fixed ₹${prices.commissionFixedAmount}` : `${prices.commissionPercentage}%`} on Base Fare)</span>
                    <span>-₹{formatINR(prices.agentDiscount)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-300 pt-2 mt-1.5 text-sm font-black text-slate-900">
                    <span>Net Payable Amount</span>
                    <span className="text-[#1a6b7a] text-lg">₹{formatINR(prices.agentPayable)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 mt-1.5 text-sm font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-[#1a6b7a] text-lg">₹{formatINR(prices.grandTotal)}</span>
                </div>
              )}
            </div>

            {selectedDate && (() => {
              const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
              const minPayable = Math.ceil(finalTotal * 0.35);
              const derivedPct = parseFloat(((effectivePayNow / finalTotal) * 100).toFixed(1));
              if (derivedPct !== paymentPercentage) setPaymentPercentage(derivedPct);
              return (
                <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
                  {/* Row 1: Toggle + Amount */}
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    {/* Full / Advance toggle */}
                    <div className="flex bg-slate-200/60 rounded-lg p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setCustomPayAmount(''); setPaymentPercentage(100); setIsAdvanceSelected(false); }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${!isAdvanceSelected ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        Full
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdvanceSelected(true);
                          if (customPayAmount === '') {
                            setCustomPayAmount(String(minPayable));
                            setPaymentPercentage(35);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${isAdvanceSelected ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        Advance
                      </button>
                    </div>

                    {/* Amount input / display */}
                    {isAdvanceSelected ? (
                      <div className="flex-1 min-w-[110px] flex items-center gap-1 bg-white border border-[#1a6b7a]/40 rounded-lg px-2 py-1 shadow-sm">
                        <span className="text-xs font-black text-slate-400">₹</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customPayAmount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCustomPayAmount(val);
                          }}
                          onBlur={() => {
                            const v = parseInt(customPayAmount, 10);
                            if (isNaN(v) || v < minPayable) setCustomPayAmount(String(minPayable));
                            else if (v >= finalTotal) {
                              setCustomPayAmount('');
                              setIsAdvanceSelected(false);
                            }
                            else setCustomPayAmount(String(v));
                          }}
                          className="flex-1 bg-transparent text-xs font-black text-slate-800 outline-none w-0 min-w-0"
                          placeholder={String(minPayable)}
                        />
                        <span className="text-[9px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">now</span>
                      </div>
                    ) : (
                      <div className="flex-1 text-right shrink-0 whitespace-nowrap">
                        <span className="text-xs font-black text-[#1a6b7a]">₹{formatINR(finalTotal)}</span>
                        <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">full</span>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Balance due / error */}
                  {isPartial && (
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-0.5">
                      <span>Balance due later</span>
                      <span className="font-black text-slate-600">₹{formatINR(finalTotal - effectivePayNow)}</span>
                    </div>
                  )}
                  {isAdvanceSelected && customPayAmount !== '' && parseInt(customPayAmount, 10) < minPayable && (
                    <p className="text-[10px] text-red-500 font-bold">Min advance: ₹{formatINR(minPayable)} (35%)</p>
                  )}
                </div>
              );
            })()}
          </div>
          )}

          {/* Min Passengers Warning */}
          {!isAdmin && adults > 0 && !hasPassengerSelection && (minPassengers || 1) > 1 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700 leading-relaxed">
                This package requires a minimum of <span className="font-black">{minPassengers} {isStudentPackage ? 'students' : 'passengers'}</span> per booking. Add more {isStudentPackage ? 'students' : 'passengers'} to proceed.
              </p>
            </div>
          )}

          {/* Payment Gateway Selector */}
          {!isAdmin && isAuthenticated && (
            <div className="mt-4 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Pay Via</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="gateway-phonepe"
                  type="button"
                  onClick={() => setSelectedGateway('PHONEPE')}
                  className={`relative flex flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    selectedGateway === 'PHONEPE'
                      ? 'border-[#5f259f] bg-[#5f259f]/5 shadow-md shadow-[#5f259f]/10 scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-[#5f259f]/40'
                  }`}
                >
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#5f259f] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-[#5f259f]/20">Recommended</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#5f259f] p-1 rounded-full flex items-center justify-center shrink-0">
                      <svg fill="#ffffff" role="img" viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243 1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z"/>
                      </svg>
                    </div>
                    <span className="font-sans font-black text-sm text-[#5f259f] tracking-tight">PhonePe</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">UPI · Cards · NetBanking</span>
                </button>
                <button
                  id="gateway-cashfree"
                  type="button"
                  onClick={() => setSelectedGateway('CASHFREE')}
                  className={`flex flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    selectedGateway === 'CASHFREE'
                      ? 'border-[#180e4b] bg-[#180e4b]/5 shadow-md shadow-[#180e4b]/10 scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-[#180e4b]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" className="h-5.5 w-5.5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.44275 1.03139C5.16931 1.03139 4.1371 2.06361 4.1371 3.33704H12.6944C13.9678 3.33704 15 2.30483 15 1.03139H6.44275Z" fill="#04AB61"/>
                      <path d="M4.1371 3.33704C4.1371 2.06361 5.16931 1.03139 6.44275 1.03139V9.58886C6.44275 10.8621 5.41054 11.8945 4.1371 11.8945V3.33704Z" fill="#04AB61"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.17496 4.1055V6.41115H9.86441C11.1378 6.41115 12.1701 5.37893 12.1701 4.1055H7.17496Z" fill="#FBB016"/>
                      <path d="M1.02623 6.41115C1.02623 5.13793 2.05844 4.1055 3.33188 4.1055V12.663C3.33188 13.9364 2.29966 14.9686 1.02623 14.9686V6.41115Z" fill="#FBB016"/>
                    </svg>
                    <span className="font-sans font-black text-sm text-[#180e4b] tracking-tight">
                      Cashfree <span className="font-normal text-[#180e4b]/80">Payments</span>
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">UPI · Cards · All Methods</span>
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={isButtonDisabled}
            onClick={handleBookingClick}
            className={`mt-5 hidden lg:flex w-full rounded-lg py-3.5 px-5 font-black text-white shadow-md transition-all text-sm uppercase tracking-wider h-12 items-center justify-center ${isButtonDisabled
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#1a6b7a] hover:-translate-y-0.5 hover:bg-[#13505c] hover:shadow-md'
              }`}
          >
            {isProcessingCheckout ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : !isActive ? 'BOOKINGS SUSPENDED' : ctaText}
          </button>

          {brochurePdfUrl && (
            <a
              href={brochurePdfUrl}
              onClick={handleDownloadBrochure}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 hidden lg:flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 hover:border-[#1a6b7a] bg-white px-4 py-3 text-xs font-black text-[#1a6b7a] hover:bg-slate-50 transition-colors uppercase tracking-wider h-11"
            >
              📥 Download Brochure PDF
            </a>
          )}

{/* SimilarPackagesBookingWidget omitted */}
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 px-4 py-3 flex items-center justify-between gap-4 z-40 lg:hidden shadow-[0_-10px_30px_rgba(15,61,86,0.08)]">
        <div className="flex flex-col min-w-0">
          {hasPassengerSelection && selectedDate ? (
            <>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isPartial ? 'Advance Pay' : 'Total Price'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-[#1a6b7a] tracking-tight">
                  ₹{formatINR(effectivePayNow)}
                </span>
                {isPartial && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase">({paymentPercentage}%)</span>
                )}
              </div>
              {isPartial && (
                <span className="text-[9px] font-semibold text-slate-400 truncate">
                  Total: ₹{formatINR(isAgent ? prices.agentPayable : prices.grandTotal)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-bold text-slate-400 leading-snug">
              {!hasPassengerSelection
                ? (isStudentPackage ? 'Choose students to see price' : 'Choose passengers to see price')
                : 'Select a date to see price'}
            </span>
          )}
        </div>

        <button
          disabled={isButtonDisabled}
          onClick={handleBookingClick}
          className={`flex-1 rounded-xl h-11 px-4 font-black text-white text-xs uppercase tracking-wider transition-all flex items-center justify-center ${
            isButtonDisabled
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-[#1a6b7a] active:scale-95 shadow-md shadow-[#1a6b7a]/10'
          }`}
        >
          {isProcessingCheckout ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : ctaText}
        </button>
      </div>

      <ConfirmModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onConfirm={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
        title="Verification Required"
        message="Please log in to continue booking your tickets."
        confirmText="Proceed to Login"
        cancelText="Cancel"
      />

      <CheckoutPassengerModal
        isOpen={showPassengerModal}
        onClose={() => setShowPassengerModal(false)}
        onSubmit={handleCheckoutSubmit}
        adults={passengerAdults}
        children={isStudentPackage ? 0 : passengerChildren}
        isProcessing={isProcessingCheckout}
        targetType="package"
        isStudentPackage={isStudentPackage}
      />

      <BusWarningModal
        isOpen={showBusWarningModal}
        onClose={() => setShowBusWarningModal(false)}
        onConfirm={handleAgreeBusWarning}
      />
    </div>
  );
};
