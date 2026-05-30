'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CalendarDays, AlertTriangle, XCircle, CheckCircle2, Loader2, Info, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, PublicDateAvailability } from '@/stores/inventoryStore';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { apiClient } from '@/lib/api';
import { useRazorpay } from "react-razorpay";
import CheckoutPassengerModal from '@/components/checkout/CheckoutPassengerModal';

import { toast } from 'sonner';
import { ReconnectingEventSource } from '@/lib/ReconnectingEventSource';

interface PackageVariant {
  id: number;
  title: string;
  adult_price: number | string;
  child_price: number | string;
  transport_info?: string | null;
}

interface BookingSidebarV2Props {
  startingPrice?: number | string | null;
  variants: PackageVariant[];
  packageId: number;
  packageSlug: string;
  brochurePdfUrl?: string | null;
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

export const BookingSidebarV2 = ({ startingPrice, variants, packageId, packageSlug, brochurePdfUrl }: BookingSidebarV2Props) => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { publicAvailability, publicLoading, fetchPublicAvailability } = useInventoryStore();
  const { Razorpay } = useRazorpay();
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const extractObjectKey = (url: string): string | null => {
    if (!url) return null;
    if (url.startsWith('private/')) return url;
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
      if (path.startsWith('private/')) {
        return decodeURIComponent(path);
      }
    } catch (e) {
      if (url.startsWith('private/')) return url;
    }
    return null;
  };

  const handleDownloadBrochure = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!brochurePdfUrl) return;

    const rawKey = extractObjectKey(brochurePdfUrl);

    if (rawKey) {
      // Get a fresh signed URL (no Content-Disposition) purely for viewing in new tab
      let viewUrl = brochurePdfUrl;
      try {
        const response = await apiClient.post('/api/v1/documents/signed-url', { object_key: rawKey });
        viewUrl = response.data.url;
      } catch {
        // fallback to cached URL
      }

      // 1. Open the view URL in a new tab (displays the PDF, no download)
      window.open(viewUrl, '_blank');

      // 2. Immediately trigger the backend download (Content-Disposition: attachment baked in)
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/download?key=${encodeURIComponent(rawKey)}&filename=${encodeURIComponent(packageSlug + '-brochure.pdf')}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${packageSlug}-brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // No key — just open in new tab
      window.open(brochurePdfUrl, '_blank');
    }
  };


  const today = new Date(todayIST());
  const minDateStr = toYYYYMMDD(today);

  const validVariants = useMemo(() => {
    return variants.filter(
      (v) => v.title && v.title.trim() !== '' && Number(v.adult_price) > 0
    );
  }, [variants]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [currentMonthStr, setCurrentMonthStr] = useState(toYYYYMM(today));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
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
  const [variantMenuOpen, setVariantMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  // Calendar state
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-11
  const dateMenuRef = useRef<HTMLDivElement>(null);

  // Auto-select first valid variant when loaded
  useEffect(() => {
    if (validVariants.length > 0) {
      if (selectedVariantId === null || !validVariants.some(v => v.id === selectedVariantId)) {
        setSelectedVariantId(validVariants[0].id);
      }
    }
  }, [validVariants, selectedVariantId]);

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
        if (adults + children > available && available > 0) {
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
      const seats = selectedSlot ? selectedSlot.available_seats : 999;
      return { kind: 'open' as const, message: `${seats} seats (Admin Bypass)` };
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


  const prices = useMemo(() => {
    const baseAdult = selectedSlot
      ? (selectedSlot.effective_adult_price !== undefined && selectedSlot.effective_adult_price !== null
        ? Number(selectedSlot.effective_adult_price)
        : Number(selectedSlot.adult_price))
      : (positiveNumber(selectedVariant?.adult_price) || positiveNumber(startingPrice));

    const baseChild = selectedSlot
      ? (selectedSlot.effective_child_price !== undefined && selectedSlot.effective_child_price !== null
        ? Number(selectedSlot.effective_child_price)
        : Number(selectedSlot.child_price))
      : positiveNumber(selectedVariant?.child_price);

    const rawSubtotal = (adults * baseAdult) + (children * baseChild);

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
      if (commissionType === 'FIXED_AMOUNT') {
        agentDiscount = Math.min(commissionFixedAmount, grandTotal);
      } else {
        agentDiscount = Math.min(grandTotal, Math.round((subtotal * commissionPercentage) / 100));
      }
    }
    const agentPayable = Math.max(0, grandTotal - agentDiscount);

    return { baseAdult, baseChild, rawSubtotal, discount, subtotal, gst, gatewayFee, grandTotal, agentDiscount, agentPayable };
  }, [selectedSlot, selectedVariant, startingPrice, adults, children, appliedCoupon, user, isAgent]);

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

  const isBookingDisabled =
    !isAuthenticated ||
    (!isAdmin && isPackageInactive) ||
    validVariants.length === 0 ||
    !selectedDate ||
    (!isAdmin && (availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out'));

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

  const handleCheckoutSubmit = async (passengers: any[]) => {
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
          passengers: passengers.map(p => ({
            ...p,
            aadhaar: p.aadhaar || undefined,
            phone: p.phone || undefined,
          }))
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
        expected_amount: isAgent ? prices.agentPayable : prices.grandTotal
      };

      const res = await apiClient.post('/api/v1/bookings/checkout', payload);

      const { checkout_data } = res.data;

      if (!checkout_data || !checkout_data.key_id) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        setIsProcessingCheckout(false);
        return;
      }

      if (!Razorpay) {
        toast.error("Payment gateway is still loading or blocked by your browser. Please disable adblockers and try again.");
        setIsProcessingCheckout(false);
        return;
      }

      const options = {
        key: checkout_data.key_id,
        amount: checkout_data.amount,
        currency: checkout_data.currency,
        name: "TS Tours",
        description: `Booking Draft: ${checkout_data.draft_id}`,
        order_id: checkout_data.razorpay_order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await apiClient.post('/api/v1/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.status === 'success') {
              router.push(`/dashboard/bookings/${verifyRes.data.booking_id}`);
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed. If money was deducted, it will be refunded automatically or confirmed soon.");
            setIsProcessingCheckout(false);
          }
        },
        prefill: {
          name: passengers[0]?.full_name || '',
          contact: passengers[0]?.phone || ''
        },
        theme: { color: "#1a6b7a" },
        modal: {
          ondismiss: () => {
            toast.error("Payment not done, please try again");
            setIsProcessingCheckout(false);
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessingCheckout(false);
      });
      rzp.open();

      // Enforce pointer-events: auto on body/html to override Radix UI Dialog scroll lock blocking on mobile
      if (typeof document !== 'undefined') {
        document.body.style.setProperty('pointer-events', 'auto', 'important');
        document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
        let count = 0;
        const interval = setInterval(() => {
          document.body.style.setProperty('pointer-events', 'auto', 'important');
          document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
          count++;
          if (count > 30) clearInterval(interval);
        }, 100);
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
        if (err.message.includes("Razorpay is not a constructor")) {
          errMsg = "Payment gateway blocked. Please disable adblockers.";
        } else {
          errMsg = err.message;
        }
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
      const isPast = dateStr < minDateStr;
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
    <div id="booking" className="w-full my-2 lg:sticky lg:top-[140px]">
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
            {selectedDate && selectedSlot && Number(selectedVariant?.adult_price) > 0 && prices.baseAdult !== Number(selectedVariant?.adult_price) && (
              <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1 -translate-y-0.5 ${prices.baseAdult > Number(selectedVariant?.adult_price)
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                }`}>
                {prices.baseAdult > Number(selectedVariant?.adult_price) ? (
                  <>Surge +₹{formatINR(prices.baseAdult - Number(selectedVariant?.adult_price))}</>
                ) : (
                  <>Discount -₹{formatINR(Number(selectedVariant?.adult_price) - prices.baseAdult)}</>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="relative space-y-3 p-0 lg:p-5 lg:pb-5">

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
            <div className="relative">
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">Variant</label>
              <button
                type="button"
                disabled={isPackageInactive || validVariants.length === 0}
                onClick={() => { setVariantMenuOpen(!variantMenuOpen); setDateMenuOpen(false); }}
                className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-left text-xs font-bold shadow-sm transition ${isPackageInactive || validVariants.length === 0
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-900 hover:border-[#1a6b7a] focus:border-[#1a6b7a] focus:outline-none'
                  }`}
              >
                <span className="min-w-0 truncate">{selectedVariant?.title || 'Select variant'}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${variantMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {variantMenuOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg w-[calc(100vw-32px)] min-[420px]:w-[330px] origin-top-left">
                  <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
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
                          className={`flex w-full items-start justify-between gap-3 rounded-md px-3 py-2.5 text-left transition ${selected ? 'bg-[#eef8f6] text-[#0f3d56]' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-bold">{variant.title}</span>
                            <span className="mt-0.5 block text-[10px] font-semibold text-[#1a6b7a]">
                              Adult ₹{Number(variant.adult_price).toLocaleString('en-IN')} / Child ₹{Number(variant.child_price).toLocaleString('en-IN')}
                            </span>
                          </span>
                          {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1a6b7a]" /> : null}
                        </button>
                      );
                    }) : (
                      <div className="px-3 py-4 text-xs font-semibold text-amber-700">
                        Fare variants are being updated. Please call to confirm.
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
                disabled={isPackageInactive || validVariants.length === 0}
                onClick={() => { setDateMenuOpen(!dateMenuOpen); setVariantMenuOpen(false); }}
                className={`flex h-11 w-full items-center justify-between gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-left text-xs font-bold shadow-sm transition ${isPackageInactive || validVariants.length === 0
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-900 hover:border-[#1a6b7a] focus:border-[#1a6b7a] focus:outline-none'
                  }`}
              >
                <span className="truncate">{selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}</span>
                <CalendarDays className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              </button>

              {dateMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-lg border border-slate-200 bg-white shadow-lg origin-top-right w-[calc(100vw-32px)] min-[420px]:w-[330px]">
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
                <button type="button" disabled={isPackageInactive} onClick={() => setAdults(p => Math.max(1, p - 1))} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                <span className="text-sm font-semibold">{adults}</span>
                <button type="button" disabled={isPackageInactive || (Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setAdults(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive || (Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">Children (4-10)</label>
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-2 py-0.5">
                <button type="button" disabled={isPackageInactive} onClick={() => setChildren(p => Math.max(0, p - 1))} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>-</button>
                <span className="text-sm font-semibold">{children}</span>
                <button type="button" disabled={isPackageInactive || (Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats))} onClick={() => setChildren(p => p + 1)} className={`h-8 w-8 rounded font-bold transition ${isPackageInactive || (Boolean(selectedDate) && availabilityState.kind === 'open' && adults + children >= Number(selectedSlot?.available_seats)) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>+</button>
              </div>
            </div>
          </div>

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
                <span className="font-bold text-slate-800">₹{formatINR(prices.rawSubtotal)}</span>
              </div>
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
                    <span>Agent Commission ({user?.commission_type === 'FIXED_AMOUNT' ? 'Fixed' : `${user?.commission_percentage}%`})</span>
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

            {selectedDate && !isAdmin && (() => {
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
                      <div className="flex-1 text-right shrink-0">
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

          {/* CTA */}
          <button
            disabled={(!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated)}
            onClick={handleBookingClick}
            className={`mt-5 w-full rounded-lg py-3.5 px-5 font-black text-white shadow-md transition-all text-sm uppercase tracking-wider h-12 flex items-center justify-center ${(!isAdmin && isPackageInactive) || validVariants.length === 0 || (isBookingDisabled && isAuthenticated)
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#1a6b7a] hover:-translate-y-0.5 hover:bg-[#13505c] hover:shadow-md'
              }`}
          >
            {isPackageInactive && !isAdmin
              ? 'Bookings Closed / Inactive'
              : validVariants.length === 0
                ? 'Fare updating'
                : !isAuthenticated
                  ? 'Login to Book'
                  : !selectedDate
                    ? 'Select a date'
                    : isAdmin
                      ? 'Book Now (Admin)'
                      : availabilityState.kind === 'closed' || availabilityState.kind === 'sold_out'
                        ? 'Unavailable'
                        : availabilityState.kind === 'open'
                          ? 'Book Now'
                          : 'Call to confirm availability'}
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
