'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CalendarDays, AlertTriangle, XCircle, CheckCircle2, Loader2, Info, ChevronDown, Check, ChevronLeft, ChevronRight, Ticket, ArrowRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, PublicDateAvailability } from '@/stores/inventoryStore';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BusWarningModal from '@/components/ui/BusWarningModal';
import { apiClient } from '@/lib/api';
import CheckoutPassengerModal from '@/components/checkout/CheckoutPassengerModal';
import { reportBookNowConversion } from '@/components/providers/AnalyticsProvider';
import { CouponWidget } from '@/components/ui/CouponWidget';
import { trackFunnelEvent } from '@/lib/activityTracker';

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

interface BookingSidebarV3Props {
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
  initialVariantId?: number;
  layoutMode?: 'sidebar' | 'dialog';
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

export const BookingSidebarV3 = ({
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
  initialVariantId,
  layoutMode = 'sidebar',
}: BookingSidebarV3Props) => {
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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(initialVariantId || null);
  const [selectedTransportMode, setSelectedTransportMode] = useState<'NONE' | 'SHARED' | 'SEPARATE'>('NONE');

  // Auto-select variant if initialVariantId changes or none selected
  useEffect(() => {
    if (initialVariantId && validVariants.some((v) => v.id === initialVariantId)) {
      setSelectedVariantId(initialVariantId);
    } else if (selectedVariantId === null && validVariants.length > 0) {
      setSelectedVariantId(validVariants[0].id);
    }
  }, [validVariants, initialVariantId]);

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

  const [selectedSharedOptionId, setSelectedSharedOptionId] = useState<number | null>(null);
  const [separateVehicleQtys, setSeparateVehicleQtys] = useState<Record<number, number>>({});
  const [includeRefreshments, setIncludeRefreshments] = useState<boolean>(false);
  const [includeFoodOption, setIncludeFoodOption] = useState<boolean>(false);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);
  const [currentMonthStr, setCurrentMonthStr] = useState(toYYYYMM(today));
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [adults, setAdults] = useState<number>(Math.max(1, minPassengers));
  const [children, setChildren] = useState<number>(0);
  const [paymentPercentage, setPaymentPercentage] = useState(100);
  const [customPayAmount, setCustomPayAmount] = useState<string>('');
  const [isAdvanceSelected, setIsAdvanceSelected] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [pendingCouponCode, setPendingCouponCode] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'PHONEPE' | 'CASHFREE'>('PHONEPE');

  const totalPassengers = isStudentPackage ? adults : (adults + children);
  const isRefreshmentDisabled = totalPassengers < refreshmentsMinPassengers;

  const sharedOptions = useMemo(() => transportOptions.filter(o => o.type === 'SHARED'), [transportOptions]);
  const separateOptions = useMemo(() => transportOptions.filter(o => o.type === 'SEPARATE_VEHICLE'), [transportOptions]);

  const is25SeaterSelected = useMemo(() => {
    if (selectedTransportMode !== 'SEPARATE') return false;
    return Object.entries(separateVehicleQtys).some(([optIdStr, qty]) => {
      if (qty <= 0) return false;
      const opt = separateOptions.find(o => o.id === Number(optIdStr));
      return opt ? (opt.title.toLowerCase().includes('25') || opt.title.toLowerCase().includes('bus') || opt.title.toLowerCase().includes('seater')) : false;
    });
  }, [selectedTransportMode, separateVehicleQtys, separateOptions]);

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

  // Fetch availability when month changes
  useEffect(() => {
    if (packageSlug) {
      fetchPublicAvailability(packageSlug, currentMonthStr);
    }
  }, [packageSlug, currentMonthStr, fetchPublicAvailability]);

  // Listen for Live SSE Inventory updates
  useEffect(() => {
    const sse = new ReconnectingEventSource(`${API_BASE}/api/v1/stream/packages/${packageId}`);
    
    const handleUpdate = (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload) {
          const { applySSEPayload, fetchPublicAvailability } = useInventoryStore.getState();
          if (payload.date && payload.variant_id && payload.available !== undefined) {
            applySSEPayload({ ...payload, travel_date: payload.date, package_id: packageId });
          } else {
            fetchPublicAvailability(packageSlug, currentMonthStr, false);
          }
        }
      } catch (err) {
        console.error('[SSE] Failed to parse inventory payload', err);
      }
    };

    const handleEntityUpdate = (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.package_id === packageId) {
          const { fetchPublicAvailability } = useInventoryStore.getState();
          fetchPublicAvailability(packageSlug, currentMonthStr, false);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse entity payload', err);
      }
    };

    const handleQuotaUpdate = (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.package_id === packageId) {
          const { fetchPublicAvailability } = useInventoryStore.getState();
          fetchPublicAvailability(packageSlug, currentMonthStr, false);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse quota payload', err);
      }
    };

    const handleTransportUpdate = (e: any) => {
      try {
        const { fetchPublicAvailability } = useInventoryStore.getState();
        fetchPublicAvailability(packageSlug, currentMonthStr, false);
      } catch (err) {
        console.error('[SSE] Failed to parse transport payload', err);
      }
    };

    const handleBulkRefresh = (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.package_id === packageId) {
          const { fetchPublicAvailability } = useInventoryStore.getState();
          fetchPublicAvailability(packageSlug, currentMonthStr, false);
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

  // Restore Checkout State
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
      
      setShowPassengerModal(true);
      
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('restore_checkout');
        window.history.replaceState({}, '', url.pathname + url.search);
      } catch (e) {}
    }
  }, []);

  // Listen for variant selection from left side cards
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

  // Clamp passenger seats to capacity
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
  }, [selectedDate, publicAvailability, selectedVariantId, adults, children, isAdmin]);

  const handleDaySelect = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const dateStr = toYYYYMMDD(d);
    if (dateStr >= minDateStr) {
      setSelectedDate(dateStr);
      setIsCalendarExpanded(false);
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
    
    // Transport Pricing
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
    
    // Refreshments
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

    // Food Options
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

    // Extras Options
    let customExtrasSubtotal = 0;
    const customExtrasBreakdown: Array<{id: number; title: string; subtotal: number}> = [];
    if (extras && extras.length > 0 && selectedExtraIds.length > 0) {
      extras.forEach((ex: any) => {
        if (selectedExtraIds.includes(ex.id)) {
          let itemCost = 0;
          if (isStudentPackage) {
            itemCost = adults * (isSpecialUser ? 1 : positiveNumber(ex.student_price));
          } else {
            itemCost = (adults * (isSpecialUser ? 1 : positiveNumber(ex.adult_price))) + (children * (isSpecialUser ? 1 : positiveNumber(ex.child_price)));
          }
          customExtrasSubtotal += itemCost;
          customExtrasBreakdown.push({ id: ex.id, title: ex.title, subtotal: itemCost });
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

    const commissionPercentage = user?.commission_percentage ? Number(user.commission_percentage) : 0;
    const commissionType = user?.commission_type || 'PERCENTAGE';
    const commissionFixedAmount = user?.commission_fixed_amount ? Number(user.commission_fixed_amount) : 0;

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
      customExtrasSubtotal, customExtrasBreakdown,
      rawSubtotal, discount, subtotal, gst, gatewayFee, 
      grandTotal, agentDiscount, agentPayable 
    };
  }, [selectedSlot, selectedVariant, startingPrice, adults, children, appliedCoupon, user, isAgent, selectedDate, hasTransport, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, transportOptions, hasRefreshments, includeRefreshments, refreshmentAdultPrice, refreshmentChildPrice, isStudentPackage, refreshmentStudentPrice, hasFoodOption, includeFoodOption, foodAdultPrice, foodChildPrice, foodStudentPrice, selectedExtraIds, extras, isSpecialUser, isWeekendSelected]);

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
      minPay = Math.min(finalTotal, fixedAmt * totalPassengers);
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
  }, [prices.agentPayable, prices.grandTotal, customPayAmount, isAgent, isAdvanceSelected, advancePaymentType, advancePaymentValue, totalPassengers]);

  // Adjust custom pay amount when total price changes
  useEffect(() => {
    if (!isAdvanceSelected) return;
    setCustomPayAmount(prev => {
      if (prev === '') return prev;
      const parsed = parseInt(prev, 10);
      const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
      if (!isNaN(parsed)) {
        if (parsed >= finalTotal) {
          setIsAdvanceSelected(false);
          return '';
        }
        if (parsed < minPayable) return String(minPayable);
      }
      return prev;
    });
  }, [prices.grandTotal, prices.agentPayable, isAgent, isAdvanceSelected, minPayable]);

  // Live Coupon revalidation
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

    if (prices.rawSubtotal > 0) {
      revalidate();
    } else {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError("Coupon removed (invalid amount)");
      setCouponSuccess(null);
    }

    return () => { isMounted = false; };
  }, [prices.rawSubtotal, packageId, selectedDate, selectedVariantId, adults, children]);

  // Auto-apply coupon code
  useEffect(() => {
    if (pendingCouponCode && prices.rawSubtotal > 0) {
      applyCouponByCode(pendingCouponCode);
      setPendingCouponCode(null);
    }
  }, [prices.rawSubtotal, pendingCouponCode]);

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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setPendingCouponCode(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

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

  const transportAvailMap = useMemo(() => {
    if (!displaySlot?.transport_availability) return {};
    return displaySlot.transport_availability.reduce((acc, curr) => {
      acc[curr.option_id] = curr;
      return acc;
    }, {} as Record<number, any>);
  }, [displaySlot]);

  const sharedCapacityOk = useMemo(() => {
    if (selectedTransportMode !== 'SHARED' || !selectedSharedOptionId) return true;
    const optAvail = transportAvailMap[selectedSharedOptionId];
    if (!optAvail || optAvail.is_closed) return false;
    const totalPax = adults + children;
    return optAvail.remaining >= totalPax;
  }, [selectedTransportMode, selectedSharedOptionId, adults, children, transportAvailMap]);

  const separateCapacityOk = useMemo(() => {
    if (selectedTransportMode !== 'SEPARATE') return true;
    const totalPax = adults + children;
    const totalCapacity = separateOptions.reduce((sum, opt) => {
      const qty = separateVehicleQtys[opt.id] || 0;
      return sum + qty * (positiveNumber(opt.capacity) || 1);
    }, 0);
    const hasAnyVehicle = Object.values(separateVehicleQtys).some(q => q > 0);
    if (!hasAnyVehicle) return true;

    for (const opt of separateOptions) {
      const qty = separateVehicleQtys[opt.id] || 0;
      if (qty > 0) {
        const avail = transportAvailMap[opt.id];
        if (!avail || avail.is_closed || avail.remaining < qty) return false;
      }
    }

    return totalCapacity >= totalPax;
  }, [selectedTransportMode, separateVehicleQtys, separateOptions, adults, children, transportAvailMap]);

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
    if (isPackageInactive && !isAdmin) return 'Bookings Closed';
    if (validVariants.length === 0) return 'Updating Fares';
    if (!isAuthenticated) return 'Login to Book';
    if (!selectedDate) return 'Select Travel Date';
    if (availabilityState.kind === 'unpublished') return 'Schedule Not Opened Yet';
    if (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out') return 'Bookings Unavailable';
    if (!separateCapacityOk) return 'Need More Vehicles';
    if (!sharedCapacityOk) return 'Not Enough Shared Seats';
    if (hasTransport && transportOptions.length > 0 && !hasTransportSelection) {
      if (selectedTransportMode === 'SEPARATE') return 'Select Vehicle';
      return 'Select Transport Option';
    }
    if (isAdmin) return 'Book Now (Admin)';
    if (availabilityState.kind === 'open') return 'Book Now';
    return 'Bookings Unavailable';
  }, [isProcessingCheckout, isSuspended, isActive, isPackageInactive, isAdmin, validVariants.length, isAuthenticated, selectedDate, separateCapacityOk, sharedCapacityOk, hasTransport, transportOptions.length, hasTransportSelection, selectedTransportMode, availabilityState.kind]);

  // Handle auto-clear selected date if sold out / closed
  useEffect(() => {
    if (isAdmin) return;
    if (selectedDate && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out')) {
      setSelectedDate('');
      toast.error(availabilityState.message || 'Selected date is no longer available.', { duration: 5000 });
    }
  }, [selectedDate, availabilityState.kind, availabilityState.message, isAdmin]);

  const handleBookingClick = (e: React.MouseEvent) => {
    if ((isPackageInactive && !isAdmin) || !isActive) return;
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginPrompt(true);
      return;
    }
    
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
          include_food_option: hasFoodOption ? includeFoodOption : false,
          selected_extra_ids: selectedExtraIds,
          extra_ids: selectedExtraIds,
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
        quantity: adults + children,
        variant_id: selectedVariantId,
        transport_selections: buildTransportSelections(),
        include_refreshments: hasRefreshments ? includeRefreshments : false,
        include_food_option: hasFoodOption ? includeFoodOption : false,
        selected_extra_ids: selectedExtraIds,
        extra_ids: selectedExtraIds,
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

      // Track CHECKOUT_INITIATED event for admin lead alert
      const primaryPax = passengers[0] || {};
      trackFunnelEvent({
        funnel_stage: 'CHECKOUT_INITIATED',
        target_type: 'package',
        target_title: packageSlug || 'Tour Package',
        variant_title: selectedVariant?.title,
        travel_date: selectedDate || undefined,
        adult_count: adults,
        child_count: children,
        total_amount: isAgent ? prices.agentPayable : prices.grandTotal,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        customer_name: primaryPax.full_name,
        customer_phone: primaryPax.phone,
        customer_email: customerEmail || user?.email || undefined,
        passengers_data: passengers.map((p: any) => ({ full_name: p.full_name, age: Number(p.age) || 0, gender: p.gender })),
        payment_gateway: selectedGateway,
      });

      const res = await apiClient.post('/api/v1/bookings/checkout', payload);
      const { checkout_data } = res.data;

      if (!checkout_data) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        setIsProcessingCheckout(false);
        return;
      }

      if (checkout_data.gateway === 'CASHFREE') {
        if (!checkout_data.payment_session_id) {
          toast.error("Cashfree session creation failed. Please try again.");
          setIsProcessingCheckout(false);
          return;
        }
        toast.success("Opening Cashfree secure checkout...");
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
        
        const cashfree = (window as any).Cashfree({ mode: cfMode });
        cashfree.checkout({
          paymentSessionId: checkout_data.payment_session_id,
          redirectTarget: "_self"
        }).then((result: any) => {
          if (result && result.error) {
            toast.error(result.error.message || "Payment closed or failed.");
            setIsProcessingCheckout(false);
          }
        }).catch(() => {
          setIsProcessingCheckout(false);
        });
      } else {
        if (!checkout_data.redirect_url) {
          toast.error("Failed to initialize PhonePe gateway. Please try again.");
          setIsProcessingCheckout(false);
          return;
        }
        toast.success("Redirecting to PhonePe secure checkout...");
        setTimeout(() => {
          window.location.href = checkout_data.redirect_url;
        }, 1000);
      }
    } catch (err: any) {
      let errMsg = "Checkout failed. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map((d: any) => `${d.loc?.join('.')} - ${d.msg}`).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      }
      toast.error(errMsg);
      setIsProcessingCheckout(false);
    }
  };

  const renderCalendar = (onClose?: () => void) => {
    if (publicLoading && !isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-[#0d6e75]/20 border-t-[#0d6e75] animate-spin" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading fare calendar...</p>
        </div>
      );
    }

    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const cells: React.ReactNode[] = [];

    // empty cells
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
        if (slot) {
          if (slot.status === 'CLOSED' || slot.status === 'SOLD_OUT' || slot.status === 'NO_INVENTORY' || slot.available_seats <= 0) {
            dayStatus = 'soldout';
            isDisabled = true;
          } else {
            dayStatus = 'available';
            isDisabled = false;
          }
        } else {
          dayStatus = 'available';
          isDisabled = false;
        }
      } else {
        dayStatus = 'available';
        isDisabled = false;
      }

      // per-date fare & seats
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

      // format fare short: 4500 → ₹4.5K, 11500 → ₹11.5K
      const formatFare = (n: number) => {
        if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
        return `₹${n}`;
      };

      const isAvailable = !isDisabled && dayStatus === 'available';

      cells.push(
        <button
          key={i}
          type="button"
          disabled={isDisabled}
          title={isAvailable ? `Travel on ${dateStr} — ${fare ? formatFare(fare) : 'fares available'}${availSeats !== null ? ` (${availSeats} seats left)` : ''}` : dayStatus === 'soldout' ? 'Sold out / Closed' : 'Past date'}
          onClick={() => handleDaySelect(i)}
          className={[
            'relative flex flex-col items-center justify-center rounded-xl p-1 transition-all duration-150 select-none',
            'min-h-[50px] sm:min-h-[56px] w-full',
            isSelected
              ? 'bg-gradient-to-b from-[#0d6e75] to-[#0a5a61] shadow-lg shadow-[#0d6e75]/30 scale-[1.03] z-10'
              : isPast || (isDisabled && dayStatus !== 'soldout')
              ? 'cursor-not-allowed opacity-50 bg-slate-50'
              : isAvailable
              ? isWeekend
                ? 'bg-amber-50/90 hover:bg-amber-100 border border-amber-200/90 hover:border-amber-400 hover:scale-105 cursor-pointer shadow-2xs'
                : 'bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 hover:border-emerald-400 hover:scale-105 cursor-pointer shadow-2xs'
              : dayStatus === 'soldout'
              ? 'bg-slate-50 border border-slate-200/60 cursor-not-allowed'
              : 'cursor-not-allowed',
          ].join(' ')}
        >
          {/* Today indicator dot */}
          {isToday && !isSelected && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#0d6e75]" />
          )}

          {/* Date number */}
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

          {/* Fare price */}
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
              ? formatFare(fare)
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

        {/* ── Header: gradient brand bar with month nav + optional close ── */}
        <div className="bg-gradient-to-r from-[#0d6e75] to-[#0a5a61] rounded-xl px-3 py-3 mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="h-7 w-7 shrink-0 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center flex-1 min-w-0">
            <div className="text-white font-black text-sm tracking-wide uppercase">
              {monthNames[calMonth]} {calYear}
            </div>
            <div className="text-cyan-200/80 text-[10px] font-semibold mt-0.5">
              Select your travel date
            </div>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="h-7 w-7 shrink-0 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center justify-center"
          >
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

        {/* ── Day-of-week headers ── */}
        <div className="grid grid-cols-7 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div
              key={`${d}-${idx}`}
              className={`text-center text-[10px] font-black uppercase py-1 ${idx === 0 || idx === 6 ? 'text-amber-400' : 'text-slate-400'}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells}
        </div>

        {/* ── Legend ── */}
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
            <div className="h-2.5 w-2.5 rounded-sm bg-[#0d6e75]" />
            <span className="text-[10px] font-semibold text-slate-400">Selected</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="booking" className={layoutMode === 'dialog' ? "w-full h-full flex flex-col" : "w-full my-2 lg:sticky lg:top-[120px] pb-24 lg:pb-0"}>
      <div className={layoutMode === 'dialog' ? "flex-1 flex flex-col overflow-hidden bg-white" : "lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200 bg-transparent lg:bg-white lg:shadow-[0_20px_50px_rgba(15,61,86,0.08)] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"}>

        {/* Desktop Sidebar Header (hidden in dialog) */}
        <div className={layoutMode === 'dialog' ? "hidden" : "hidden lg:block bg-[#0d6e75] px-5 py-4 text-white lg:rounded-t-2xl relative"}>
          <h2 className="text-xs font-black uppercase tracking-widest text-[#e5dac5]">Secure Reservation</h2>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight">
              {isStudentPackage
                ? (prices.baseStudent > 0 ? `₹${formatINR(prices.baseStudent)}` : 'Updating fare')
                : (prices.baseAdult > 0 ? `₹${formatINR(prices.baseAdult)}` : 'Updating fare')
              }
            </span>
            {(isStudentPackage ? prices.baseStudent > 0 : prices.baseAdult > 0) && (
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                {isStudentPackage ? '/ student' : '/ adult'}
              </span>
            )}
          </div>
        </div>

        {/* Main content wrapper: side-by-side on desktop, single column on mobile */}
        <div className={layoutMode === 'dialog' ? "flex-1 flex flex-col sm:flex-row overflow-hidden h-full min-h-0" : "space-y-4 p-0 lg:p-5"}>

          {/* LEFT / MAIN form panel */}
          <div className={layoutMode === 'dialog' ? "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 min-h-0" : ""}>
            <div className={layoutMode === 'dialog' ? "p-4 sm:p-6 space-y-5" : "space-y-4"}>

          {/* Suspended Warning */}
          {(isPackageInactive || !isActive) && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs text-rose-700 font-bold flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-black">{!isActive ? 'Bookings Suspended' : 'Online Bookings Suspended'}</p>
                <p className="text-slate-500 font-medium text-[10px] mt-0.5 leading-relaxed">
                  Reservations are temporarily suspended. You cannot submit checkout payloads at this time.
                </p>
              </div>
            </div>
          )}

          {/* Block 1: Choose Variant (Visual selector) */}
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0d6e75] text-[9px] font-black text-white">1</span>
              Choose Package Variant
            </label>
            <div className="grid gap-2">
              {validVariants.map((variant) => {
                const isSelected = variant.id === selectedVariantId;
                const vAdult = isSpecialUser ? 1 : Number(variant.adult_price || 0);
                const vChild = isSpecialUser ? 1 : Number(variant.child_price || 0);
                const vStudent = isSpecialUser ? 1 : Number(variant.student_price || 0);

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`w-full rounded-xl border text-left p-3 transition-all duration-200 shadow-2xs ${
                      isSelected
                        ? 'border-[#0d6e75] bg-[#0d6e75]/5 ring-2 ring-[#0d6e75]/15'
                        : 'border-slate-200 bg-white hover:border-[#0d6e75]/40 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="block text-xs font-black text-slate-900">{variant.title}</span>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#0d6e75] animate-pulse" />}
                        </div>
                        {variant.transport_info && (
                          <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{variant.transport_info}</span>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="block text-xs font-black text-[#0d6e75]">
                          {isStudentPackage ? `🎓 ₹${formatINR(vStudent)}` : `₹${formatINR(vAdult)} / adult`}
                        </span>
                        {!isStudentPackage && (
                          <span className="block text-[9px] font-bold text-slate-400 mt-0.5">Child: ₹{formatINR(vChild)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block 2: Date Select (Sleek Compact Calendar Picker) */}
          <div className="relative pt-3 border-t border-slate-100 z-30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0d6e75] text-[9px] font-black text-white">2</span>
                Choose Travel Date
              </label>
              {selectedDate && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {(() => {
                    const parts = selectedDate.split('-');
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  })()}
                </span>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-xs font-bold shadow-2xs ${
                isCalendarExpanded 
                  ? 'border-[#0d6e75] bg-[#0d6e75]/5 text-[#0d6e75] ring-2 ring-[#0d6e75]/15' 
                  : selectedDate
                  ? 'border-emerald-300/80 bg-emerald-50/40 text-slate-800 hover:border-[#0d6e75]/60'
                  : 'border-slate-200 bg-white hover:border-[#0d6e75]/50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#0d6e75]/10 text-[#0d6e75]">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                </div>
                <span className="truncate">
                  {selectedDate 
                    ? (() => {
                        const parts = selectedDate.split('-');
                        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                        return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                      })()
                    : 'Select a Date...'
                  }
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isCalendarExpanded ? 'rotate-180 text-[#0d6e75]' : 'text-slate-400'}`} />
            </button>

            {/* Calendar Modal - fixed centered, never overflows */}
            {isCalendarExpanded && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                  onClick={() => setIsCalendarExpanded(false)}
                />
                {/* Calendar panel - fixed to center of screen, close X is inside the header */}
                <div className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,calc(100vw-20px))] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-3 sm:p-4 animate-in fade-in-50 zoom-in-95 duration-200">
                  {renderCalendar(() => setIsCalendarExpanded(false))}
                </div>
              </>
            )}
          </div>

          {/* Availability seat status */}
          {(selectedDate || (!selectedDate && tomorrowSlot)) && (
            <div className="text-[11px] font-bold">
              {availabilityState.kind === 'loading' ? (
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#0d6e75]" /> {availabilityState.message}</div>
              ) : availabilityState.kind === 'closed' ? (
                <div className="flex items-start gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-2.5">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-rose-900">Bookings Closed</span>
                    <span className="block text-[10px] font-semibold text-rose-700 mt-0.5">Online reservations for this travel date are closed.</span>
                  </div>
                </div>
              ) : availabilityState.kind === 'sold_out' ? (
                <div className="flex items-start gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-rose-900">Sold Out</span>
                    <span className="block text-[10px] font-semibold text-rose-700 mt-0.5">All seats for this travel date have been fully booked.</span>
                  </div>
                </div>
              ) : availabilityState.kind === 'unpublished' ? (
                <div className="flex items-start gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-amber-900">Schedule Pending</span>
                    <span className="block text-[10px] font-semibold text-amber-700 mt-0.5">Schedule has not been opened yet for online booking. Please pick another date or call our team to confirm.</span>
                  </div>
                </div>
              ) : availabilityState.kind === 'open' ? (
                <div className="flex items-center justify-between text-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/70 px-3 py-2 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-black">{(availabilityState as any).message}</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">Live</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Block 3: Steppers (Modern Ticket Quantity Selector) */}
          <div className="pt-3 border-t border-slate-100">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0d6e75] text-[9px] font-black text-white">3</span>
              Ticket Quantity
            </label>
            {isStudentPackage ? (
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/60 to-amber-100/30 px-3.5 py-2">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">🎓 Students</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!isActive || (isPackageInactive && !isAdmin)}
                    onClick={() => setAdults(p => Math.max(1, p - 1))}
                    className="h-8 w-8 rounded-lg border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 flex items-center justify-center font-black transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                  >-</button>
                  <span className="w-8 text-center text-sm font-black text-slate-900">{adults}</span>
                  <button
                    type="button"
                    disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults >= Number(selectedSlot?.available_seats))}
                    onClick={() => setAdults(p => p + 1)}
                    className="h-8 w-8 rounded-lg border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 flex items-center justify-center font-black transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                  >+</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-2xs hover:border-slate-300 transition-colors">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Adults (11+ yrs)</span>
                  <div className="flex items-center justify-between">
                    <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin)} onClick={() => setAdults(p => Math.max(1, p - 1))} className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-black transition-all text-slate-700 disabled:opacity-40">-</button>
                    <span className="text-sm font-black text-slate-900">{adults}</span>
                    <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setAdults(p => p + 1)} className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-black transition-all text-slate-700 disabled:opacity-40">+</button>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-2xs hover:border-slate-300 transition-colors">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Children (4-10)</span>
                  <div className="flex items-center justify-between">
                    <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin)} onClick={() => setChildren(p => Math.max(0, p - 1))} className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-black transition-all text-slate-700 disabled:opacity-40">-</button>
                    <span className="text-sm font-black text-slate-900">{children}</span>
                    <button type="button" disabled={!isActive || (isPackageInactive && !isAdmin) || (Boolean(selectedDate) && !isAdmin && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setChildren(p => p + 1)} className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 flex items-center justify-center font-black transition-all text-slate-700 disabled:opacity-40">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Block 4: Add-ons, Transport & Refreshments */}
          {(hasTransport || hasRefreshments || hasFoodOption || (extras && extras.length > 0)) && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0d6e75] text-[9px] font-black text-white">4</span>
                Optional Add-ons & Transport
              </label>
              
              {/* Transport Toggles */}
              {hasTransport && transportOptions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {sharedOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setSelectedTransportMode('SHARED'); setSeparateVehicleQtys({}); if (!selectedSharedOptionId && sharedOptions.length > 0) setSelectedSharedOptionId(sharedOptions[0].id); }}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          selectedTransportMode === 'SHARED' ? 'bg-[#0d6e75] border-[#0d6e75] text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >🚌 Shared Coach</button>
                    )}
                    {separateOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setSelectedTransportMode('SEPARATE'); setSelectedSharedOptionId(null); }}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          selectedTransportMode === 'SEPARATE' ? 'bg-[#0d6e75] border-[#0d6e75] text-white shadow-2xs' : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >🚗 Private Cab</button>
                    )}
                  </div>

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
                        const seatsLeft = optAvail ? optAvail.remaining : 99;
                        const isDisabledForThis = (!hasInventory || seatsLeft < totalPassengers);

                        return (
                          <label
                            key={opt.id}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? 'border-[#0d6e75] bg-[#0d6e75]/5 shadow-3xs' : 'border-slate-200 bg-white'
                            } ${isDisabledForThis ? 'opacity-55' : ''}`}
                          >
                            <input
                              type="radio"
                              name="sharedTransportV3"
                              checked={isSelected}
                              disabled={isDisabledForThis}
                              onChange={() => setSelectedSharedOptionId(opt.id)}
                              className="mt-0.5 text-[#0d6e75] focus:ring-[#0d6e75]"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="block text-[11px] font-black text-slate-800 leading-snug">{opt.title}</span>
                              <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                                {isStudentPackage ? `₹${formatINR(tStudentUi)} / student` : `₹${formatINR(tAdultUi)} / adult · ₹${formatINR(tChildUi)} / child`}
                              </span>
                            </div>
                            {isSelected && extraCost > 0 && (
                              <span className="text-[10px] font-black text-[#0d6e75] shrink-0">+₹{formatINR(extraCost)}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {selectedTransportMode === 'SEPARATE' && (
                    <div className="grid gap-2 min-w-0">
                      {separateOptions.map(opt => {
                        const optAvail = transportAvailMap[opt.id];
                        const pOverride = Number(optAvail?.price_override ?? 0);
                        const qty = separateVehicleQtys[opt.id] || 0;
                        const fixedPrice = positiveNumber(isWeekendSelected && opt.weekend_fixed_price ? opt.weekend_fixed_price : opt.fixed_price) + pOverride;
                        const lineTotal = qty * fixedPrice;
                        const hasInventory = Boolean(optAvail) || !selectedDate;
                        const vehiclesLeft = optAvail ? optAvail.remaining : 5;

                        return (
                          <div key={opt.id} className={`p-3 rounded-xl border transition-all min-w-0 ${qty > 0 ? 'border-[#0d6e75] bg-[#0d6e75]/5 shadow-3xs' : 'border-slate-200 bg-white'}`}>
                            <div className="flex items-center justify-between gap-3 min-w-0">
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <span className="block text-[11px] font-black text-slate-850 truncate max-w-full" title={opt.title}>{opt.title}</span>
                                <span className="block text-[9px] font-semibold text-slate-450 mt-0.5">Max {opt.capacity} passengers · <span className="text-[#0d6e75]">₹{formatINR(fixedPrice)}</span></span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => setSeparateVehicleQtys(p => ({ ...p, [opt.id]: Math.max(0, (p[opt.id] || 0) - 1) }))} className="h-7 w-7 rounded-md border flex items-center justify-center font-bold text-slate-605">-</button>
                                <span className="w-5 text-center text-xs font-black text-slate-850">{qty}</span>
                                <button type="button" disabled={!hasInventory || vehiclesLeft <= qty} onClick={() => setSeparateVehicleQtys(p => ({ ...p, [opt.id]: Math.min(vehiclesLeft, (p[opt.id] || 0) + 1) }))} className="h-7 w-7 rounded-md border flex items-center justify-center font-bold text-slate-655">+</button>
                              </div>
                            </div>
                            {qty > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#0d6e75]/10 flex justify-between items-center text-[10px] font-black text-[#0d6e75]">
                                <span>Vehicle cost ({qty} vehicle{qty > 1 ? 's' : ''})</span>
                                <span>+₹{formatINR(lineTotal)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Fresh Up Accommodation */}
              {hasRefreshments && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isRefreshmentDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : includeRefreshments ? 'border-[#0d6e75] bg-[#0d6e75]/5 shadow-3xs' : 'border-slate-200 bg-white hover:border-slate-350'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeRefreshments}
                    disabled={isRefreshmentDisabled}
                    onChange={(e) => setIncludeRefreshments(e.target.checked)}
                    className="mt-0.5 rounded text-[#0d6e75] focus:ring-[#0d6e75] h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-black text-slate-800 leading-snug">Add Fresh-Up Room Break</span>
                    <span className="block text-[9px] font-semibold text-slate-400 mt-1">
                      {isStudentPackage ? `₹${formatINR(refreshmentStudentPrice || 0)}/Student` : `₹${formatINR(refreshmentAdultPrice || 0)}/Adult · ₹${formatINR(refreshmentChildPrice || 0)}/Child`}
                    </span>
                    {isRefreshmentDisabled && (
                      <span className="block text-[9px] font-bold text-rose-500 mt-1">Requires min. {refreshmentsMinPassengers} passengers</span>
                    )}
                  </div>
                  {includeRefreshments && prices.refreshmentSubtotal > 0 && (
                    <span className="text-[10px] font-black text-[#0d6e75] shrink-0">+₹{formatINR(prices.refreshmentSubtotal)}</span>
                  )}
                </label>
              )}

              {/* Food package */}
              {hasFoodOption && (
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  includeFoodOption ? 'border-[#0d6e75] bg-[#0d6e75]/5 shadow-3xs' : 'border-slate-200 bg-white hover:border-slate-350'
                }`}>
                  <input
                    type="checkbox"
                    checked={includeFoodOption}
                    onChange={(e) => setIncludeFoodOption(e.target.checked)}
                    className="mt-0.5 rounded text-[#0d6e75] focus:ring-[#0d6e75] h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-black text-slate-800 leading-snug">Add Meals Package</span>
                    <span className="block text-[9px] font-semibold text-slate-400 mt-1">
                      {isStudentPackage ? `₹${formatINR(foodStudentPrice || 0)}/Student` : `₹${formatINR(foodAdultPrice || 0)}/Adult · ₹${formatINR(foodChildPrice || 0)}/Child`}
                    </span>
                  </div>
                  {includeFoodOption && prices.foodSubtotal > 0 && (
                    <span className="text-[10px] font-black text-[#0d6e75] shrink-0">+₹{formatINR(prices.foodSubtotal)}</span>
                  )}
                </label>
              )}

              {/* Extras checkbox list */}
              {extras && extras.length > 0 && (
                <div className="grid gap-2">
                  {extras.map((ex: any) => {
                    const isSelected = selectedExtraIds.includes(ex.id);
                    const exCost = isStudentPackage ? (adults * positiveNumber(ex.student_price)) : ((adults * positiveNumber(ex.adult_price)) + (children * positiveNumber(ex.child_price)));
                    return (
                      <label key={ex.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'border-[#0d6e75] bg-[#0d6e75]/5 shadow-3xs' : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedExtraIds(p => [...p, ex.id]);
                            else setSelectedExtraIds(p => p.filter(id => id !== ex.id));
                          }}
                          className="mt-0.5 rounded text-[#0d6e75] focus:ring-[#0d6e75] h-4 w-4"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-black text-slate-800 leading-snug">{ex.title}</span>
                          {ex.description && <span className="block text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1">{ex.description}</span>}
                          <span className="block text-[9px] font-semibold text-[#0d6e75] mt-1">
                            {isStudentPackage ? `₹${formatINR(ex.student_price)}/student` : `₹${formatINR(ex.adult_price)}/adult · ₹${formatINR(ex.child_price)}/child`}
                          </span>
                        </div>
                        {isSelected && exCost > 0 && (
                          <span className="text-[10px] font-black text-[#0d6e75] shrink-0">+₹{formatINR(exCost)}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Block 5: Promo code — powered by CouponWidget */}
          <CouponWidget
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            validatingCoupon={validatingCoupon}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            couponSuccess={couponSuccess}
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
            onAutoApply={(code) => applyCouponByCode(code)}
            stepNumber={5}
          />

          {/* ── Step 6: Payment Option (always visible on all screen sizes) ── */}
          {selectedDate && (() => {
            const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
            const advType = advancePaymentType || 'FULL_PAYMENT';
            const advVal = advancePaymentValue || 0;

            if (advType === 'FULL_PAYMENT') return null;

            const advLabel = advType === 'PERCENTAGE' ? `${advVal}% Advance` : `₹${advVal} Advance`;
            const balanceDue = finalTotal - effectivePayNow;

            return (
              <div className="sm:hidden rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
                {/* Step header */}
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0d6e75] text-white text-[10px] font-black">6</div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Payment Option</span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Advance available</span>
                </div>

                {/* Two full-width cards stacked on mobile, side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* FULL PAY card */}
                  <button
                    type="button"
                    onClick={() => { setCustomPayAmount(''); setIsAdvanceSelected(false); }}
                    className={`relative flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150 focus:outline-none ${
                      !isAdvanceSelected
                        ? 'border-[#0d6e75] bg-[#f0fafa] shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Radio */}
                    <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      !isAdvanceSelected ? 'border-[#0d6e75]' : 'border-slate-300'
                    }`}>
                      {!isAdvanceSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#0d6e75]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 leading-none mb-1">Full Pay</div>
                      <div className={`text-2xl font-black leading-none tracking-tight ${
                        !isAdvanceSelected ? 'text-[#0d6e75]' : 'text-slate-800'
                      }`}>₹{formatINR(finalTotal)}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-1">Pay everything now · no balance later</div>
                    </div>
                    {!isAdvanceSelected && (
                      <div className="shrink-0 bg-[#0d6e75] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">Selected</div>
                    )}
                  </button>

                  {/* ADVANCE PAY card */}
                  <button
                    type="button"
                    onClick={() => { setIsAdvanceSelected(true); if (customPayAmount === '') setCustomPayAmount(String(minPayable)); }}
                    className={`relative flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150 focus:outline-none ${
                      isAdvanceSelected
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Radio */}
                    <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      isAdvanceSelected ? 'border-amber-500' : 'border-slate-300'
                    }`}>
                      {isAdvanceSelected && <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 leading-none mb-1">{advLabel}</div>
                      <div className={`text-2xl font-black leading-none tracking-tight ${
                        isAdvanceSelected ? 'text-amber-600' : 'text-slate-800'
                      }`}>₹{formatINR(minPayable)}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-1">Pay advance · balance at boarding</div>
                    </div>
                    {isAdvanceSelected && (
                      <div className="shrink-0 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">Selected</div>
                    )}
                  </button>
                </div>

                {/* Expanded detail panel when advance selected */}
                {isAdvanceSelected && (
                  <div className="rounded-xl border border-amber-200 overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-amber-100 bg-amber-50">
                      {/* Pay now */}
                      <div className="px-4 py-3">
                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">Pay Now</div>
                        <div className="text-2xl font-black text-amber-700">₹{formatINR(minPayable)}</div>
                        <div className="text-[10px] font-semibold text-amber-600 mt-1">Required Advance</div>
                      </div>
                      {/* Balance */}
                      <div className="px-4 py-3">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Balance Due</div>
                        <div className="text-2xl font-black text-slate-700">₹{formatINR(balanceDue)}</div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-1">At boarding point</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 px-4 py-2.5 bg-white border-t border-amber-100">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-semibold text-amber-700 leading-relaxed">
                        {advType === 'PERCENTAGE'
                          ? `Pay ${advVal}% advance now to secure your seats. The remaining ₹${formatINR(balanceDue)} is collected at the boarding point on travel day.`
                          : `Pay ₹${advVal}/person advance now to secure your seats. The remaining ₹${formatINR(balanceDue)} is collected at the boarding point on travel day.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

            </div>
          </div>

          {/* RIGHT summary panel — hidden on mobile (rendered at bottom on mobile instead) */}
          <div className={layoutMode === 'dialog' ? "hidden sm:flex sm:w-[340px] sm:border-l sm:border-slate-200 sm:bg-[#f8fafa] sm:p-6 sm:flex-col sm:justify-between sm:overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-slate-200" : "space-y-4"}>
            <div className="space-y-4">

          {/* Block 6: Pricing Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <span>Base Fare {isStudentPackage ? `(${adults} Stud)` : `(${adults} Ad, ${children} Ch)`}</span>
                <span className="font-bold text-slate-800">₹{formatINR(prices.pureBaseSubtotal)}</span>
              </div>
              {prices.weekendSurchargeSubtotal > 0 && (
                <div className="flex justify-between items-center text-amber-600 font-medium">
                  <span>Weekend Surcharge</span>
                  <span>+₹{formatINR(prices.weekendSurchargeSubtotal)}</span>
                </div>
              )}
              {prices.surgeSubtotal > 0 && (
                <div className="flex justify-between items-center text-rose-600 font-medium">
                  <span>Surge Fee (High Demand)</span>
                  <span>+₹{formatINR(prices.surgeSubtotal)}</span>
                </div>
              )}
              {prices.discountSubtotal > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-medium">
                  <span>Special Discount</span>
                  <span>-₹{formatINR(prices.discountSubtotal)}</span>
                </div>
              )}
              {prices.transportBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[#0d6e75] font-semibold">
                  <span className="truncate">{item.type === 'SEPARATE_VEHICLE' ? `${item.quantity}× ${item.title}` : item.title} (Transport)</span>
                  <span className="shrink-0">+₹{formatINR(item.subtotal)}</span>
                </div>
              ))}
              {prices.refreshmentSubtotal > 0 && (
                <div className="flex justify-between items-center text-[#0d6e75] font-semibold">
                  <span>Fresh-Up Stay add-on</span>
                  <span>+₹{formatINR(prices.refreshmentSubtotal)}</span>
                </div>
              )}
              {prices.foodSubtotal > 0 && (
                <div className="flex justify-between items-center text-[#0d6e75] font-semibold">
                  <span>Food & Meals Package</span>
                  <span>+₹{formatINR(prices.foodSubtotal)}</span>
                </div>
              )}
              {prices.customExtrasBreakdown && prices.customExtrasBreakdown.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-[#0d6e75] font-semibold gap-2">
                  <span className="truncate" title={item.title}>{item.title}</span>
                  <span className="shrink-0">+₹{formatINR(item.subtotal)}</span>
                </div>
              ))}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-600 font-black">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{formatINR(prices.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span>GST (5%)</span>
                <span>₹{formatINR(prices.gst)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span>Gateway Service Fee (1%)</span>
                <span>₹{formatINR(prices.gatewayFee)}</span>
              </div>

              {isAgent ? (
                <div className="border-t border-slate-200 pt-2.5 space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs text-slate-450 font-bold">
                    <span>Client booking bill</span>
                    <span>₹{formatINR(prices.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-600 font-bold">
                    <span>Agent commission rebate</span>
                    <span>-₹{formatINR(prices.agentDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-900 font-black border-t border-slate-200/60 pt-2">
                    <span>Agent Payable Net</span>
                    <span className="text-[#0d6e75] text-base">₹{formatINR(prices.agentPayable)}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-sm font-black text-slate-900 mt-2">
                  <span>Total Amount Due</span>
                  <span className="text-[#0d6e75] text-base">₹{formatINR(prices.grandTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Option for desktop — hidden on mobile (shown in left panel instead) */}
          {selectedDate && (() => {
            const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
            const advType = advancePaymentType || 'FULL_PAYMENT';
            const advVal = advancePaymentValue || 0;
            if (advType === 'FULL_PAYMENT') return null;
            const advLabel = advType === 'PERCENTAGE' ? `${advVal}% Advance` : `₹${advVal} Advance`;
            const balanceDue = finalTotal - effectivePayNow;
            return (
              <div className="hidden sm:block mt-3 pt-3 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Payment Option</span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">Advance available</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCustomPayAmount(''); setIsAdvanceSelected(false); }}
                    className={`flex flex-col items-start rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-150 focus:outline-none ${
                      !isAdvanceSelected ? 'border-[#0d6e75] bg-[#f0fafa] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center mb-1.5 ${!isAdvanceSelected ? 'border-[#0d6e75]' : 'border-slate-300'}`}>
                      {!isAdvanceSelected && <div className="h-1.5 w-1.5 rounded-full bg-[#0d6e75]" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 leading-none mb-1">Full Pay</span>
                    <span className={`text-base font-black leading-none ${!isAdvanceSelected ? 'text-[#0d6e75]' : 'text-slate-700'}`}>₹{formatINR(finalTotal)}</span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Pay now, nothing later</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAdvanceSelected(true); if (customPayAmount === '') setCustomPayAmount(String(minPayable)); }}
                    className={`relative flex flex-col items-start rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-150 focus:outline-none ${
                      isAdvanceSelected ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isAdvanceSelected && (
                      <div className="absolute -top-2 right-2 bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">Selected</div>
                    )}
                    <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center mb-1.5 ${isAdvanceSelected ? 'border-amber-500' : 'border-slate-300'}`}>
                      {isAdvanceSelected && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 leading-none mb-1">{advLabel}</span>
                    <span className={`text-base font-black leading-none ${isAdvanceSelected ? 'text-amber-700' : 'text-slate-700'}`}>₹{formatINR(minPayable)}</span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Balance at boarding</span>
                  </button>
                </div>
                {isAdvanceSelected && (
                  <div className="mt-2 rounded-xl bg-white border border-amber-200 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border-b border-amber-100">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-600">Pay Now</div>
                        <div className="text-lg font-black text-amber-700 mt-0.5">₹{formatINR(minPayable)}</div>
                        <div className="text-[9px] font-semibold text-amber-600">Required Advance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Balance Later</div>
                        <div className="text-lg font-black text-slate-700 mt-0.5">₹{formatINR(balanceDue)}</div>
                        <div className="text-[9px] font-semibold text-slate-400">At boarding</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 px-3 py-2">
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] font-semibold text-amber-700 leading-relaxed">
                        {advType === 'PERCENTAGE'
                          ? `Pay ${advVal}% advance now — remaining ₹${formatINR(balanceDue)} payable at boarding.`
                          : `Pay ₹${advVal}/person advance now — remaining ₹${formatINR(balanceDue)} payable at boarding.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          </div>

          <div className="space-y-3 mt-6">

          {/* Min Passengers restriction warning */}
          {minPassengers > 1 && !isAdmin && totalPassengers < minPassengers && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700 leading-relaxed">
                Min. reservation requirement of <span className="font-black">{minPassengers} people</span> is not met. Please increase passenger count.
              </p>
            </div>
          )}

          {/* Checkout CTA — shown in right panel (desktop) and inline on dialog mobile */}
          <button
            disabled={!isActive || isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers)}
            onClick={handleBookingClick}
            className={`group mt-4 relative isolate flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              !isActive || isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers)
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                : 'bg-[#0d6e75] hover:bg-[#0b5c62] text-white shadow-lg shadow-teal-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
            }`}
          >
            {isProcessingCheckout ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : !isActive ? 'BOOKINGS SUSPENDED' : (
              <>
                {!isBookingDisabled && <span className="absolute inset-y-0 -left-10 w-8 rotate-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-96" />}
                {!isBookingDisabled && <Ticket className="h-4.5 w-4.5 shrink-0 stroke-[2.6]" />}
                <span>{ctaText}</span>
                {!isBookingDisabled && <ArrowRight className="h-4 w-4 shrink-0 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />}
              </>
            )}
          </button>

          {brochurePdfUrl && (
            <a
              href={brochurePdfUrl}
              onClick={handleDownloadBrochure}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 hidden lg:flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-[#0d6e75] bg-white px-4 py-3.5 text-xs font-black text-[#0d6e75] hover:bg-slate-50 transition-colors uppercase tracking-wider h-10"
            >
              📥 Download Brochure PDF
            </a>
          )}
      </div>
    </div>
  </div>

  {/* ── Mobile sticky bar: only in dialog mode (the left panel hides the right panel) ── */}
  {layoutMode === 'dialog' && (
    <div className="sm:hidden shrink-0 border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {!selectedDate ? 'Starting from' : isPartial ? 'Pay Now (Advance)' : 'Total Due'}
        </span>
        <span className={`text-xl font-black tracking-tight ${isPartial && selectedDate ? 'text-amber-600' : 'text-[#0d6e75]'}`}>
          ₹{formatINR(selectedDate ? effectivePayNow : (prices.grandTotal || startingPrice || 0))}
        </span>
        {isPartial && selectedDate && (
          <span className="text-[9px] font-semibold text-slate-400">
            + ₹{formatINR((isAgent ? prices.agentPayable : prices.grandTotal) - effectivePayNow)} at boarding
          </span>
        )}
      </div>
      <button
        disabled={isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers)}
        onClick={handleBookingClick}
        className={`group flex h-11 max-w-[190px] flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-[11px] font-black uppercase tracking-wider transition-all ${
          isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers)
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
            : isPartial && selectedDate ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-[0.98]' : 'bg-[#0d6e75] hover:bg-[#0b5c62] text-white shadow-md active:scale-[0.98]'
        }`}
      >
        {isProcessingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>
            {!isBookingDisabled && <Ticket className="h-3.5 w-3.5 shrink-0 stroke-[2.6]" />}
            <span>{ctaText}</span>
          </>
        )}
      </button>
    </div>
  )}

  {/* ── Page-level mobile sticky bar (only outside dialog, only on mobile < lg screens) ── */}
  {layoutMode !== 'dialog' && (
    <div className="fixed bottom-[52px] sm:bottom-0 inset-x-0 bg-white border-t border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-4 z-40 lg:hidden shadow-[0_-12px_32px_rgba(15,61,86,0.14)]">
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          {!selectedDate ? 'Starting from' : isPartial ? 'Pay Now (Advance)' : 'Total Fare'}
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className={`text-lg sm:text-xl font-black tracking-tight ${isPartial && selectedDate ? 'text-amber-600' : 'text-[#0d6e75]'}`}>
            ₹{formatINR(selectedDate ? effectivePayNow : (prices.grandTotal || startingPrice || 0))}
          </span>
          {isPartial && selectedDate && (
            <span className="text-[9px] font-bold text-slate-400">({paymentPercentage}%)</span>
          )}
        </div>
        {isPartial && selectedDate && (
          <span className="text-[9px] font-semibold text-slate-400">
            + ₹{formatINR((isAgent ? prices.agentPayable : prices.grandTotal) - effectivePayNow)} balance at boarding
          </span>
        )}
      </div>

      <button
        disabled={isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers)}
        onClick={handleBookingClick}
        className={`group h-11 shrink-0 rounded-xl px-5 text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
          isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers)
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
            : isPartial && selectedDate ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:-translate-y-0.5 active:scale-[0.98]' : 'bg-[#0d6e75] hover:bg-[#0b5c62] text-white shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
        }`}
      >
        {isProcessingCheckout ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        ) : (!isAdmin && minPassengers > 1 && totalPassengers < minPassengers) ? `Min ${minPassengers} pax` : (
          <>
            <Ticket className="h-3.5 w-3.5 shrink-0 stroke-[2.6]" />
            Book Now
            <ArrowRight className="h-3.5 w-3.5 shrink-0 stroke-[3] transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </div>
  )}

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
        adults={adults}
        children={isStudentPackage ? 0 : children}
        isProcessing={isProcessingCheckout}
        targetType="package"
        isStudentPackage={isStudentPackage}
      />

      <style jsx global>{`
        .rdp-root {
          --rdp-accent-color: #0d6e75;
          --rdp-accent-background-color: #dcfce7;
          --rdp-day-width: 40px;
          --rdp-day-height: 40px;
          --rdp-day_button-width: 40px;
          --rdp-day_button-height: 40px;
          --rdp-day_button-border-radius: 999px;
          width: 100%;
          color: #0f3d56;
        }

        .rdp,
        [data-slot="calendar"] {
          width: 100%;
        }

        .rdp-months,
        [data-slot="calendar"] .rdp-months {
          width: 100%;
        }

        .rdp-month,
        [data-slot="calendar"] .rdp-month {
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(13, 110, 117, 0.18);
          background:
            radial-gradient(circle at 92% 8%, rgba(255, 183, 3, 0.14), transparent 28%),
            linear-gradient(180deg, #ffffff 0%, #f8fcfc 100%);
          box-shadow: 0 18px 46px rgba(15, 61, 86, 0.1);
          padding: 16px;
        }

        .rdp-month_caption {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          margin-bottom: 8px;
        }

        .rdp-caption_label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          border-radius: 999px;
          background: #f0fbfb;
          padding: 0 14px;
          color: #0f3d56;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 0;
          text-transform: uppercase;
          box-shadow: inset 0 0 0 1px rgba(13, 110, 117, 0.1);
        }

        .rdp-caption,
        [data-slot="calendar"] .rdp-caption {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          margin-bottom: 8px;
          color: #0f3d56;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .rdp-nav,
        [data-slot="calendar"] .rdp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          inset: 16px 16px auto 16px;
          height: 36px;
          pointer-events: none;
        }

        .rdp-nav_button,
        .rdp-button_previous,
        .rdp-button_next,
        [data-slot="calendar"] .rdp-nav_button {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(13, 110, 117, 0.14);
          background: #ffffff;
          color: #0d6e75;
          box-shadow: 0 8px 18px rgba(15, 61, 86, 0.08);
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
          pointer-events: auto;
        }

        .rdp-nav_button:hover,
        .rdp-button_previous:hover,
        .rdp-button_next:hover,
        [data-slot="calendar"] .rdp-nav_button:hover {
          transform: translateY(-1px);
          border-color: rgba(13, 110, 117, 0.34);
          background: #f0fbfb;
        }

        .rdp-table,
        .rdp-month_grid,
        [data-slot="calendar"] .rdp-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 7px;
          table-layout: fixed;
        }

        .rdp-head_cell,
        .rdp-weekday,
        [data-slot="calendar"] .rdp-head_cell {
          padding-bottom: 5px;
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .rdp-cell,
        [data-slot="calendar"] .rdp-cell {
          padding: 0;
          text-align: center;
        }

        .rdp-day,
        [data-slot="calendar"] .rdp-day {
          width: 40px;
          height: 40px;
        }

        .rdp-day_button {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border-radius: 999px;
          border: 1px solid rgba(16, 185, 129, 0.32);
          background: linear-gradient(180deg, #ecfdf5 0%, #dcfce7 100%);
          color: #047857;
          font-size: 12px;
          font-weight: 900;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .rdp-day:not(.rdp-day_disabled):hover,
        .rdp-day_button:not([disabled]):hover,
        [data-slot="calendar"] .rdp-day:not([disabled]):hover {
          transform: translateY(-1px);
          border-color: rgba(13, 110, 117, 0.34);
          background: linear-gradient(180deg, #d1fae5 0%, #bbf7d0 100%);
          box-shadow: 0 9px 20px rgba(16, 185, 129, 0.22);
        }

        .rdp-day_selected,
        .rdp-day_selected:hover,
        .rdp-selected .rdp-day_button,
        .rdp-selected .rdp-day_button:hover,
        [data-slot="calendar"] [aria-selected="true"] {
          border-color: #0d6e75 !important;
          background: linear-gradient(180deg, #0f7d84 0%, #0b5c62 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 12px 26px rgba(13, 110, 117, 0.32);
        }

        .rdp-day_today:not(.rdp-day_selected),
        .rdp-today .rdp-day_button:not([aria-selected="true"]),
        [data-slot="calendar"] [data-today="true"]:not([aria-selected="true"]) {
          border-color: rgba(255, 159, 28, 0.55);
          background: linear-gradient(180deg, #fff7e6 0%, #ffedd5 100%);
          color: #9a5800;
        }

        .rdp-day_disabled,
        .rdp-disabled .rdp-day_button,
        [data-slot="calendar"] .rdp-day[disabled],
        [data-slot="calendar"] button[disabled] {
          border-color: transparent !important;
          background: #f4f7f9 !important;
          color: #cbd5e1 !important;
          box-shadow: none !important;
          cursor: not-allowed;
          opacity: 1;
        }

        .rdp-outside .rdp-day_button {
          background: transparent !important;
          color: #dbe3ea !important;
        }

        @media (max-width: 640px) {
          .rdp-month,
          [data-slot="calendar"] .rdp-month {
            padding: 10px;
            border-radius: 14px;
          }

          .rdp-table,
          .rdp-month_grid,
          [data-slot="calendar"] .rdp-table {
            border-spacing: 4px;
          }

          .rdp-day,
          .rdp-day_button,
          [data-slot="calendar"] .rdp-day {
            width: 34px;
            height: 34px;
            font-size: 11px;
          }
        }
      `}</style>

      <BusWarningModal
        isOpen={showBusWarningModal}
        onClose={() => setShowBusWarningModal(false)}
        onConfirm={handleAgreeBusWarning}
      />
    </div>
  </div>
  );
};
