'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CalendarDays, AlertTriangle, XCircle, CheckCircle2, Loader2, Info, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, PublicDateAvailability } from '@/stores/inventoryStore';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { apiClient } from '@/lib/api';
import CheckoutPassengerModal from '@/components/checkout/CheckoutPassengerModal';

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
  minPassengers?: number;
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
  return Number(value || 0).toLocaleString('en-IN');
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
  minPassengers = 1
}: BookingSidebarV2Props) => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { publicAvailability, publicLoading, fetchPublicAvailability } = useInventoryStore();
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

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
      (v) => v.title && v.title.trim() !== '' && Number(v.adult_price) > 0
    );
  }, [variants]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
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
  const [currentMonthStr, setCurrentMonthStr] = useState(toYYYYMM(today));
  const [adults, setAdults] = useState<number>(Math.max(1, minPassengers));
  const [children, setChildren] = useState<number>(0);
  const [paymentPercentage, setPaymentPercentage] = useState(100);
  // Custom pay-now amount in rupees (null = full payment)
  const [customPayAmount, setCustomPayAmount] = useState<string>('');

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
          fetchPublicAvailability(packageSlug, currentMonthStr);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse entity event payload', err);
      }
    };

    sse.addEventListener('INVENTORY_UPDATE', handleUpdate);
    sse.addEventListener('ENTITY_STATUS_UPDATE', handleEntityUpdate);

    return () => {
      sse.removeEventListener('INVENTORY_UPDATE', handleUpdate);
      sse.removeEventListener('ENTITY_STATUS_UPDATE', handleEntityUpdate);
      sse.close();
    };
  }, [packageId]);

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

  const selectedSlot = useMemo<PublicDateAvailability | null>(() => {
    if (!selectedDate || !publicAvailability || selectedVariantId === null) return null;
    return publicAvailability.dates.find(
      (d) => d.date === selectedDate && d.variant_id === selectedVariantId
    ) ?? null;
  }, [selectedDate, selectedVariantId, publicAvailability]);

  const selectedVariant = useMemo(() => {
    if (selectedVariantId === null) return validVariants[0];
    return validVariants.find((v) => v.id === selectedVariantId) ?? validVariants[0];
  }, [validVariants, selectedVariantId]);

  const isPackageInactive = !publicLoading && !publicAvailability;

  const availabilityState = useMemo(() => {
    if (publicLoading) return { kind: 'loading' as const, message: 'Checking seats...' };
    if (isPackageInactive && !isAdmin) return { kind: 'closed' as const, message: 'Bookings are closed / inactive' };
    if (!selectedDate) return { kind: 'idle' as const, message: 'Select date to check availability' };
    if (isAdmin) {
      if (selectedSlot) {
        return { kind: 'open' as const, message: `Public: ${selectedSlot.available_seats} seats (Admin: Unlimited)` };
      } else {
        return { kind: 'open' as const, message: 'Unlimited Seats (Admin Bypass)' };
      }
    }
    if (!selectedSlot) return { kind: 'unpublished' as const, message: 'Schedule not opened yet. Call to confirm.' };
    if (selectedSlot.status === 'CLOSED') return { kind: 'closed' as const, message: 'Date closed for booking' };
    if (selectedSlot.status === 'SOLD_OUT') return { kind: 'sold_out' as const, message: 'Sold out' };
    if (selectedSlot.status === 'NO_INVENTORY') return { kind: 'unpublished' as const, message: 'Schedule not opened yet. Call to confirm.' };
    if (Number(selectedSlot.available_seats || 0) <= 0) {
      return { kind: 'unpublished' as const, message: 'Seats not published yet. Call to confirm.' };
    }
    return { kind: 'open' as const, message: `${selectedSlot.available_seats} seats available` };
  }, [publicLoading, isPackageInactive, selectedDate, selectedSlot, isAdmin]);


  const isWeekendSelected = useMemo(() => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6;
  }, [selectedDate]);

  const prices = useMemo(() => {
    const isWeekend = isWeekendSelected;

    // BASE PRICING Breakdown
    let pureBaseAdult = positiveNumber(selectedVariant?.adult_price) || positiveNumber(startingPrice);
    let pureBaseChild = positiveNumber(selectedVariant?.child_price);

    let baseAdult = 0;
    let baseChild = 0;

    if (selectedSlot) {
      baseAdult = (selectedSlot.effective_adult_price !== undefined && selectedSlot.effective_adult_price !== null)
        ? Number(selectedSlot.effective_adult_price)
        : Number(selectedSlot.adult_price);
        
      baseChild = (selectedSlot.effective_child_price !== undefined && selectedSlot.effective_child_price !== null)
        ? Number(selectedSlot.effective_child_price)
        : Number(selectedSlot.child_price);
    } else {
      baseAdult = isWeekend && selectedVariant?.weekend_adult_price 
        ? positiveNumber(selectedVariant.weekend_adult_price) 
        : pureBaseAdult;
        
      baseChild = isWeekend && selectedVariant?.weekend_child_price 
        ? positiveNumber(selectedVariant.weekend_child_price) 
        : pureBaseChild;
    }

    const pureBaseSubtotal = (adults * pureBaseAdult) + (children * pureBaseChild);
    
    let weekendSurchargeSubtotal = 0;
    let expectedEffAdult = pureBaseAdult;
    let expectedEffChild = pureBaseChild;
    
    if (isWeekend) {
      expectedEffAdult = positiveNumber(selectedVariant?.weekend_adult_price) || pureBaseAdult;
      expectedEffChild = positiveNumber(selectedVariant?.weekend_child_price) || pureBaseChild;
      weekendSurchargeSubtotal = (adults * (expectedEffAdult - pureBaseAdult)) + (children * (expectedEffChild - pureBaseChild));
    }

    let surgeSubtotal = 0;
    let discountSubtotal = 0;

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

    const baseSubtotal = (adults * baseAdult) + (children * baseChild);
    
    // TRANSPORT PRICING
    let transportSubtotal = 0;
    const transportBreakdown: Array<{title: string; type: string; quantity: number; unitPrice: number; subtotal: number}> = [];
    
    if (hasTransport) {
      if (selectedTransportMode === 'SHARED' && selectedSharedOptionId) {
        const tOpt = transportOptions.find(o => o.id === selectedSharedOptionId);
        if (tOpt) {
          const tAdult = positiveNumber(isWeekend && tOpt.weekend_adult_price ? tOpt.weekend_adult_price : tOpt.adult_price);
          const tChild = positiveNumber(isWeekend && tOpt.weekend_child_price ? tOpt.weekend_child_price : tOpt.child_price);
          const cost = (adults * tAdult) + (children * tChild);
          transportSubtotal = cost;
          transportBreakdown.push({ title: tOpt.title, type: 'SHARED', quantity: 1, unitPrice: tAdult, subtotal: cost });
        }
      } else if (selectedTransportMode === 'SEPARATE') {
        for (const [optIdStr, qty] of Object.entries(separateVehicleQtys)) {
          if (!qty || qty <= 0) continue;
          const optId = Number(optIdStr);
          const tOpt = transportOptions.find(o => o.id === optId);
          if (tOpt) {
            const tFixed = positiveNumber(isWeekend && tOpt.weekend_fixed_price ? tOpt.weekend_fixed_price : tOpt.fixed_price);
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
    if (hasRefreshments && includeRefreshments) {
      refAdult = positiveNumber(refreshmentAdultPrice);
      refChild = positiveNumber(refreshmentChildPrice);
      refreshmentSubtotal = (adults * refAdult) + (children * refChild);
    }

    const rawSubtotal = baseSubtotal + transportSubtotal + refreshmentSubtotal;

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
    const commissionPercentage = user?.commission_percentage ? Number(user.commission_percentage) : 0;
    const commissionType = user?.commission_type || 'PERCENTAGE';
    const commissionFixedAmount = user?.commission_fixed_amount ? Number(user.commission_fixed_amount) : 0;

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
      baseAdult, baseChild, baseSubtotal,
      pureBaseSubtotal, weekendSurchargeSubtotal, surgeSubtotal, discountSubtotal,
      transportSubtotal, transportBreakdown,
      refreshmentSubtotal, 
      rawSubtotal, discount, subtotal, gst, gatewayFee, 
      grandTotal, agentDiscount, agentPayable 
    };
  }, [selectedSlot, selectedVariant, startingPrice, adults, children, appliedCoupon, user, isAgent, selectedDate, hasTransport, selectedTransportMode, selectedSharedOptionId, separateVehicleQtys, transportOptions, hasRefreshments, includeRefreshments, refreshmentAdultPrice, refreshmentChildPrice]);

  const { effectivePayNow, isPartial } = useMemo(() => {
    const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
    const minPayable = Math.ceil(finalTotal * 0.35);
    const parsedCustom = parseInt(customPayAmount, 10);
    const payNow = isNaN(parsedCustom) || customPayAmount === ''
      ? finalTotal
      : Math.min(finalTotal, Math.max(minPayable, parsedCustom));
    return {
      effectivePayNow: payNow,
      isPartial: payNow < finalTotal
    };
  }, [prices.agentPayable, prices.grandTotal, customPayAmount, isAgent]);

  // Adjust custom pay amount when total price changes (e.g., removing a passenger)
  useEffect(() => {
    setCustomPayAmount(prev => {
      if (prev === '') return prev;
      const parsed = parseInt(prev, 10);
      const finalTotal = isAgent ? prices.agentPayable : prices.grandTotal;
      const minPayable = Math.ceil(finalTotal * 0.35);
      if (!isNaN(parsed)) {
        if (parsed >= finalTotal) return '';
        if (parsed < minPayable) return String(minPayable);
      }
      return prev;
    });
  }, [prices.grandTotal, prices.agentPayable, isAgent]);

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
          ticket_count: adults + children
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
        ticket_count: adults + children
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
  const separateCapacityOk = useMemo(() => {
    if (selectedTransportMode !== 'SEPARATE') return true;
    const totalPax = adults + children;
    const totalCapacity = separateOptions.reduce((sum, opt) => {
      const qty = separateVehicleQtys[opt.id] || 0;
      return sum + qty * (positiveNumber(opt.capacity) || 1);
    }, 0);
    const hasAnyVehicle = Object.values(separateVehicleQtys).some(q => q > 0);
    if (!hasAnyVehicle) return true; // No vehicle selected yet — don't block
    return totalCapacity >= totalPax;
  }, [selectedTransportMode, separateVehicleQtys, separateOptions, adults, children]);

  const isBookingDisabled =
    !isAuthenticated ||
    (!isAdmin && isPackageInactive) ||
    validVariants.length === 0 ||
    !selectedDate ||
    !separateCapacityOk ||
    (!isAdmin && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out'));

  const ctaText = useMemo(() => {
    if (isProcessingCheckout) return 'Processing...';
    if (isPackageInactive && !isAdmin) return 'Bookings Closed / Inactive';
    if (validVariants.length === 0) return 'Fare updating';
    if (!isAuthenticated) return 'Login to Book';
    if (!selectedDate) return 'Select a date';
    if (!separateCapacityOk) return '⚠ Add more vehicles';
    if (isAdmin) return 'Book Now (Admin)';
    if (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out') return 'Unavailable';
    if (availabilityState.kind === 'open') return 'Book Now';
    return 'Call to confirm availability';
  }, [isProcessingCheckout, isPackageInactive, isAdmin, validVariants.length, isAuthenticated, selectedDate, separateCapacityOk, availabilityState.kind]);

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
    // Only auto-clear if we ACTUALLY had a selected date and it just became invalid
    if (selectedDate && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out')) {
      setSelectedDate('');
      toast.error(availabilityState.message || 'Selected date is no longer available.', { duration: 5000 });
    }
  }, [selectedDate, availabilityState.kind, availabilityState.message, isAdmin]);

  const handleBookingClick = (e: React.MouseEvent) => {
    if (isPackageInactive && !isAdmin) return;
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginPrompt(true);
      return;
    }
    setShowPassengerModal(true);
  };

  const handleCheckoutSubmit = async (passengers: any[], quickBooking: boolean = false, customerEmail?: string) => {
    setIsProcessingCheckout(true);
    try {
      if (isAdmin) {
        const adminPayload = {
          target_type: 'package',
          travel_date: selectedDate,
          quantity: adults + children,
          adult_count: adults,
          child_count: children,
          variant_id: selectedVariantId,
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
        router.push(`/admin/bookings`);
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
        adult_count: adults,
        child_count: children,
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
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const cfMode = isLocal ? 'sandbox' : 'production';
        const cashfree = (window as any).Cashfree({ mode: cfMode });
        cashfree.checkout({
          paymentSessionId: checkout_data.payment_session_id,
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
      let isDisabled = isPast;

      if (isAdmin) {
        dayStatus = 'available';
        isDisabled = false;
      } else if (publicAvailability) {
        const slot = publicAvailability.dates.find(d => d.date === dateStr && d.variant_id === selectedVariantId);
        if (slot) {
          if (slot.status === 'CLOSED' || slot.status === 'SOLD_OUT' || slot.status === 'NO_INVENTORY' || slot.available_seats <= 0) {
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
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">
              {prices.baseAdult > 0 ? `₹${formatINR(prices.baseAdult)}` : 'Fare updating'}
            </span>
            {prices.baseAdult > 0 && <span className="text-xs font-semibold text-white/70">per adult</span>}

            {/* Price Override Badge */}
            {(() => {
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
            })()}
          </div>
        </div>

        <div className="relative space-y-3 p-0 lg:p-5 lg:pr-6 lg:pb-5">

          {/* Active Booking Inactive Warning Banner */}
          {isPackageInactive && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs text-rose-600 font-bold flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-black">Online Bookings Suspended</p>
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
                disabled={(isPackageInactive && !isAdmin) || validVariants.length === 0}
                onClick={() => { setVariantMenuOpen(!variantMenuOpen); setDateMenuOpen(false); }}
                className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
                  (isPackageInactive && !isAdmin) || validVariants.length === 0
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
                              Adult ₹{Number(variant.adult_price).toLocaleString('en-IN')} / Child ₹{Number(variant.child_price).toLocaleString('en-IN')}
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
                disabled={(isPackageInactive && !isAdmin) || validVariants.length === 0}
                onClick={() => { setDateMenuOpen(!dateMenuOpen); setVariantMenuOpen(false); }}
                className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold shadow-sm transition-all outline-none cursor-pointer ${
                  (isPackageInactive && !isAdmin) || validVariants.length === 0
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
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-100 bg-white shadow-xl w-[calc(100vw-32px)] sm:w-[330px] origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                  {renderCalendar()}
                </div>
              )}
            </div>
          </div>

          {/* Live Availability Status */}
          {selectedDate && (
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Adults (11+)</label>
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                <button type="button" disabled={(isPackageInactive && !isAdmin)} onClick={() => setAdults(p => Math.max(1, p - 1))} className={`h-8 w-8 rounded font-bold transition ${(isPackageInactive && !isAdmin) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                <span className="text-sm font-semibold">{adults}</span>
                <button type="button" disabled={(isPackageInactive && !isAdmin) || (!isAdmin && Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setAdults(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${(isPackageInactive && !isAdmin) || (!isAdmin && Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Children (4-10)</label>
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                <button type="button" disabled={(isPackageInactive && !isAdmin)} onClick={() => setChildren(p => Math.max(0, p - 1))} className={`h-8 w-8 rounded font-bold transition ${(isPackageInactive && !isAdmin) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                <span className="text-sm font-semibold">{children}</span>
                <button type="button" disabled={(isPackageInactive && !isAdmin) || (!isAdmin && Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setChildren(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${(isPackageInactive && !isAdmin) || (!isAdmin && Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
              </div>
            </div>
          </div>


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
                    disabled={(isPackageInactive && !isAdmin)}
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
                    disabled={(isPackageInactive && !isAdmin)}
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
                    const tAdultUi = positiveNumber(isWeekendSelected && opt.weekend_adult_price ? opt.weekend_adult_price : opt.adult_price);
                    const tChildUi = positiveNumber(isWeekendSelected && opt.weekend_child_price ? opt.weekend_child_price : opt.child_price);
                    const extraCost = (adults * tAdultUi) + (children * tChildUi);
                    const isSelected = selectedSharedOptionId === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-[#1a6b7a]/40'}`}
                      >
                        <input
                          type="radio"
                          name="sharedTransport"
                          checked={isSelected}
                          onChange={() => setSelectedSharedOptionId(opt.id)}
                          disabled={(isPackageInactive && !isAdmin)}
                          className="mt-1 text-[#1a6b7a] focus:ring-[#1a6b7a] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                            {opt.title}{opt.capacity ? ` · ${opt.capacity} Seater` : ''}
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              ₹{formatINR(positiveNumber(isWeekendSelected && opt.weekend_adult_price ? opt.weekend_adult_price : opt.adult_price))}/adult · ₹{formatINR(positiveNumber(isWeekendSelected && opt.weekend_child_price ? opt.weekend_child_price : opt.child_price))}/child
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
                    const qty = separateVehicleQtys[opt.id] || 0;
                    const fixedPrice = positiveNumber(opt.fixed_price);
                    const lineTotal = qty * fixedPrice;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border transition-all ${qty > 0 ? 'border-[#1a6b7a] bg-[#1a6b7a]/5 shadow-sm' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{opt.title}</div>
                            <div className="text-[10px] font-semibold mt-0.5 text-slate-500">
                              Max {opt.capacity} pax · <span className="text-[#1a6b7a]">₹{formatINR(positiveNumber(isWeekendSelected && opt.weekend_fixed_price ? opt.weekend_fixed_price : opt.fixed_price))}/vehicle</span>
                            </div>
                          </div>
                          {/* Qty Selector */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={isPackageInactive || qty <= 0}
                              onClick={() => setSeparateVehicleQtys(prev => ({ ...prev, [opt.id]: Math.max(0, (prev[opt.id] || 0) - 1) }))}
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center font-black text-base transition-all ${qty <= 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-[#1a6b7a] text-[#1a6b7a] hover:bg-[#1a6b7a] hover:text-white'}`}
                            >−</button>
                            <span className={`w-6 text-center text-sm font-black ${qty > 0 ? 'text-[#1a6b7a]' : 'text-slate-400'}`}>{qty}</span>
                            <button
                              type="button"
                              disabled={(isPackageInactive && !isAdmin)}
                              onClick={() => setSeparateVehicleQtys(prev => ({ ...prev, [opt.id]: (prev[opt.id] || 0) + 1 }))}
                              className="h-8 w-8 rounded-lg border border-[#1a6b7a] text-[#1a6b7a] flex items-center justify-center font-black text-base transition-all hover:bg-[#1a6b7a] hover:text-white"
                            >+</button>
                          </div>
                        </div>
                        {qty > 0 && (
                          <div className="mt-2 flex justify-between items-center text-[10px] font-bold border-t border-[#1a6b7a]/20 pt-1.5">
                            <span className="text-slate-500">{qty} × ₹{formatINR(fixedPrice)}</span>
                            <span className="text-[#1a6b7a]">+₹{formatINR(lineTotal)}</span>
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
                  disabled={(isPackageInactive && !isAdmin)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">Add Refreshments</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    ₹{formatINR(refreshmentAdultPrice || 0)}/Adult, ₹{formatINR(refreshmentChildPrice || 0)}/Child
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
                disabled={isPackageInactive || validatingCoupon || appliedCoupon !== null}
                placeholder="Enter promo code"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-bold uppercase transition focus:border-[#1a6b7a] focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 h-10"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={isPackageInactive || validatingCoupon}
                  className="shrink-0 rounded-lg bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 h-10 uppercase tracking-wider"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isPackageInactive || validatingCoupon || !couponCode.trim()}
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
                <span>Base Fare <span className="text-[10px] text-slate-400">({adults}A, {children}C)</span></span>
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
                        onClick={() => { setCustomPayAmount(''); setPaymentPercentage(100); }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${customPayAmount === '' ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        Full
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (customPayAmount === '') {
                            setCustomPayAmount(String(minPayable));
                            setPaymentPercentage(35);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${customPayAmount !== '' ? 'bg-[#1a6b7a] text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        Advance
                      </button>
                    </div>

                    {/* Amount input / display */}
                    {customPayAmount !== '' ? (
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
                            else if (v >= finalTotal) setCustomPayAmount('');
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
                  {customPayAmount !== '' && parseInt(customPayAmount, 10) < minPayable && (
                    <p className="text-[10px] text-red-500 font-bold">Min advance: ₹{formatINR(minPayable)} (35%)</p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Min Passengers Warning */}
          {minPassengers > 1 && (adults + children) < minPassengers && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700 leading-relaxed">
                This package requires a minimum of <span className="font-black">{minPassengers} passengers</span> per booking. Add more passengers to proceed.
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
                  className={`flex flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    selectedGateway === 'PHONEPE'
                      ? 'border-[#5f259f] bg-[#5f259f]/5 shadow-md shadow-[#5f259f]/10 scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-[#5f259f]/40'
                  }`}
                >
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
            disabled={isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (minPassengers > 1 && (adults + children) < minPassengers)}
            onClick={handleBookingClick}
            className={`mt-5 hidden lg:flex w-full rounded-lg py-3.5 px-5 font-black text-white shadow-md transition-all text-sm uppercase tracking-wider h-12 items-center justify-center ${isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (minPassengers > 1 && (adults + children) < minPassengers)
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#1a6b7a] hover:-translate-y-0.5 hover:bg-[#13505c] hover:shadow-md'
              }`}
          >
            {isProcessingCheckout ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : ctaText}
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
          disabled={isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (minPassengers > 1 && (adults + children) < minPassengers)}
          onClick={handleBookingClick}
          className={`flex-1 rounded-xl h-11 px-4 font-black text-white text-xs uppercase tracking-wider transition-all flex items-center justify-center ${
            isProcessingCheckout || (!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated) || (minPassengers > 1 && (adults + children) < minPassengers)
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-[#1a6b7a] active:scale-95 shadow-md shadow-[#1a6b7a]/10'
          }`}
        >
          {isProcessingCheckout ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (minPassengers > 1 && (adults + children) < minPassengers) ? `Min ${minPassengers} pax` : ctaText}
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
        adults={adults}
        children={children}
        isProcessing={isProcessingCheckout}
        targetType="package"
      />
    </div>
  );
};
