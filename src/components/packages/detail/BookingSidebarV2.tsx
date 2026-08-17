'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CalendarDays, AlertTriangle, XCircle, CheckCircle2, Loader2, Info, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, PublicDateAvailability } from '@/stores/inventoryStore';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BusWarningModal from '@/components/ui/BusWarningModal';
import { apiClient } from '@/lib/api';
import CheckoutPassengerModal from '@/components/checkout/CheckoutPassengerModal';
import { reportBookNowConversion } from '@/components/providers/AnalyticsProvider';

import { toast } from 'sonner';
import { ReconnectingEventSource } from '@/lib/ReconnectingEventSource';
import { downloadFileViaFetch } from '@/lib/downloadUtils';

interface PackageVariant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  weekend_adult_price?: number | string | null;
  weekend_child_price?: number | string | null;
  student_price?: number | string | null;
  weekend_student_price?: number | string | null;
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
  hasFoodOption?: boolean;
  foodAdultPrice?: number | string | null;
  foodChildPrice?: number | string | null;
  foodStudentPrice?: number | string | null;
  minPassengers?: number;
  isStudentPackage?: boolean;
  refreshmentsMinPassengers?: number;
  isActive?: boolean;
  advancePaymentType?: string | null;
  advancePaymentValue?: number | null;
  extras?: any[];
  agentCommissionType?: string | null;
  agentCommissionPercentage?: number | string | null;
  agentCommissionFixedAmount?: number | string | null;
  agentDailyQuota?: number | null;
  agentIsAllowed?: boolean | null;
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
  hasFoodOption,
  foodAdultPrice,
  foodChildPrice,
  foodStudentPrice,
  minPassengers = 1,
  isStudentPackage = false,
  refreshmentsMinPassengers = 1,
  isActive = true,
  advancePaymentType = 'FULL_PAYMENT',
  advancePaymentValue = 0,
  extras = [],
  agentCommissionType,
  agentCommissionPercentage,
  agentCommissionFixedAmount,
  agentDailyQuota,
  agentIsAllowed,
}: BookingSidebarV2Props) => {
  const { isAuthenticated, user } = useAuthStore();
  const isSpecialUser = false;
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
    return variants.filter(
      (v) => v.title && v.title.trim() !== '' && (isStudentPackage ? Number(v.student_price) > 0 : Number(v.adult_price) > 0)
    );
  }, [variants, isStudentPackage]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);
  // Transport state: 'NONE' | 'SHARED' | 'SEPARATE'
  const [selectedTransportMode, setSelectedTransportMode] = useState<'NONE' | 'SHARED' | 'SEPARATE'>('NONE');

  // Auto-select first transport option if available and 'NONE' is not allowed
  useEffect(() => {
    if (hasTransport && transportOptions.length > 0) {
      if (selectedTransportMode === 'NONE') {
        const sharedOpts = transportOptions.filter(o => o.type === 'SHARED');
        const separateOpts = transportOptions.filter(o => o.type === 'SEPARATE_VEHICLE');
        if (sharedOpts.length > 0) {
          setSelectedTransportMode('SHARED');
          setSelectedSharedOptionId(sharedOpts[0].id);
        } else if (separateOpts.length > 0) {
          setSelectedTransportMode('SEPARATE');
        }
      }
    } else if (selectedTransportMode !== 'NONE') {
      setSelectedTransportMode('NONE');
      setSelectedSharedOptionId(null);
      setSeparateVehicleQtys({});
    }
  }, [hasTransport, transportOptions, selectedTransportMode]);
  // For SHARED: which option id is selected
  const [selectedSharedOptionId, setSelectedSharedOptionId] = useState<number | null>(null);
  // For SEPARATE: map of optionId -> quantity
  const [separateVehicleQtys, setSeparateVehicleQtys] = useState<Record<number, number>>({});
  const [includeRefreshments, setIncludeRefreshments] = useState<boolean>(false);
  const [includeFoodOption, setIncludeFoodOption] = useState<boolean>(false);
  const [currentMonthStr, setCurrentMonthStr] = useState(toYYYYMM(today));
  const [adults, setAdults] = useState<number>(Math.max(1, minPassengers));
  const [children, setChildren] = useState<number>(0);
  const [paymentPercentage, setPaymentPercentage] = useState(100);
  // Custom pay-now amount in rupees (null = full payment)
  const [customPayAmount, setCustomPayAmount] = useState<string>('');
  const [isAdvanceSelected, setIsAdvanceSelected] = useState<boolean>(false);

  const totalPassengers = isStudentPackage ? adults : (adults + children);
  const isRefreshmentDisabled = totalPassengers < refreshmentsMinPassengers;

  useEffect(() => {
    if (isStudentPackage) {
      setChildren(0);
    }
  }, [isStudentPackage]);

  useEffect(() => {
    if (isRefreshmentDisabled && includeRefreshments) {
      setIncludeRefreshments(false);
    }
  }, [isRefreshmentDisabled, includeRefreshments]);

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
      const savedIncludeFoodOption = sessionStorage.getItem('last_checkout_include_food_option');
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
      if (savedIncludeFoodOption) setIncludeFoodOption(savedIncludeFoodOption === 'true');
      if (savedAdults) setAdults(Number(savedAdults));
      if (savedChildren) setChildren(Number(savedChildren));
      
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

  // Auto-select first valid variant when loaded
  useEffect(() => {
    if (validVariants.length > 0) {
      if (selectedVariantId === null || !validVariants.some(v => v.id === selectedVariantId)) {
        setSelectedVariantId(validVariants[0].id);
      }
    }
  }, [validVariants, selectedVariantId]);

  // Reset custom payment when core booking parameters change so the user doesn't get stuck with an old advance amount
  useEffect(() => {
    setCustomPayAmount('');
    setPaymentPercentage(100);
    setIsAdvanceSelected(false);
  }, [selectedVariantId, selectedDate, adults, children, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, includeRefreshments]);

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
          toast.info('Your daily booking quota for this package was just updated by an administrator!', { duration: 5000 });
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
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setDateMenuOpen(false);
      }
      if (variantMenuRef.current && !variantMenuRef.current.contains(event.target as Node)) {
        setVariantMenuOpen(false);
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
      }
    };
    window.addEventListener('select-variant', handleSelectVariant);
    return () => window.removeEventListener('select-variant', handleSelectVariant);
  }, [validVariants]);

  // Clamp passengers when date/slot changes
  useEffect(() => {
    if (selectedDate && publicAvailability && selectedVariantId !== null) {
      const slot = publicAvailability.dates.find(
        (d) => d.date === selectedDate && d.variant_id === selectedVariantId
      );
      if (slot && slot.status === 'OPEN') {
        const available = Number(slot.available_seats || 0);
        if (!isAdmin && adults + children > available && available > 0) {
          setChildren(0);
          setAdults(Math.max(1, available));
        }
      }
    }
  }, [selectedDate, publicAvailability, selectedVariantId, adults, children]);

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

  const tomorrowSlot = useMemo<PublicDateAvailability | null>(() => {
    if (!publicAvailability || selectedVariantId === null) return null;
    return publicAvailability.dates.find(
      (d) => d.date === tomorrowDateStr && d.variant_id === selectedVariantId
    ) ?? null;
  }, [tomorrowDateStr, selectedVariantId, publicAvailability]);

  const selectedSlot = useMemo<PublicDateAvailability | null>(() => {
    if (!selectedDate || !publicAvailability || selectedVariantId === null) return null;
    return publicAvailability.dates.find(
      (d) => d.date === selectedDate && d.variant_id === selectedVariantId
    ) ?? null;
  }, [selectedDate, selectedVariantId, publicAvailability]);

  const displaySlot = selectedSlot || tomorrowSlot;

  const selectedVariant = useMemo(() => {
    if (selectedVariantId === null) return validVariants[0];
    return validVariants.find((v) => v.id === selectedVariantId) ?? validVariants[0];
  }, [validVariants, selectedVariantId]);

  const isPackageInactive = !publicLoading && (!publicAvailability || !isActive);

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
      ? (adults * pureBaseStudent)
      : (adults * pureBaseAdult) + (children * pureBaseChild);
    
    let weekendSurchargeSubtotal = 0;
    let expectedEffAdult = pureBaseAdult;
    let expectedEffChild = pureBaseChild;
    let expectedEffStudent = pureBaseStudent;
    
    if (isWeekend) {
      if (isStudentPackage) {
        expectedEffStudent = positiveNumber(selectedVariant?.weekend_student_price) || pureBaseStudent;
        weekendSurchargeSubtotal = adults * (expectedEffStudent - pureBaseStudent);
      } else {
        expectedEffAdult = positiveNumber(selectedVariant?.weekend_adult_price) || pureBaseAdult;
        expectedEffChild = positiveNumber(selectedVariant?.weekend_child_price) || pureBaseChild;
        weekendSurchargeSubtotal = (adults * (expectedEffAdult - pureBaseAdult)) + (children * (expectedEffChild - pureBaseChild));
      }
    }

    let surgeSubtotal = 0;
    let discountSubtotal = 0;

    if (isStudentPackage) {
      if (baseStudent > expectedEffStudent) {
        surgeSubtotal += (adults * (baseStudent - expectedEffStudent));
      } else if (baseStudent < expectedEffStudent) {
        discountSubtotal += (adults * (expectedEffStudent - baseStudent));
      }
    } else {
      if (baseAdult > expectedEffAdult) {
        surgeSubtotal += (adults * (baseAdult - expectedEffAdult));
      } else if (baseAdult < expectedEffAdult) {
        discountSubtotal += (adults * (expectedEffAdult - baseAdult));
      }

      if (baseChild > expectedEffChild) {
        surgeSubtotal += (children * (baseChild - expectedEffChild));
      } else if (baseChild < expectedEffChild) {
        discountSubtotal += (children * (expectedEffChild - baseChild));
      }
    }

    const baseSubtotal = isStudentPackage
      ? (adults * baseStudent)
      : (adults * baseAdult) + (children * baseChild);
    
    // TRANSPORT PRICING
    let transportSubtotal = 0;
    const transportBreakdown: Array<{title: string; type: string; quantity: number; unitPrice: number; subtotal: number}> = [];
    
    if (hasTransport) {
      if (selectedTransportMode === 'SHARED' && selectedSharedOptionId) {
        const tOpt = transportOptions.find(o => o.id === selectedSharedOptionId);
        if (tOpt) {
          if (isStudentPackage) {
            const tStudent = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_student_price ? tOpt.weekend_student_price : tOpt.student_price);
            const cost = adults * tStudent;
            transportSubtotal = cost;
            transportBreakdown.push({ title: tOpt.title, type: 'SHARED', quantity: 1, unitPrice: tStudent, subtotal: cost });
          } else {
            const tAdult = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_adult_price ? tOpt.weekend_adult_price : tOpt.adult_price);
            const tChild = isSpecialUser ? 1 : positiveNumber(isWeekend && tOpt.weekend_child_price ? tOpt.weekend_child_price : tOpt.child_price);
            const cost = (adults * tAdult) + (children * tChild);
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
        refreshmentSubtotal = adults * refStudent;
      } else {
        refAdult = isSpecialUser ? 1 : positiveNumber(refreshmentAdultPrice);
        refChild = isSpecialUser ? 1 : positiveNumber(refreshmentChildPrice);
        refreshmentSubtotal = (adults * refAdult) + (children * refChild);
      }
    }

    // FOOD OPTION PRICING
    let foodSubtotal = 0;
    let foodAdult = 0;
    let foodChild = 0;
    let foodStudent = 0;
    if (hasFoodOption && includeFoodOption) {
      if (isStudentPackage) {
        foodStudent = isSpecialUser ? 1 : positiveNumber(foodStudentPrice);
        foodSubtotal = adults * foodStudent;
      } else {
        foodAdult = isSpecialUser ? 1 : positiveNumber(foodAdultPrice);
        foodChild = isSpecialUser ? 1 : positiveNumber(foodChildPrice);
        foodSubtotal = (adults * foodAdult) + (children * foodChild);
      }
    }

    // CUSTOM EXTRAS PRICING
    let customExtrasSubtotal = 0;
    if (extras && extras.length > 0 && selectedExtraIds.length > 0) {
      extras.forEach((ex: any) => {
        if (selectedExtraIds.includes(ex.id)) {
          if (isStudentPackage) {
            customExtrasSubtotal += adults * (isSpecialUser ? 1 : positiveNumber(ex.student_price));
          } else {
            customExtrasSubtotal += (adults * (isSpecialUser ? 1 : positiveNumber(ex.adult_price))) + (children * (isSpecialUser ? 1 : positiveNumber(ex.child_price)));
          }
        }
      });
    }

    const rawSubtotal = baseSubtotal + transportSubtotal + refreshmentSubtotal + foodSubtotal + customExtrasSubtotal;

    let subtotal = rawSubtotal;
    let discount = 0;

    if (appliedCoupon) {
      discount = appliedCoupon.discount_amount;
      subtotal = Math.max(0, rawSubtotal - discount);
    }

    const gst = Math.round(subtotal * 0.05);
    const gatewayFee = Math.round((subtotal + gst) * 0.01);
    const grandTotal = subtotal + gst + gatewayFee;

    // Agent Commission Calculations
    const commissionType = (commType || user?.commission_type || 'PERCENTAGE') as 'PERCENTAGE' | 'FIXED_AMOUNT';
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
        agentDiscount = Math.min(grandTotal, Number(((commissionableBase * commissionPercentage) / 100).toFixed(2)));
      }
    }
    const agentPayable = Math.max(0, grandTotal - agentDiscount);

    return { 
      baseAdult, baseChild, baseStudent, baseSubtotal,
      pureBaseSubtotal, weekendSurchargeSubtotal, surgeSubtotal, discountSubtotal,
      transportSubtotal, transportBreakdown,
      refreshmentSubtotal, 
      foodSubtotal,
      rawSubtotal, discount, subtotal, gst, gatewayFee, 
      grandTotal, agentDiscount, agentPayable 
    };
  }, [selectedSlot, selectedVariant, startingPrice, adults, children, appliedCoupon, user, isAgent, selectedDate, hasTransport, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, transportOptions, hasRefreshments, includeRefreshments, refreshmentAdultPrice, refreshmentChildPrice, isStudentPackage, refreshmentStudentPrice, hasFoodOption, includeFoodOption, foodAdultPrice, foodChildPrice, foodStudentPrice, commType, commPercentage, commFixedAmount]);

  const { minPayable, effectivePayNow, isPartial } = useMemo(() => {
    const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
    
    let minPay = finalTotal;
    const advType = advancePaymentType || 'FULL_PAYMENT';
    const advVal = advancePaymentValue || 0;
    
    if (advType === 'PERCENTAGE') {
      const pct = advVal || 35;
      minPay = Math.ceil(finalTotal * (pct / 100));
    } else if (advType === 'FIXED_AMOUNT') {
      const fixedAmt = advVal || 500;
      minPay = Math.min(finalTotal, fixedAmt);
    }
    
    const parsedCustom = parseInt(customPayAmount, 10);
    const payNow = !isAdvanceSelected
      ? finalTotal
      : (isNaN(parsedCustom) || customPayAmount === '' ? minPay : Math.min(finalTotal, Math.max(minPay, parsedCustom)));
      
    return {
      minPayable: minPay,
      effectivePayNow: payNow,
      isPartial: isAdvanceSelected && advType !== 'FULL_PAYMENT' && payNow < finalTotal
    };
  }, [prices.agentPayable, prices.grandTotal, customPayAmount, isAgent, isAdvanceSelected, advancePaymentType, advancePaymentValue, adults, children]);

  // Adjust custom pay amount when total price changes
  useEffect(() => {
    if (isAdvanceSelected) {
      setCustomPayAmount(String(minPayable));
    } else {
      setCustomPayAmount('');
    }
  }, [prices.grandTotal, prices.agentPayable, isAgent, isAdvanceSelected, minPayable]);

  // Auto-adjust Private Cab vehicle quantity dynamically based on total passengers
  useEffect(() => {
    if (selectedTransportMode !== 'SEPARATE' || separateOptions.length === 0) return;
    const totalPax = adults + children;
    if (totalPax <= 0) return;

    const primaryOpt = separateOptions[0];
    const cap = positiveNumber(primaryOpt.capacity) || 6;
    const needed = Math.ceil(totalPax / cap);

    setSeparateVehicleQtys(prev => {
      const currentCapacity = Object.entries(prev).reduce((sum, [optIdStr, q]) => {
        const opt = separateOptions.find(o => o.id === Number(optIdStr));
        return sum + (q || 0) * (positiveNumber(opt?.capacity) || 6);
      }, 0);

      if (currentCapacity < totalPax) {
        return { ...prev, [primaryOpt.id]: Math.max(prev[primaryOpt.id] || 0, needed) };
      }
      return prev;
    });
  }, [selectedTransportMode, adults, children, separateOptions]);

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
          ticket_count: adults + children,
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
        ticket_count: adults + children,
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

  const getOptAvail = (optId: number) => {
    const optAvail = transportAvailMap[optId];
    if (optAvail) return optAvail;
    const opt = transportOptions.find(o => o.id === optId);
    if (!opt) return null;
    const isShared = opt.type === 'SHARED';
    return {
      option_id: optId,
      remaining: isShared ? (opt.capacity || 999) : 99,
      is_closed: false,
      price_override: null
    };
  };

  const sharedCapacityOk = useMemo(() => {
    if (isAdmin) return true;
    if (selectedTransportMode !== 'SHARED' || !selectedSharedOptionId) return true;
    const optAvail = getOptAvail(selectedSharedOptionId);
    if (!optAvail || optAvail.is_closed) return false;
    const totalPax = adults + children;
    return optAvail.remaining >= totalPax;
  }, [selectedTransportMode, selectedSharedOptionId, adults, children, transportAvailMap, transportOptions, isAdmin]);

  const totalSeparateCapacity = useMemo(() => {
    return separateOptions.reduce((sum, opt) => {
      const qty = separateVehicleQtys[opt.id] || 0;
      return sum + qty * (positiveNumber(opt.capacity) || 1);
    }, 0);
  }, [separateOptions, separateVehicleQtys]);

  const separateCapacityOk = useMemo(() => {
    if (isAdmin) return true;
    if (selectedTransportMode !== 'SEPARATE') return true;
    const totalPax = adults + children;
    const hasAnyVehicle = Object.values(separateVehicleQtys).some(q => q > 0);
    if (!hasAnyVehicle) return false;

    for (const opt of separateOptions) {
      const qty = separateVehicleQtys[opt.id] || 0;
      if (qty > 0) {
        const avail = getOptAvail(opt.id);
        if (!avail || avail.is_closed || avail.remaining < qty) return false;
      }
    }

    return totalSeparateCapacity >= totalPax;
  }, [selectedTransportMode, separateVehicleQtys, separateOptions, adults, children, transportAvailMap, transportOptions, totalSeparateCapacity, isAdmin]);

  const hasTransportSelection = useMemo(() => {
    if (!hasTransport || transportOptions.length === 0) return true;
    if (selectedTransportMode === 'SHARED') {
      return selectedSharedOptionId !== null;
    }
    if (selectedTransportMode === 'SEPARATE') {
      const totalVehicles = Object.values(separateVehicleQtys).reduce((a, b) => a + b, 0);
      return totalVehicles > 0 && totalSeparateCapacity >= (adults + children);
    }
    return false;
  }, [hasTransport, transportOptions, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, totalSeparateCapacity, adults, children]);

  const isSuspended = user?.account_status === 'BLOCKED' || user?.account_status === 'DISABLED';

  const isBookingDisabled =
    isSuspended ||
    !isAuthenticated ||
    (!isAdmin && isPackageInactive) ||
    validVariants.length === 0 ||
    !selectedDate ||
    (!isAdmin && !separateCapacityOk) ||
    (!isAdmin && !sharedCapacityOk) ||
    !hasTransportSelection ||
    (!isAdmin && availabilityState.kind !== 'open');

  const ctaText = useMemo(() => {
    if (isProcessingCheckout) return 'Processing...';
    if (isSuspended) return 'Booking Suspended';
    if (!isActive) return 'Bookings Suspended';
    if (isPackageInactive && !isAdmin) return 'Bookings Closed / Inactive';
    if (validVariants.length === 0) return 'Fare updating';
    if (!isAuthenticated) return 'Login to Book';
    if (!selectedDate) return 'Select a date';

    if (hasTransport && transportOptions.length > 0) {
      if (selectedTransportMode === 'SEPARATE') {
        const totalVehicles = Object.values(separateVehicleQtys).reduce((a, b) => a + b, 0);
        if (totalVehicles === 0) return '⚠ Select at least 1 vehicle';
        const totalPax = adults + children;
        if (totalSeparateCapacity < totalPax) return `⚠ Need More Seats (${totalSeparateCapacity}/${totalPax})`;
        if (!isAdmin && !separateCapacityOk) return '⚠ Vehicle Sold Out';
      }
      if (selectedTransportMode === 'SHARED') {
        if (!selectedSharedOptionId) return '⚠ Select a shared transport option';
        if (!isAdmin && !sharedCapacityOk) return '⚠ Not enough transport seats';
      }
    }

    if (isAdmin) return 'Book Now (Admin)';
    if (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out') return 'Unavailable';
    if (availabilityState.kind === 'open') return 'Book Now';
    return 'Call to confirm availability';
  }, [isProcessingCheckout, isSuspended, isActive, isPackageInactive, isAdmin, validVariants.length, isAuthenticated, selectedDate, separateCapacityOk, sharedCapacityOk, hasTransport, transportOptions.length, hasTransportSelection, selectedTransportMode, availabilityState.kind, separateVehicleQtys, adults, children, totalSeparateCapacity, selectedSharedOptionId]);

  // Strict Real-Time Locking: Force-close CheckoutPassengerModal
  useEffect(() => {
    if (isBookingDisabled && showPassengerModal) {
      setShowPassengerModal(false);
      toast.error('Booking is no longer available for the selected dates/variants. Please select different options.', { duration: 5000 });
    }
  }, [isBookingDisabled, showPassengerModal]);

  // Strict Real-Time Locking: Clear invalid selections instantly
  useEffect(() => {
    if (isAdmin) return; // Admins bypass auto-clearing selected invalid dates!
    if (selectedDate && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out')) {
      setSelectedDate('');
      toast.error(availabilityState.message || 'Selected date is no longer available.', { duration: 5000 });
    }
  }, [selectedDate, availabilityState.kind, availabilityState.message, isAdmin]);

  const handleBookingClick = (e: React.MouseEvent) => {
    if ((isPackageInactive && !isAdmin) || !isActive) return;
    if (!isAdmin && availabilityState.kind !== 'open') {
      toast.error(availabilityState.message || 'Schedule has not been opened yet for online booking.');
      return;
    }
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginPrompt(true);
      return;
    }
    
    const totalPax = adults + children;

    if (!selectedDate) {
      toast.error('Please select a travel date first.');
      return;
    }

    if (hasTransport && transportOptions.length > 0) {
      if (selectedTransportMode === 'SEPARATE') {
        const totalVehicles = Object.values(separateVehicleQtys).reduce((a, b) => a + b, 0);
        if (totalVehicles === 0) {
          toast.error('Please select at least 1 vehicle or switch to Shared Transport.');
          return;
        }
        if (totalSeparateCapacity < totalPax) {
          toast.error(`Selected vehicles can seat ${totalSeparateCapacity} passengers, but you have ${totalPax} passengers. Please add more vehicles or switch to Shared Transport.`);
          return;
        }
        if (!separateCapacityOk) {
          toast.error('One or more selected vehicles are sold out or unavailable for this date.');
          return;
        }
      }
      if (selectedTransportMode === 'SHARED') {
        if (!selectedSharedOptionId) {
          toast.error('Please select a shared transport option.');
          return;
        }
        if (!sharedCapacityOk) {
          const optAvail = getOptAvail(selectedSharedOptionId);
          if (optAvail && optAvail.is_closed) {
            toast.error('Shared transport is closed for this date.');
          } else if (optAvail) {
            toast.error(`Not enough shared seats. Requested: ${totalPax}, Available: ${optAvail.remaining}`);
          } else {
            toast.error('Shared transport is unavailable for this date.');
          }
          return;
        }
      }
    }

    if (isBookingDisabled && !isAdmin) {
      toast.error(ctaText || 'Booking is currently unavailable.');
      return;
    }

    // Trigger Google Ads conversion event
    reportBookNowConversion();

    if (is25SeaterSelected) {
      setShowBusWarningModal(true);
    } else {
      setShowPassengerModal(true);
    }
  };

  const handleCheckoutSubmit = async (passengers: any[], quickBooking: boolean = false, customerEmail?: string) => {
    setIsProcessingCheckout(true);
    try {
      if (isAdmin) {
        const adminPayload: any = {
          target_type: 'package',
          travel_date: selectedDate,
          quantity: adults + children,
          adult_count: isStudentPackage ? 0 : adults,
          child_count: isStudentPackage ? 0 : children,
          student_count: isStudentPackage ? (adults + children) : 0,
          variant_id: selectedVariantId,
          transport_selections: buildTransportSelections(),
          include_refreshments: hasRefreshments ? includeRefreshments : false,
          passengers: passengers.map(p => ({
            ...p,
            age: Number(p.age) || 0,
            aadhaar: p.aadhaar ? String(p.aadhaar).trim() : undefined,
            phone: p.phone ? String(p.phone).trim() : undefined,
          })),
          amount_paid: isAdvanceSelected ? effectivePayNow : (customPayAmount !== '' ? Number(customPayAmount) : prices.grandTotal),
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
        quantity: adults + children,
        variant_id: selectedVariantId,
        transport_selections: buildTransportSelections(),
        include_refreshments: hasRefreshments ? includeRefreshments : false,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        adult_count: isStudentPackage ? 0 : adults,
        child_count: isStudentPackage ? 0 : children,
        student_count: isStudentPackage ? (adults + children) : 0,
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
        sessionStorage.setItem('last_checkout_selected_variant_id', String(selectedVariantId || ''));
        sessionStorage.setItem('last_checkout_selected_transport_mode', selectedTransportMode);
        sessionStorage.setItem('last_checkout_selected_shared_option_id', String(selectedSharedOptionId || ''));
        sessionStorage.setItem('last_checkout_separate_vehicle_qtys', JSON.stringify(separateVehicleQtys));
        sessionStorage.setItem('last_checkout_include_refreshments', String(includeRefreshments));
        sessionStorage.setItem('last_checkout_adults', String(adults));
        sessionStorage.setItem('last_checkout_children', String(children));
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

  const renderCalendar = (onClose?: () => void) => {
    if (publicLoading && !isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#1a6b7a]/20 border-t-[#1a6b7a] animate-spin" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading fare calendar...</p>
        </div>
      );
    }

    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(calYear, calMonth, i);
      const dow = d.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const dateStr = toYYYYMMDD(d);
      const isPast = dateStr < todayDateStr || (dateStr === todayDateStr && isAfterCutoff);
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === todayDateStr;

      let dayStatus = 'available';
      let isDisabled = isPast || (!isAdmin && !isActive);

      if (isPast) {
        dayStatus = 'past';
        isDisabled = true;
      } else if (!isActive && !isAdmin) {
        dayStatus = 'inactive';
        isDisabled = true;
      } else if (isAdmin) {
        dayStatus = 'available';
        isDisabled = false;
      } else if (publicAvailability) {
        const slot = publicAvailability.dates.find(item => item.date === dateStr && item.variant_id === selectedVariantId);
        if (slot && slot.status === 'OPEN' && Number(slot.available_seats || 0) > 0) {
          dayStatus = 'available';
          isDisabled = false;
        } else if (slot && (slot.status === 'CLOSED' || slot.status === 'SOLD_OUT')) {
          dayStatus = 'soldout';
          isDisabled = true;
        } else {
          dayStatus = 'unpublished';
          isDisabled = true;
        }
      } else {
        dayStatus = 'unpublished';
        isDisabled = true;
      }

      let fare: number | null = null;
      let availSeats: number | null = null;
      if (!isPast && !isDisabled) {
        const slot = publicAvailability?.dates?.find(item => item.date === dateStr && item.variant_id === selectedVariantId);
        if (slot) {
          availSeats = Number(slot.available_seats ?? 0);
          if (isStudentPackage) {
            fare = Number(slot.effective_student_price ?? slot.student_price ?? 0) || null;
          } else {
            fare = Number(slot.effective_adult_price ?? slot.adult_price ?? 0) || null;
          }
        }
        if (!fare || fare <= 0) {
          if (isStudentPackage) {
            fare = isSpecialUser ? 1 : (
              isWeekend && selectedVariant?.weekend_student_price
                ? positiveNumber(selectedVariant.weekend_student_price)
                : (positiveNumber(selectedVariant?.student_price) || positiveNumber(startingPrice))
            );
          } else {
            fare = isSpecialUser ? 1 : (
              isWeekend && selectedVariant?.weekend_adult_price
                ? positiveNumber(selectedVariant.weekend_adult_price)
                : (positiveNumber(selectedVariant?.adult_price) || positiveNumber(startingPrice))
            );
          }
        }
      }

      const fmtFare = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`;
      const isAvailable = !isDisabled && dayStatus === 'available';

      cells.push(
        <button
          key={i}
          type="button"
          disabled={isDisabled}
          title={isAvailable ? `Travel on ${dateStr} — ${fare ? fmtFare(fare) : 'fares available'}${availSeats !== null ? ` (${availSeats} seats left)` : ''}` : dayStatus === 'soldout' ? 'Sold out / Closed' : 'Past date'}
          onClick={() => handleDaySelect(i)}
          className={[
            'relative flex flex-col items-center justify-center rounded-xl p-1 transition-all duration-150 select-none',
            'min-h-[50px] sm:min-h-[56px] w-full',
            isSelected
              ? 'bg-gradient-to-b from-[#1a6b7a] to-[#155662] shadow-lg shadow-[#1a6b7a]/30 scale-[1.03] z-10'
              : isPast || (isDisabled && dayStatus !== 'soldout')
              ? 'cursor-not-allowed opacity-50 bg-slate-50'
              : isAvailable
              ? (isWeekend
                ? 'bg-amber-50/90 hover:bg-amber-100 border border-amber-200/90 hover:border-amber-400 hover:scale-105 cursor-pointer shadow-2xs'
                : 'bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 hover:border-emerald-400 hover:scale-105 cursor-pointer shadow-2xs')
              : dayStatus === 'soldout'
              ? 'bg-slate-50 border border-slate-200/60 cursor-not-allowed'
              : 'cursor-not-allowed',
          ].join(' ')}
        >
          {isToday && !isSelected && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#1a6b7a]" />
          )}
          <span className={[
            'text-[12px] sm:text-[13px] leading-none font-bold',
            isSelected
              ? 'text-white font-black'
              : isPast
              ? 'text-slate-300'
              : isDisabled && dayStatus !== 'soldout'
              ? 'text-slate-300'
              : dayStatus === 'soldout'
              ? 'text-slate-300 line-through'
              : isWeekend
              ? 'text-amber-700 font-black'
              : 'text-slate-800 font-black',
          ].join(' ')}>
            {i}
          </span>
          <span className={[
            'text-[9px] sm:text-[10px] font-semibold leading-none mt-[2px]',
            isSelected
              ? 'text-cyan-200 font-bold'
              : isPast || (isDisabled && dayStatus !== 'soldout')
              ? 'text-slate-200'
              : dayStatus === 'soldout'
              ? 'text-slate-300'
              : isWeekend
              ? 'text-amber-600 font-bold'
              : 'text-emerald-600 font-bold',
          ].join(' ')}>
            {isPast || (isDisabled && dayStatus !== 'soldout')
              ? ''
              : dayStatus === 'soldout'
              ? 'Full'
              : fare
              ? fmtFare(fare)
              : ''}
          </span>

          {/* Available Seats Pill Tag */}
          {!isPast && isAvailable && availSeats !== null && availSeats > 0 && (
            <span className={[
              'text-[8px] leading-none px-1 py-[1px] rounded-full font-bold mt-[2px] tracking-tight whitespace-nowrap',
              isSelected
                ? 'bg-white/20 text-white'
                : availSeats <= 10
                ? 'bg-rose-100 text-rose-700 font-extrabold'
                : availSeats <= 25
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100/80 text-emerald-800'
            ].join(' ')}>
              {availSeats <= 10 ? `${availSeats} left` : `${availSeats} s`}
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="w-full select-none">
        <div className="bg-gradient-to-r from-[#1a6b7a] to-[#155662] rounded-xl px-3 py-3 mb-3 flex items-center justify-between gap-2">
          <button type="button" onClick={prevMonth} className="h-7 w-7 shrink-0 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center flex-1 min-w-0">
            <div className="text-white font-black text-sm tracking-wide uppercase">{monthNames[calMonth]} {calYear}</div>
            <div className="text-cyan-200/80 text-[10px] font-semibold mt-0.5">Select your travel date</div>
          </div>
          <button type="button" onClick={nextMonth} className="h-7 w-7 shrink-0 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center">
            <ChevronRight className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 shrink-0 rounded-lg bg-white/20 hover:bg-white/35 text-white transition-colors flex items-center justify-center ml-1"
              aria-label="Close calendar"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div key={`${d}-${idx}`} className={`text-center text-[10px] font-black uppercase py-1 ${idx === 0 || idx === 6 ? 'text-amber-400' : 'text-slate-400'}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
              <span className="text-[10px] font-semibold text-slate-400">Weekday</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-amber-100 border border-amber-300" />
              <span className="text-[10px] font-semibold text-slate-400">Weekend</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#1a6b7a]" />
            <span className="text-[10px] font-semibold text-slate-400">Selected</span>
          </div>
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
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">
              {isStudentPackage 
                ? (prices.baseStudent > 0 ? `₹${formatINR(prices.baseStudent)}` : 'Fare updating')
                : (prices.baseAdult > 0 ? `₹${formatINR(prices.baseAdult)}` : 'Fare updating')
              }
            </span>
            {(isStudentPackage ? prices.baseStudent > 0 : prices.baseAdult > 0) && (
              <span className="text-xs font-semibold text-white/70">
                {isStudentPackage ? 'per student' : 'per adult'}
              </span>
            )}

            {/* Price Override Badge */}
            {(() => {
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
                          }}
                          className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 cursor-pointer ${
                            selected 
                              ? 'bg-[#1a6b7a]/10 text-[#0f3d56]' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-bold">{variant.title}</span>
                            <span className="mt-0.5 block text-[10px] font-semibold text-[#1a6b7a]">
                              {isStudentPackage
                                ? `🎓 Student ₹${(isSpecialUser ? 1 : Number(variant.student_price || 0)).toLocaleString('en-IN')}`
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
                <span className="truncate">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}</span>
                <CalendarDays className="h-4 w-4 text-slate-500 shrink-0 transition-colors" />
              </button>

              {dateMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                    onClick={() => setDateMenuOpen(false)}
                  />
                  {/* Calendar panel - X button lives inside the gradient header */}
                  <div className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,calc(100vw-20px))] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-3 sm:p-4 animate-in fade-in-50 zoom-in-95 duration-200">
                    {renderCalendar(() => setDateMenuOpen(false))}
                  </div>
                </>
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
                  disabled={!isActive || (isPackageInactive && !isAdmin)}
                  onClick={() => setAdults(p => Math.max(1, p - 1))}
                  className={`h-9 w-9 rounded-lg font-black text-lg transition flex items-center justify-center cursor-pointer ${
                    !isActive || (isPackageInactive && !isAdmin) ? 'text-slate-300 cursor-not-allowed' : 'text-[#b45309] hover:bg-amber-100'
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  disabled={!isActive || (isPackageInactive && !isAdmin)}
                  value={adults || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      const minVal = minPassengers || 1;
                      const maxVal = (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open')
                        ? Number(selectedSlot?.available_seats || 9999)
                        : 9999;
                      setAdults(Math.min(maxVal, Math.max(0, val)));
                    } else {
                      setAdults(0);
                    }
                  }}
                  onBlur={() => {
                    if (adults < (minPassengers || 1)) {
                      setAdults(minPassengers || 1);
                    }
                  }}
                  className="w-20 text-center bg-transparent border-none outline-none font-black text-slate-800 text-base focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Adults (11+)</label>
                <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                  <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin)} onClick={() => setAdults(p => Math.max(1, p - 1))} className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                  <span className="text-sm font-semibold">{adults}</span>
                  <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setAdults(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Children (4-10)</label>
                <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                  <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin)} onClick={() => setChildren(p => Math.max(0, p - 1))} className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                  <span className="text-sm font-semibold">{children}</span>
                  <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setChildren(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
                </div>
              </div>
            </div>
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
                    onClick={() => { setSelectedTransportMode('SHARED'); setSeparateVehicleQtys({}); if (!selectedSharedOptionId && sharedOptions.length > 0) setSelectedSharedOptionId(sharedOptions[0].id); }}
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
                    const extraCost = isStudentPackage ? (adults * tStudentUi) : ((adults * tAdultUi) + (children * tChildUi));
                    const isSelected = selectedSharedOptionId === opt.id;
                    
                    const hasInventory = Boolean(optAvail) || !selectedDate;
                    const isClosed = optAvail ? optAvail.is_closed : false;
                    const seatsLeft = optAvail ? optAvail.remaining : (opt.capacity ?? 99);
                    const totalPax = adults + children;
                    const isDisabledForThis = (!hasInventory || isClosed || seatsLeft <= 0 || seatsLeft < totalPax);

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

                    const hasInventory = Boolean(optAvail) || !selectedDate;
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
                        Not enough capacity! {adults + children} passenger{adults + children > 1 ? 's' : ''} need{adults + children === 1 ? 's' : ''} more vehicles. Add vehicles until the total seat capacity covers all passengers.
                      </span>
                    </div>
                  )}

                  {/* Capacity OK confirmation */}
                  {separateCapacityOk && Object.values(separateVehicleQtys).some(q => q > 0) && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Vehicles confirmed for {adults + children} passenger{adults + children > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {hasRefreshments && (
            <div className="pt-2.5 border-t border-slate-100">
              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isRefreshmentDisabled
                    ? 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                    : includeRefreshments 
                      ? 'border-emerald-500 bg-emerald-50 cursor-pointer' 
                      : 'border-slate-200 bg-white hover:border-emerald-500/50 cursor-pointer'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={includeRefreshments}
                  onChange={(e) => setIncludeRefreshments(e.target.checked)}
                  disabled={isRefreshmentDisabled || !isActive || (isPackageInactive && !isAdmin)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">Add Fresh-Up Room (Stay/Rest Option)</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {isStudentPackage
                      ? `₹${formatINR(refreshmentStudentPrice || 0)}/Student`
                      : `₹${formatINR(refreshmentAdultPrice || 0)}/Adult, ₹${formatINR(refreshmentChildPrice || 0)}/Child`
                    }
                  </div>
                  {isRefreshmentDisabled && (
                    <div className="text-[9px] text-rose-500 font-bold mt-1">
                      ⚠️ Requires minimum of {refreshmentsMinPassengers} passenger{refreshmentsMinPassengers > 1 ? 's' : ''} to book fresh-up stay (Current: {totalPassengers})
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Food Option Toggle */}
          {hasFoodOption && (
            <div className="pt-2.5 border-t border-slate-100">
              <label 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  includeFoodOption 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 bg-white hover:border-emerald-500/50'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={includeFoodOption}
                  onChange={(e) => setIncludeFoodOption(e.target.checked)}
                  disabled={!isActive || (isPackageInactive && !isAdmin)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">Add Food / Meals Package</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {isStudentPackage
                      ? `₹${formatINR(foodStudentPrice || 0)}/Student`
                      : `₹${formatINR(foodAdultPrice || 0)}/Adult, ₹${formatINR(foodChildPrice || 0)}/Child`
                    }
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Dynamic Custom Package Extras (e.g. Rajahmundry Drop, etc.) */}
          {extras && extras.length > 0 && (
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Package Add-ons & Extras</div>
              {extras.map((ex: any) => {
                const isSelected = selectedExtraIds.includes(ex.id);
                return (
                  <label 
                    key={ex.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-50/60 shadow-xs' 
                        : 'border-slate-200 bg-white hover:border-amber-400'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExtraIds(prev => [...prev, ex.id]);
                        } else {
                          setSelectedExtraIds(prev => prev.filter(id => id !== ex.id));
                        }
                      }}
                      disabled={!isActive || (isPackageInactive && !isAdmin)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 flex items-center justify-between gap-2">
                        <span className="truncate">{ex.title}</span>
                        <span className="text-[10px] font-black text-amber-700 shrink-0">
                          {isStudentPackage
                            ? `+₹${formatINR(ex.student_price || 0)}/pax`
                            : `+₹${formatINR(ex.adult_price || 0)}/Adult`
                          }
                        </span>
                      </div>
                      {ex.description && (
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                          {ex.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
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
          <div className="rounded-2xl border border-[#dfe8e2]/85 bg-slate-50/70 p-4 space-y-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <span>Base Fare <span className="text-[10px] text-slate-400">
                  {isStudentPackage ? `(${adults} Student${adults > 1 ? 's' : ''})` : `(${adults}A, ${children}C)`}
                </span></span>
                <span className="font-bold text-slate-800">₹{formatINR(prices.pureBaseSubtotal)}</span>
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
              {/* Food Option */}
              {prices.foodSubtotal > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="font-semibold">Food & Meals</span>
                  <span className="font-bold">+₹{formatINR(prices.foodSubtotal)}</span>
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
              {isAgent ? (
                <>
                  <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 mt-1.5 text-xs font-bold text-slate-600">
                    <span>Tourist Total Bill</span>
                    <span>₹{formatINR(prices.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 font-bold">
                    <span>Agent Commission ({user?.commission_type === 'FIXED_AMOUNT' ? 'Fixed' : `${user?.commission_percentage}%`} on Base Fare)</span>
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
              const advType = advancePaymentType || 'FULL_PAYMENT';
              const advVal = advancePaymentValue || 0;
              const optionLabel = advType === 'PERCENTAGE' ? `${advVal}% Adv` : `₹${advVal} Adv`;
              const noticeText = advType === 'PERCENTAGE' 
                ? `No cancellation — ${advVal}% advance secures your booking. Balance payable later.` 
                : `No cancellation — ₹${advVal} per passenger advance secures your booking. Balance payable later.`;
              const derivedPct = parseFloat(((effectivePayNow / finalTotal) * 100).toFixed(1));
              if (derivedPct !== paymentPercentage) setPaymentPercentage(derivedPct);
              return (
                <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
                  {advType !== 'FULL_PAYMENT' ? (
                    <>
                      {/* Notice */}
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-700 leading-4">{noticeText}</p>
                      </div>

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
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${isAdvanceSelected ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                          >
                            {optionLabel}
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
                        <p className="text-[10px] text-red-500 font-bold">Min advance: ₹{formatINR(minPayable)}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-50/50 border border-emerald-100 px-2.5 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-slate-600 leading-4">Full payment is required to confirm this package booking.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Min Passengers Warning */}
          {minPassengers > 1 && !isAdmin && (isStudentPackage ? adults : adults + children) < minPassengers && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700 leading-relaxed">
                This package requires a minimum of <span className="font-black">{minPassengers} {isStudentPackage ? 'students' : 'passengers'}</span> per booking. Add more {isStudentPackage ? 'students' : 'passengers'} to proceed.
              </p>
            </div>
          )}



          {/* CTA */}
          <button
            disabled={!isActive || isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && (isStudentPackage ? adults : adults + children) < minPassengers)}
            onClick={handleBookingClick}
            className={`mt-5 hidden lg:flex w-full rounded-lg py-3.5 px-5 font-black text-white shadow-md transition-all text-sm uppercase tracking-wider h-12 items-center justify-center ${!isActive || isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && (isStudentPackage ? adults : adults + children) < minPassengers)
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
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 px-4 py-3 flex items-center justify-between gap-4 z-40 lg:hidden shadow-[0_-10px_30px_rgba(15,61,86,0.08)]">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {selectedDate ? (isPartial ? 'Advance Pay' : 'Total Price') : 'Starting from'}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-[#1a6b7a] tracking-tight">
              ₹{formatINR(selectedDate ? effectivePayNow : (prices.grandTotal || startingPrice || 0))}
            </span>
            {isPartial && selectedDate && (
              <span className="text-[9px] font-bold text-slate-400 uppercase">({paymentPercentage}%)</span>
            )}
          </div>
          {isPartial && selectedDate && (
            <span className="text-[9px] font-semibold text-slate-400 truncate">
              Total: ₹{formatINR(isAgent ? prices.agentPayable : prices.grandTotal)}
            </span>
          )}
        </div>

        <button
          disabled={isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && (isStudentPackage ? adults : adults + children) < minPassengers)}
          onClick={handleBookingClick}
          className={`flex-1 rounded-xl h-11 px-4 font-black text-white text-xs uppercase tracking-wider transition-all flex items-center justify-center ${
            isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && (isStudentPackage ? adults : adults + children) < minPassengers)
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-[#1a6b7a] active:scale-95 shadow-md shadow-[#1a6b7a]/10'
          }`}
        >
          {isProcessingCheckout ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (!isAdmin && minPassengers > 1 && (isStudentPackage ? adults : adults + children) < minPassengers) ? (isStudentPackage ? `Min ${minPassengers} students` : `Min ${minPassengers} pax`) : ctaText}
        </button>
      </div>

      <ConfirmModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onConfirm={() => {
          if (typeof window !== 'undefined') {
            if (selectedDate) sessionStorage.setItem('last_checkout_date', selectedDate);
            if (selectedVariantId) sessionStorage.setItem('last_checkout_selected_variant_id', String(selectedVariantId));
            if (adults) sessionStorage.setItem('last_checkout_adults', String(adults));
            if (children) sessionStorage.setItem('last_checkout_children', String(children));
            sessionStorage.setItem('last_checkout_auto_open', 'true');
          }
          const redirectUrl = typeof window !== 'undefined' ? window.location.pathname + '?restore_checkout=true' : '';
          router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }}
        title="Verification Required"
        message="Please log in to continue booking your tickets. Your selected travel date, package tier, and passenger choices will be saved and restored."
        confirmText="Proceed to Login"
        cancelText="Cancel"
      />

      <CheckoutPassengerModal
        isOpen={showPassengerModal}
        onClose={() => setShowPassengerModal(false)}
        onSubmit={handleCheckoutSubmit}
        adults={adults}
        children={isStudentPackage ? 0 : children}
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
